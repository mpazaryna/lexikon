import { assertEquals, assertRejects } from "std/assert/mod.ts";
import { createGenerator } from "../../src/generator.ts";
import { createOpenAIClient } from "@lexikon/module-llm";

Deno.test({
  name: "LLM integration test",
  ignore: !Deno.env.get("OPENAI_API_KEY"), // Skip if no API key
  async fn(t) {
    await t.step("successfully generates content with real LLM", async () => {
      const llm = createOpenAIClient({
        apiKey: Deno.env.get("OPENAI_API_KEY") || "",
        model: "gpt-3.5-turbo"
      });

      const generator = createGenerator({ llm });
      // TODO: Add integration test implementation
    });
  }
}); 