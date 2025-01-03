import { LLMConfig, LLMResponse, LLMError } from "./types.ts";

const defaultConfig = {
  model: "gpt-4-0125-preview",
  maxTokens: 4000, // Increased max tokens
  temperature: 0.7,
};

const createHeaders = (apiKey: string) => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${apiKey}`
});

const handleError = (error: unknown): never => {
  const llmError: LLMError = {
    code: "OPENAI_ERROR",
    message: error instanceof Error ? error.message : "Unknown error",
    provider: "openai"
  };
  throw llmError;
};

export const generateContent = async (
  prompt: string, 
  config: Partial<LLMConfig> = {}
): Promise<LLMResponse> => {
  const apiKey = config.apiKey ?? Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw { code: "NO_API_KEY", message: "Missing API key" };

  const mergedConfig = { ...defaultConfig, ...config };
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: createHeaders(apiKey),
      body: JSON.stringify({
        model: mergedConfig.model,
        max_tokens: mergedConfig.maxTokens,
        messages: [
          { 
            role: "system", 
            content: "You are a creative writing assistant. Provide complete, detailed responses."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: mergedConfig.temperature
      })
    });

    if (!response.ok) handleError(await response.text());
    
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  } catch (error) {
    handleError(error);
  }
};