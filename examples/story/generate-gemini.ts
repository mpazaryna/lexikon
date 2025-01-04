import { generateStory } from "../../core/generators/story.ts";
import { join, dirname, fromFileUrl } from "jsr:@std/path@0.217.0";

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