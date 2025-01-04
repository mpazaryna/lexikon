import { generateYogaSequence } from "../../core/generators/yoga.ts";
import { join, dirname, fromFileUrl } from "@std/path";

async function example1() {
  console.log("Running Example 1: Using template file with level, duration, and focus");
  const templatePath = join(dirname(fromFileUrl(import.meta.url)), "templates", "yogaclass.txt");
  await generateYogaSequence({
    provider: "openai",
    temperature: 0.7,
    maxTokens: 4000,
    model: "gpt-4",
    level: "intermediate",
    duration: "60 minutes",
    focus: "strength and flexibility",
    templatePath
  });
}

async function example2() {
  console.log("Running Example 2: Using dynamic template with specific practice focus");
  const dynamicTemplate = `
Design a yoga sequence that emphasizes:

1. Breath Work (10 minutes)
   - Pranayama techniques
   - Breath awareness exercises
   - Energy activation

2. Dynamic Movement (20 minutes)
   - Flowing sequences
   - Creative transitions
   - Building internal heat

3. Peak Poses (20 minutes)
   - Progressive preparation
   - Advanced variations
   - Safe approach to challenges

4. Integration (10 minutes)
   - Counter poses
   - Balancing the practice
   - Cooling down

Include for each section:
- Clear timing
- Detailed instructions
- Breath coordination
- Energetic effects
- Safety considerations
`;

  await generateYogaSequence({
    provider: "openai",
    temperature: 0.7,
    maxTokens: 4000,
    model: "gpt-4",
    level: "advanced",
    duration: "60 minutes",
    focus: "inversions and arm balances",
    template: dynamicTemplate
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
      console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/yoga/generate-openai.ts 1");
      console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/yoga/generate-openai.ts 2");
  }
}