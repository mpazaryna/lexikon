import { generateStory } from "../../core/generators/story.ts";
import { join, dirname, fromFileUrl } from "@std/path";

async function example1() {
  console.log("Running Example 1: Using template file and concept.txt");
  const templatePath = join(dirname(fromFileUrl(import.meta.url)), "templates", "hero-journey.txt");
  const template = await Deno.readTextFile(templatePath);
  await generateStory({
    provider: "claude",
    temperature: 0.7,
    maxTokens: 4000,
    model: "claude-3-opus-20240229",
    template,  // This will use concept.txt for the story concept
    concept: await Deno.readTextFile(join(dirname(fromFileUrl(import.meta.url)), "concept.txt"))
  });
}

async function example2() {
  console.log("Running Example 2: Using dynamic template and explicit concept");
  const dynamicTemplate = `
Create a story that follows this structure:
1. Setup: Introduce the world and its rules
2. Inciting Incident: A major technological breakthrough
3. Rising Action: Explore consequences and ethical dilemmas
4. Climax: A critical decision must be made
5. Resolution: Show how humanity adapts and grows

Focus on:
- Philosophical implications
- Character development
- Ethical considerations
- Social impact
`;

  await generateStory({
    provider: "claude",
    temperature: 0.7,
    maxTokens: 4000,
    model: "claude-3-opus-20240229",
    template: dynamicTemplate,  // Using the inline template instead of a file
    concept: await Deno.readTextFile(join(dirname(fromFileUrl(import.meta.url)), "concept.txt"))
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
      console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate-claude.ts 1");
      console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate-claude.ts 2");
  }
}