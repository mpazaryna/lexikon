/// <reference lib="deno.ns" />

import { assertEquals, assertRejects, assertExists, assert } from "https://deno.land/std@0.217.0/assert/mod.ts";
import { ClaudeProvider, ClaudeError } from "../../mod.ts";

const provider = new ClaudeProvider();

Deno.test({
  name: "Environment - ANTHROPIC_API_KEY is set",
  fn() {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    assertExists(
      apiKey,
      "ANTHROPIC_API_KEY is not set in environment. Please set it before running tests."
    );
    assertEquals(
      typeof apiKey,
      "string",
      "ANTHROPIC_API_KEY should be a string"
    );
    assert(
      apiKey.length > 0,
      "ANTHROPIC_API_KEY should not be empty"
    );
    assert(
      apiKey.startsWith("sk-"),
      "ANTHROPIC_API_KEY should start with 'sk-'"
    );
  },
});

Deno.test({
  name: "Claude chat - API key not set",
  async fn() {
    // Temporarily clear ANTHROPIC_API_KEY
    const originalKey = Deno.env.get("ANTHROPIC_API_KEY");
    try {
      // Delete the key before the test
      await Deno.env.delete("ANTHROPIC_API_KEY");
      
      // Test that chat throws when no key is present
      await assertRejects(
        () => provider.chat("Hello"),
        ClaudeError,
        "ANTHROPIC_API_KEY environment variable is not set"
      );
    } finally {
      // Restore the original API key
      if (originalKey) {
        await Deno.env.set("ANTHROPIC_API_KEY", originalKey);
      }
    }
  },
});

Deno.test({
  name: "Claude chat - Empty message",
  async fn() {
    await assertRejects(
      () => provider.chat(""),
      ClaudeError,
      "Message cannot be empty"
    );
    await assertRejects(
      () => provider.chat("   "),
      ClaudeError,
      "Message cannot be empty"
    );
  },
});

Deno.test({
  name: "Claude chat - Basic conversation",
  ignore: !Deno.env.get("ANTHROPIC_API_KEY"), // Skip if no API key is set
  async fn() {
    const response = await provider.chat("What is 2+2? Reply with just the number.");
    assertEquals(response.trim(), "4");
  },
}); 