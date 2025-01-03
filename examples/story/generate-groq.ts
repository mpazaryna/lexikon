import { createProvider } from "../../core/llm/factory.ts";
import { loadFile } from "../../core/context/handler.ts";
import { join, fromFileUrl, dirname } from "https://deno.land/std/path/mod.ts";
import { ensureDir } from "https://deno.land/std/fs/mod.ts";

const currentDir = dirname(fromFileUrl(import.meta.url));
const templatePath = join(currentDir, "templates", "hero-journey.txt");

const concept = "After a series of unexplained sightings...";
const template = await loadFile(templatePath);
const llm = createProvider("groq", { 
  temperature: 0.7, 
  maxTokens: 4000,
  model: "mixtral-8x7b-32768"
});

const response = await llm.generateContent(`${template}\n\nConcept: ${concept}`);
await ensureDir("output");
await Deno.writeTextFile(join("output", "story-groq.md"), response.content);
console.log("Story generated and saved to output/story-groq.md");