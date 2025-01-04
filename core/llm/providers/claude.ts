import { LLMConfig, LLMResponse, LLMError } from "../../../types.ts";

const defaultConfig = {
  model: "claude-3-sonnet-20240229",
  maxTokens: 4000,
  temperature: 0.7,
};

const createHeaders = (apiKey: string) => ({
  "Content-Type": "application/json",
  "x-api-key": apiKey,
  "anthropic-version": "2023-06-01"
});

const handleError = (error: unknown): never => {
  const llmError: LLMError = {
    code: "CLAUDE_ERROR",
    message: error instanceof Error ? error.message : "Unknown error",
    provider: "claude"
  };
  throw llmError;
};

export const generateContent = async (
  prompt: string, 
  config: Partial<LLMConfig> = {}
): Promise<LLMResponse> => {
  console.log("📡 Preparing Claude API request...");
  
  const apiKey = config.apiKey ?? Deno.env.get("ANTHROPIC_API_KEY");
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
    console.log("🔄 Sending request to Claude API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: createHeaders(apiKey),
      body: JSON.stringify({
        model: mergedConfig.model,
        max_tokens: mergedConfig.maxTokens,
        temperature: mergedConfig.temperature,
        system: "You are a creative writing assistant. Provide complete, detailed responses.",
        messages: [{ 
          role: "user", 
          content: prompt 
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      handleError(error);
    }

    const data = await response.json();
    console.log("✅ Received response from Claude API");
    
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    };
    
  } catch (error) {
    handleError(error);
  }
};