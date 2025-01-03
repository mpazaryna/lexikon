import { LLMConfig, LLMResponse, LLMError } from "../../../types.ts";

const defaultConfig = {
  model: "mixtral-8x7b-32768",
  maxTokens: 4000,
  temperature: 0.7,
};

const createHeaders = (apiKey: string) => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${apiKey}`
});

const handleError = (error: unknown): never => {
  const llmError: LLMError = {
    code: "GROQ_ERROR",
    message: error instanceof Error ? error.message : "Unknown error",
    provider: "groq"
  };
  throw llmError;
};

export const generateContent = async (
  prompt: string, 
  config: Partial<LLMConfig> = {}
): Promise<LLMResponse> => {
  console.log("📡 Preparing Groq API request...");
  
  const apiKey = config.apiKey ?? Deno.env.get("GROQ_API_KEY");
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
    console.log("🔄 Sending request to Groq API...");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

    if (!response.ok) {
      console.error("❌ API request failed:", await response.text());
      handleError(await response.text());
    }
    
    console.log("✅ Received successful response from Groq");
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  } catch (error) {
    console.error("❌ Error during API call:", error);
    handleError(error);
  }
};