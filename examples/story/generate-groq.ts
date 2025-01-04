import { generateStory } from "../../core/generators/story.ts";
import { join, dirname, fromFileUrl } from "@std/path";

async function example1() {
  console.log("Running Example 1: Using template file and concept.txt");
  const templatePath = join(dirname(fromFileUrl(import.meta.url)), "templates", "hero-journey.txt");
  await generateStory({
    provider: "groq",
    temperature: 0.7,
    maxTokens: 4000,
    model: "mixtral-8x7b-32768",
    templatePath  // This will use concept.txt for the story concept
  });
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