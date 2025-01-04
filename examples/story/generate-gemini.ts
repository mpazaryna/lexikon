import { generateStory } from "../../core/generators/story.ts";
import { join, dirname, fromFileUrl } from "@std/path";
import { usageTracker } from "../../core/monitoring/index.ts";

// deno-lint-ignore-file no-undef
async function example1() {
  console.log("Running Example 1: Using template file and concept.txt");
  const templatePath = join(dirname(fromFileUrl(import.meta.url)), "templates", "hero-journey.txt");
  const template = await Deno.readTextFile(templatePath);
  await generateStory({
    provider: "gemini",
    temperature: 0.7,
    maxTokens: 4000,
    model: "gemini-pro",
    template,  // This will use concept.txt for the story concept
    concept: await Deno.readTextFile(join(dirname(fromFileUrl(import.meta.url)), "concept.txt"))
  });

  // Display usage statistics
  const stats = usageTracker.getUsageStats();
  console.log("\n📊 Usage Statistics:");
  console.log(`Total API calls: ${stats.totalCalls}`);
  console.log(`Success rate: ${stats.successRate.toFixed(1)}%`);
  console.log(`Average latency: ${stats.averageLatency.toFixed(0)}ms`);
  console.log(`Total tokens used: ${stats.totalTokens}`);
  console.log(`Estimated cost: $${stats.totalCost.toFixed(4)}`);
  
  if (stats.usageByProvider.gemini) {
    console.log(`Tokens used by Gemini: ${stats.usageByProvider.gemini}`);
  }
}

async function example2() {
  console.log("Running Example 2: Using dynamic template and explicit concept");
  const dynamicTemplate = `
Create a story that follows this structure:
1. Setup: A world where dreams are shared
2. Discovery: The first dream bridge connection
3. Complications: Personal boundaries and trust issues
4. Development: Learning to navigate shared consciousness
5. Resolution: Finding balance between connection and privacy

Focus on:
- Psychological impact
- Personal growth
- Relationship dynamics
- Privacy vs intimacy
`;

  await generateStory({
    provider: "gemini",
    temperature: 0.7,
    maxTokens: 4000,
    model: "gemini-pro",
    template: dynamicTemplate,  // Using the inline template instead of a file
    concept: "In a world where dreams could be shared like social media posts, a dream therapist discovers an ancient nightmare that has been secretly spreading from mind to mind..."  // Overriding concept.txt
  });

  // Display usage statistics
  const stats = usageTracker.getUsageStats();
  console.log("\n📊 Usage Statistics:");
  console.log(`Total API calls: ${stats.totalCalls}`);
  console.log(`Success rate: ${stats.successRate.toFixed(1)}%`);
  console.log(`Average latency: ${stats.averageLatency.toFixed(0)}ms`);
  console.log(`Total tokens used: ${stats.totalTokens}`);
  console.log(`Estimated cost: $${stats.totalCost.toFixed(4)}`);
  
  if (stats.usageByProvider.gemini) {
    console.log(`Tokens used by Gemini: ${stats.usageByProvider.gemini}`);
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
      console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate-gemini.ts 1");
      console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate-gemini.ts 2");
  }
} 