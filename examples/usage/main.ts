// Import types and generators from GitHub
import type {
  ProviderType,
  LLMConfig,
  StoryGeneratorOptions,
  YogaGeneratorOptions
} from "https://raw.githubusercontent.com/mpazaryna/lexikon/main/types.ts";

import { generateStory } from "https://raw.githubusercontent.com/mpazaryna/lexikon/main/core/generators/story.ts";
import { generateYogaSequence } from "https://raw.githubusercontent.com/mpazaryna/lexikon/main/core/generators/yoga.ts";

// Example 1: Generate a story using OpenAI
async function example1() {
  console.log("🎭 Generating a story with OpenAI...");
  await generateStory({
    provider: "openai" as ProviderType,
    temperature: 0.7,
    maxTokens: 4000,
    model: "gpt-4",
    concept: "In a world where dreams are traded like cryptocurrency, a dream banker discovers a nightmare that could crash the entire market..."
  });
}

// Example 2: Generate a yoga sequence using Claude
async function example2() {
  console.log("\n🧘‍♀️ Generating a yoga sequence with Claude...");
  await generateYogaSequence({
    provider: "claude" as ProviderType,
    temperature: 0.7,
    maxTokens: 4000,
    model: "claude-3-opus-20240229",
    level: "intermediate",
    duration: "45 minutes",
    focus: "balance and core strength"
  });
}

// Example 3: Using a custom template for story generation
async function example3() {
  console.log("\n📝 Generating a story with custom template using Groq...");
  const customTemplate = `
Create a mystery story that follows this structure:
1. The Setup: Introduce the detective and the unusual case
2. The Investigation: Follow the clues and red herrings
3. The Twist: Reveal an unexpected connection
4. The Resolution: Solve the mystery in a satisfying way

Focus on:
- Atmospheric descriptions
- Character motivations
- Clever misdirection
- Logical deductions
`;

  await generateStory({
    provider: "groq" as ProviderType,
    temperature: 0.8,
    maxTokens: 4000,
    model: "mixtral-8x7b-32768",
    template: customTemplate,
    concept: "A detective who specializes in solving crimes in virtual reality must investigate a murder that seems to have been committed by an AI..."
  });
}

// Main execution
if (import.meta.main) {
  const example = Deno.args[0];
  
  switch (example) {
    case "1":
      await example1();
      break;
    case "2":
      await example2();
      break;
    case "3":
      await example3();
      break;
    default:
      console.log("Please specify which example to run:");
      console.log("1: Generate a story with OpenAI");
      console.log("2: Generate a yoga sequence with Claude");
      console.log("3: Generate a mystery story with Groq using custom template");
      console.log("\nUsage:");
      console.log("deno run --allow-net --allow-env --allow-read --allow-write examples/usage-example.ts <example-number>");
      console.log("\nMake sure to set up your API keys as environment variables:");
      console.log("- OPENAI_API_KEY");
      console.log("- ANTHROPIC_API_KEY");
      console.log("- GROQ_API_KEY");
      console.log("- GOOGLE_API_KEY");
  }
} 