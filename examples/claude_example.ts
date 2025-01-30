import { Claude } from "../mod.ts";

// Example of basic chat usage
async function basicExample() {
  try {
    const response = await Claude.chat("What's the capital of France?");
    console.log("Claude's response:", response);
  } catch (error) {
    if (error instanceof Claude.ClaudeError) {
      console.error("Claude Error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

// Example of handling errors
async function errorExample() {
  try {
    // Intentionally pass an empty message to trigger an error
    await Claude.chat("");
  } catch (error) {
    if (error instanceof Claude.ClaudeError) {
      console.log("Successfully caught Claude error:", error.message);
    }
  }
}

// Run examples
if (import.meta.main) {
  console.log("Running Claude chat examples...\n");
  
  await basicExample();
  console.log("\n---\n");
  await errorExample();
}