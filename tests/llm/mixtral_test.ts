/// <reference lib="deno.ns" />

import { assertEquals, assertRejects, assertExists, assert } from "https://deno.land/std@0.217.0/assert/mod.ts";
import { MixtralProvider, MixtralError } from "../../mod.ts";

const provider = new MixtralProvider();

Deno.test({
  name: "Environment - GROQ_API_KEY is set",
  fn() {
    const apiKey = Deno.env.get("GROQ_API_KEY");
    assertExists(
      apiKey,
      "GROQ_API_KEY is not set in environment. Please set it before running tests."
    );
    assertEquals(
      typeof apiKey,
      "string",
      "GROQ_API_KEY should be a string"
    );
    assert(
      apiKey.length > 0,
      "GROQ_API_KEY should not be empty"
    );
  },
});

Deno.test({
  name: "Mixtral chat - API key not set",
  async fn() {
    // Temporarily clear GROQ_API_KEY
    const originalKey = Deno.env.get("GROQ_API_KEY");
    try {
      // Delete the key before the test
      await Deno.env.delete("GROQ_API_KEY");
      
      // Test that chat throws when no key is present
      await assertRejects(
        () => provider.chat("Hello"),
        MixtralError,
        "GROQ_API_KEY environment variable is not set"
      );
    } finally {
      // Restore the original API key
      if (originalKey) {
        await Deno.env.set("GROQ_API_KEY", originalKey);
      }
    }
  },
});

Deno.test({
  name: "Mixtral chat - Empty message",
  async fn() {
    await assertRejects(
      () => provider.chat(""),
      MixtralError,
      "Message cannot be empty"
    );
    await assertRejects(
      () => provider.chat("   "),
      MixtralError,
      "Message cannot be empty"
    );
  },
});

Deno.test({
  name: "Mixtral chat - Basic conversation",
  ignore: !Deno.env.get("GROQ_API_KEY"), // Skip if no API key is set
  async fn() {
    const response = await provider.chat("What is 2+2? Reply with just the number.");
    assertEquals(response.trim(), "4");
  },
}); 