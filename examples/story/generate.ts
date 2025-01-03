import { createProvider } from "../../core/llm/factory.ts";
import { loadFile } from "../../core/context/handler.ts";
import { join, fromFileUrl, dirname } from "https://deno.land/std/path/mod.ts";
import { ensureDir } from "https://deno.land/std/fs/mod.ts";

const currentDir = dirname(fromFileUrl(import.meta.url));
const templatePath = join(currentDir, "templates", "hero-journey.txt");

const saveResponse = async (content: string, filename: string) => {
  await ensureDir("output");
  await Deno.writeTextFile(join("output", filename), content);
};

const concept = "After a series of unexplained sightings...";
const template = await loadFile(templatePath);
const llm = createProvider("claude", { temperature: 0.7, maxTokens: 4000 });

const response = await llm.generateContent(`${template}\n\nConcept: ${concept}`);
await saveResponse(response.content, "story.md");
console.log("Story generated and saved to output/story.md");