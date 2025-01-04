import { generateStory } from "../../core/generators/story.ts";
import { join, dirname, fromFileUrl } from "@std/path";

async function example1() {
  console.log("Running Example 1: Using template file and concept.txt");
  const templatePath = join(dirname(fromFileUrl(import.meta.url)), "templates", "hero-journey.txt");
  await generateStory({
    provider: "openai",
    temperature: 0.7,
    maxTokens: 4000,
    model: "gpt-4",
    templatePath  // This will use concept.txt for the story concept
  });
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