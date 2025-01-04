import { generateStory } from "../../core/generators/story.ts";
import { join, dirname, fromFileUrl } from "@std/path";
import { usageTracker } from "../../core/monitoring/index.ts";

// deno-lint-ignore-file no-undef
async function example1() {
  console.log("Running Example 1: Using template file and concept.txt");
  const templatePath = join(dirname(fromFileUrl(import.meta.url)), "templates", "hero-journey.txt");
  const template = await Deno.readTextFile(templatePath);
  await generateStory({
    provider: "groq",
    temperature: 0.7,
    maxTokens: 4000,
    model: "mixtral-8x7b-32768",
    template,
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
  
  if (stats.usageByProvider.groq) {
    console.log(`Tokens used by Groq: ${stats.usageByProvider.groq}`);
  }
}

async function example2() {
  console.log("Running Example 2: Using dynamic template and explicit concept");
  const dynamicTemplate = `
Create a science fiction story that follows this structure:
1. First Contact: Initial alien signal detection
2. Understanding: Decoding the message
3. Revelation: The true nature of the communication
4. Crisis: Dealing with the implications
5. Bridge: Finding common ground between species

Focus on:
- Cultural differences
- Communication challenges
- Scientific discovery
- Universal connections
`;

  await generateStory({
    provider: "groq",
    temperature: 0.7,
    maxTokens: 4000,
    model: "mixtral-8x7b-32768",
    template: dynamicTemplate,  // Using the inline template instead of a file
    concept: "When humanity's first interstellar message was answered, the response came not in radio waves or light signals, but in patterns of quantum entanglement that defied our understanding of physics..."  // Overriding concept.txt
  });

  // Display usage statistics
  const stats = usageTracker.getUsageStats();
  console.log("\n📊 Usage Statistics:");
  console.log(`Total API calls: ${stats.totalCalls}`);
  console.log(`Success rate: ${stats.successRate.toFixed(1)}%`);
  console.log(`Average latency: ${stats.averageLatency.toFixed(0)}ms`);
  console.log(`Total tokens used: ${stats.totalTokens}`);
  console.log(`Estimated cost: $${stats.totalCost.toFixed(4)}`);
  
  if (stats.usageByProvider.groq) {
    console.log(`Tokens used by Groq: ${stats.usageByProvider.groq}`);
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
      console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate-groq.ts 1");
      console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate-groq.ts 2");
  }
}