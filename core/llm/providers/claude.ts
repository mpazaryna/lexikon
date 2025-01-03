import { LLMConfig, LLMResponse, LLMError } from "./types.ts";

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
  const apiKey = config.apiKey ?? Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw { code: "NO_API_KEY", message: "Missing API key" };

  const mergedConfig = { ...defaultConfig, ...config };
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: createHeaders(apiKey),
      body: JSON.stringify({
        model: mergedConfig.model,
        max_tokens: mergedConfig.maxTokens,
        system: "You are a creative writing assistant. Provide complete, detailed responses.",
        messages: [{ 
          role: "user", 
          content: prompt 
        }]
      })
    });

    if (!response.ok) handleError(await response.text());
    
    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: data.usage
    };
  } catch (error) {
    handleError(error);
  }
};