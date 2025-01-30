import { LLMFactory, LLMProviderType, ClaudeError, OpenAIError } from "../mod.ts";

// Example using a specific provider
async function singleProviderExample() {
  const claude = LLMFactory.createProvider(LLMProviderType.CLAUDE);
  
  try {
    const response = await claude.chat("What's the capital of France?");
    console.log("Claude's response:", response);
  } catch (error) {
    if (error instanceof ClaudeError) {
      console.error("Claude Error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

// Example using multiple providers
async function multiProviderExample() {
  const claude = LLMFactory.createProvider(LLMProviderType.CLAUDE);
  const openai = LLMFactory.createProvider(LLMProviderType.OPENAI);
  
  const prompt = "What is the best programming language? Answer in one word.";
  
  try {
    // Ask both AIs the same question
    const [claudeResponse, openaiResponse] = await Promise.all([
      claude.chat(prompt),
      openai.chat(prompt),
    ]);
    
    console.log("Claude says:", claudeResponse.trim());
    console.log("OpenAI says:", openaiResponse.trim());
  } catch (error) {
    if (error instanceof ClaudeError) {
      console.error("Claude Error:", error.message);
    } else if (error instanceof OpenAIError) {
      console.error("OpenAI Error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

// Example of error handling with different providers
async function errorHandlingExample() {
  const providers = [
    { name: "Claude", provider: LLMFactory.createProvider(LLMProviderType.CLAUDE) },
    { name: "OpenAI", provider: LLMFactory.createProvider(LLMProviderType.OPENAI) }
  ];
  
  for (const { name, provider } of providers) {
    try {
      // Intentionally pass an empty message to trigger an error
      await provider.chat("");
    } catch (error) {
      if (error instanceof ClaudeError || error instanceof OpenAIError) {
        console.log(`${name} error caught successfully:`, error.message);
      }
    }
  }
}

// Run examples
if (import.meta.main) {
  console.log("Running LLM examples...\n");
  
  console.log("1. Single Provider Example:");
  await singleProviderExample();
  
  console.log("\n2. Multiple Provider Example:");
  await multiProviderExample();
  
  console.log("\n3. Error Handling Example:");
  await errorHandlingExample();
} 