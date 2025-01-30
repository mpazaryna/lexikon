/// <reference lib="deno.ns" />

import { assertEquals, assertThrows } from "https://deno.land/std@0.217.0/assert/mod.ts";
import {
  LLMFactory,
  LLMProviderType,
  ClaudeProvider,
  OpenAIProvider,
} from "../../mod.ts";

Deno.test({
  name: "LLMFactory - Create Claude provider",
  fn() {
    const provider = LLMFactory.createProvider(LLMProviderType.CLAUDE);
    assertEquals(provider instanceof ClaudeProvider, true);
  },
});

Deno.test({
  name: "LLMFactory - Create OpenAI provider",
  fn() {
    const provider = LLMFactory.createProvider(LLMProviderType.OPENAI);
    assertEquals(provider instanceof OpenAIProvider, true);
  },
});

Deno.test({
  name: "LLMFactory - Invalid provider type",
  fn() {
    assertThrows(
      () => {
        // @ts-ignore - Testing invalid type
        LLMFactory.createProvider("invalid");
      },
      Error,
      "Unsupported LLM provider type: invalid"
    );
  },
});

// Integration test showing how to use multiple providers
Deno.test({
  name: "LLMFactory - Multiple providers integration",
  ignore: !(Deno.env.get("ANTHROPIC_API_KEY") && Deno.env.get("OPENAI_API_KEY")), // Skip if either API key is missing
  async fn() {
    const claude = LLMFactory.createProvider(LLMProviderType.CLAUDE);
    const openai = LLMFactory.createProvider(LLMProviderType.OPENAI);

    const prompt = "What is 2+2? Reply with just the number.";
    
    // Test both providers with the same prompt
    const claudeResponse = await claude.chat(prompt);
    const openaiResponse = await openai.chat(prompt);

    assertEquals(claudeResponse.trim(), "4");
    assertEquals(openaiResponse.trim(), "4");
  },
}); 