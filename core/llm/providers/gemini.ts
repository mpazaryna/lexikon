/**
 * @module GeminiProvider
 * @description Implementation of the Google Gemini LLM provider.
 * Provides functionality to generate content using Google's Gemini models with
 * configurable parameters for temperature and token limits.
 */

import type { LLMConfig, LLMResponse, LLMError } from "../../../types.ts";

/**
 * @constant
 * @description Default configuration for Gemini API requests
 * @property {string} model - Default Gemini model version
 * @property {number} maxTokens - Maximum tokens to generate
 * @property {number} temperature - Controls response randomness
 */
const defaultConfig = {
  model: "gemini-pro",
  maxTokens: 4000,
  temperature: 0.7,
};

/**
 * @function createHeaders
 * @param {string} apiKey - Google API key for authentication
 * @returns {Object} Headers object for Gemini API requests
 * @description Creates the necessary headers for Gemini API requests including
 * content type and API key specifications
 */
const createHeaders = (apiKey: string) => ({
  "Content-Type": "application/json",
  "x-goog-api-key": apiKey
});

/**
 * @function handleError
 * @param {unknown} error - Error object or message to process
 * @returns {never} Never returns, always throws an error
 * @throws {LLMError} Standardized error object for Gemini API errors
 * @description Processes errors from the Gemini API and converts them into
 * standardized LLMError objects for consistent error handling
 */
const handleError = (error: unknown): never => {
  const llmError: LLMError = {
    code: "GEMINI_ERROR",
    message: error instanceof Error ? error.message : "Unknown error",
    provider: "gemini"
  };
  throw llmError;
};

/**
 * @async
 * @function generateContent
 * @param {string} prompt - The input prompt for content generation
 * @param {Partial<LLMConfig>} [config={}] - Optional configuration overrides
 * @returns {Promise<LLMResponse>} Generated content and usage statistics
 * @throws {LLMError} When API key is missing or API request fails
 * @description Main function for generating content using Gemini's API.
 * Handles API key management, request configuration, and error handling.
 * Formats the request according to Gemini's API specifications.
 */
export const generateContent = async (
  prompt: string, 
  config: Partial<LLMConfig> = {}
): Promise<LLMResponse> => {
  console.log("📡 Preparing Gemini API request...");
  
  const apiKey = config.apiKey ?? Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    console.error("❌ No API key found!");
    return handleError({ code: "NO_API_KEY", message: "Missing API key" });
  }

  const mergedConfig = { ...defaultConfig, ...config };
  console.log("⚙️  Using configuration:", {
    model: mergedConfig.model,
    maxTokens: mergedConfig.maxTokens,
    temperature: mergedConfig.temperature
  });
  
  try {
    console.log("🔄 Sending request to Gemini API...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${mergedConfig.model}:generateContent`, {
      method: "POST",
      headers: createHeaders(apiKey),
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: mergedConfig.maxTokens,
          temperature: mergedConfig.temperature
        }
      })
    });

    if (!response.ok) {
      return handleError(await response.json());
    }

    const data = await response.json();
    console.log("✅ Received response from Gemini API");
    
    return {
      content: data.candidates[0].content.parts[0].text,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    };
  } catch (error) {
    return handleError(error);
  }
}; 