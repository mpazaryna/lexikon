import { generateStory } from "../../core/generators/story.ts";
import { join, dirname, fromFileUrl } from "@std/path";
import { usageTracker } from "../../core/monitoring/index.ts";

// deno-lint-ignore-file no-undef
async function example1() {
  console.log("Running Example 1: Using template file with explicit concept");
  const templatePath = join(dirname(fromFileUrl(import.meta.url)), "templates", "hero-journey.txt");
  const template = await Deno.readTextFile(templatePath);
  await generateStory({
    provider: "openai",
    temperature: 0.7,
    maxTokens: 4000,
    model: "gpt-4",
    template,
    concept: "In a world where time travel is possible but strictly regulated, a historian discovers that someone has been subtly altering historical events to prevent a future catastrophe. The changes are so minor they've gone unnoticed by the Time Authority, but their cumulative effect could rewrite the present as we know it."
  });

  // Display usage statistics
  const stats = usageTracker.getUsageStats();
  console.log("\n📊 Usage Statistics:");
  console.log(`Total API calls: ${stats.totalCalls}`);
  console.log(`Success rate: ${stats.successRate.toFixed(1)}%`);
  console.log(`Average latency: ${stats.averageLatency.toFixed(0)}ms`);
  console.log(`Total tokens used: ${stats.totalTokens}`);
  console.log(`Estimated cost: $${stats.totalCost.toFixed(4)}`);
  
  if (stats.usageByProvider.openai) {
    console.log(`Tokens used by OpenAI: ${stats.usageByProvider.openai}`);
  }
}

async function example2() {
  console.log("Running Example 2: Using dynamic template and explicit concept");
  const dynamicTemplate = `
Create a story that follows this structure:
1. Setup: Establish the ordinary world
2. Call to Adventure: An unexpected discovery
3. Challenges: Facing internal and external obstacles
4. Transformation: Character growth through trials
5. Resolution: Return with new understanding

Focus on:
- Character development
- World building
- Emotional resonance
- Theme exploration
`;

  await generateStory({
    provider: "openai",
    temperature: 0.7,
    maxTokens: 4000,
    model: "gpt-4",
    template: dynamicTemplate,  // Using the inline template instead of a file
    concept: "In a world where memories can be photographed and framed like pictures, a gallery curator discovers an ancient collection that seems to predict future events..."  // Overriding concept.txt
  });

  // Display usage statistics
  const stats = usageTracker.getUsageStats();
  console.log("\n📊 Usage Statistics:");
  console.log(`Total API calls: ${stats.totalCalls}`);
  console.log(`Success rate: ${stats.successRate.toFixed(1)}%`);
  console.log(`Average latency: ${stats.averageLatency.toFixed(0)}ms`);
  console.log(`Total tokens used: ${stats.totalTokens}`);
  console.log(`Estimated cost: $${stats.totalCost.toFixed(4)}`);
  
  if (stats.usageByProvider.openai) {
    console.log(`Tokens used by OpenAI: ${stats.usageByProvider.openai}`);
  }
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
    default:
      console.log("Please specify which example to run:");
      console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate-openai.ts 1");
      console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate-openai.ts 2");
  }
}