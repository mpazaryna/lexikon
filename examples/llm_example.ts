import { LLMFactory, LLMProviderType, ClaudeError, OpenAIError, MixtralError, GeminiError } from "../mod.ts";

// Example using factory pattern to create and use any provider
async function providerExample(type: LLMProviderType) {
  const provider = LLMFactory.createProvider(type);
  try {
    console.log(`\n=== ${type.toUpperCase()} ===`);
    const response = await provider.chat("What's the capital of France?");
    console.log(`Response: ${response}`);
    console.log("=".repeat(20));
  } catch (error) {
    if (error instanceof ClaudeError || 
        error instanceof OpenAIError || 
        error instanceof MixtralError ||
        error instanceof GeminiError) {
      console.error(`${type} Error:`, error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    console.log("=".repeat(20));
  }
}

// Example using multiple providers through factory
async function multiProviderExample() {
  const providers = Object.values(LLMProviderType).map(type => ({
    type,
    provider: LLMFactory.createProvider(type)
  }));
  
  const prompt = "What is the best programming language? Answer in one word.";
  console.log("\nPrompt:", prompt);
  console.log("=".repeat(50));
  
  try {
    const responses = await Promise.all(
      providers.map(({ type, provider }) => 
        provider.chat(prompt)
          .then(response => ({ type, response: response.trim() }))
          .catch(error => ({ type, error }))
      )
    );
    
    responses.forEach(({ type, response, error }) => {
      if (error) {
        console.error(`${type.padEnd(10)} │ Error: ${error.message}`);
      } else {
        console.log(`${type.padEnd(10)} │ ${response}`);
      }
      console.log("-".repeat(50));
    });
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run examples
if (import.meta.main) {
  console.log("=".repeat(50));
  console.log("Running LLM Examples");
  console.log("=".repeat(50));
  
  console.log("\n1. Single Provider Examples");
  console.log("-".repeat(25));
  for (const type of Object.values(LLMProviderType)) {
    await providerExample(type);
  }
  
  console.log("\n2. Multiple Provider Example");
  console.log("-".repeat(25));
  await multiProviderExample();
  
  console.log("\nDone!");
  console.log("=".repeat(50));
} 