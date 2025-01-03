import { LLMConfig, LLMResponse, LLMError } from "../../../types.ts";

const defaultConfig = {
  model: "gemini-pro",
  maxTokens: 4000,
  temperature: 0.7,
};

const createHeaders = (apiKey: string) => ({
  "Content-Type": "application/json",
  "x-goog-api-key": apiKey
});

const handleError = (error: unknown): never => {
  const llmError: LLMError = {
    code: "GEMINI_ERROR",
    message: error instanceof Error ? error.message : "Unknown error",
    provider: "gemini"
  };
  throw llmError;
};

export const generateContent = async (
  prompt: string, 
  config: Partial<LLMConfig> = {}
): Promise<LLMResponse> => {
  console.log("📡 Preparing Gemini API request...");
  
  const apiKey = config.apiKey ?? Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    console.error("❌ No API key found!");
    throw { code: "NO_API_KEY", message: "Missing API key" };
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
          temperature: mergedConfig.temperature,
        }
      })
    });

    if (!response.ok) {
      console.error("❌ API request failed:", await response.text());
      handleError(await response.text());
    }
    
    console.log("✅ Received successful response from Gemini");
    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    };
  } catch (error) {
    console.error("❌ Error during API call:", error);
    handleError(error);
  }
}; 