/// <reference lib="deno.ns" />

import { LLMProvider } from "../types.ts";

/**
 * Gemini-specific implementation
 */

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

export class GeminiError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GeminiError";
  }
}

interface DenoError extends Error {
  name: string;
}

export class GeminiProvider implements LLMProvider {
  /**
   * Send a message to Gemini and get a response
   * @param message The message to send to Gemini
   * @returns The response from Gemini
   */
  async chat(message: string): Promise<string> {
    try {
      const apiKey = Deno.env.get("GOOGLE_API_KEY");
      if (!apiKey) {
        throw new GeminiError("GOOGLE_API_KEY environment variable is not set");
      }

      if (!message.trim()) {
        throw new GeminiError("Message cannot be empty");
      }

      const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7
          }
        }),
      });

      if (!response.ok) {
        throw new GeminiError(`Request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      // Wrap any Deno permission errors
      if (error instanceof Error && error.name === "NotCapable") {
        throw new GeminiError("Missing required permissions. Run with --allow-env and --allow-net flags");
      }
      throw error;
    }
  }
} 