import { createProvider } from "../../core/llm/factory.ts";
import { loadFile } from "../../core/context/handler.ts";
import { join, fromFileUrl, dirname } from "https://deno.land/std/path/mod.ts";
import { ensureDir } from "https://deno.land/std/fs/mod.ts";

const currentDir = dirname(fromFileUrl(import.meta.url));
const templatePath = join(currentDir, "templates", "hatha.txt");

const level = "beginner";
const duration = "60 minutes";
const focus = "strength and flexibility";

const template = await loadFile(templatePath);
const llm = createProvider("openai", { 
  temperature: 0.7, 
  maxTokens: 4000,
  model: "gpt-4-0125-preview"
});

const prompt = `${template}\n\nLevel: ${level}\nDuration: ${duration}\nFocus: ${focus}`;
const response = await llm.generateContent(prompt);
await ensureDir("output");
await Deno.writeTextFile(join("output", "yoga-sequence.md"), response.content);
console.log("Yoga sequence generated and saved to output/yoga-sequence.md");