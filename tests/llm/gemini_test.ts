/// <reference lib="deno.ns" />

import { assertEquals, assertRejects, assertExists, assert } from "https://deno.land/std@0.217.0/assert/mod.ts";
import { GeminiProvider, GeminiError } from "../../mod.ts";

const provider = new GeminiProvider();

Deno.test({
  name: "Environment - GOOGLE_API_KEY is set",
  fn() {
    const apiKey = Deno.env.get("GOOGLE_API_KEY");
    assertExists(
      apiKey,
      "GOOGLE_API_KEY is not set in environment. Please set it before running tests."
    );
    assertEquals(
      typeof apiKey,
      "string",
      "GOOGLE_API_KEY should be a string"
    );
    assert(
      apiKey.length > 0,
      "GOOGLE_API_KEY should not be empty"
    );
  },
});

Deno.test({
  name: "Gemini chat - API key not set",
  async fn() {
    // Temporarily clear GOOGLE_API_KEY
    const originalKey = Deno.env.get("GOOGLE_API_KEY");
    try {
      // Delete the key before the test
      await Deno.env.delete("GOOGLE_API_KEY");
      
      // Test that chat throws when no key is present
      await assertRejects(
        () => provider.chat("Hello"),
        GeminiError,
        "GOOGLE_API_KEY environment variable is not set"
      );
    } finally {
      // Restore the original API key
      if (originalKey) {
        await Deno.env.set("GOOGLE_API_KEY", originalKey);
      }
    }
  },
});

Deno.test({
  name: "Gemini chat - Empty message",
  async fn() {
    await assertRejects(
      () => provider.chat(""),
      GeminiError,
      "Message cannot be empty"
    );
    await assertRejects(
      () => provider.chat("   "),
      GeminiError,
      "Message cannot be empty"
    );
  },
});

Deno.test({
  name: "Gemini chat - Basic conversation",
  ignore: !Deno.env.get("GOOGLE_API_KEY"), // Skip if no API key is set
  async fn() {
    const response = await provider.chat("What is 2+2? Reply with just the number.");
    assertEquals(response.trim(), "4");
  },
}); 