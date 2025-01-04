import { join, dirname, fromFileUrl } from "@std/path";
import { loadFile } from "../context/handler.ts";
import type { StoryGeneratorOptions } from "../../types.ts";
import { BaseGenerator } from "./base.ts";

export class StoryGenerator extends BaseGenerator {
  protected options: StoryGeneratorOptions & { outputFile: string };

  constructor(options: StoryGeneratorOptions) {
    const { provider, ...rest } = options;
    const baseOptions = {
      provider,
      outputFile: `story-${provider}.md`,
      ...rest,
    };
    super(baseOptions);
    this.options = baseOptions;
  }

  private async loadConcept(): Promise<string> {
    if (this.options.concept) {
      return this.options.concept;
    }
    
    const conceptPath = join(dirname(fromFileUrl(import.meta.url)), "../../examples/story/concept.txt");
    console.log("📖 Loading concept from file...");
    const concept = await loadFile(conceptPath);
    console.log("✅ Concept loaded successfully");
    return concept.trim();
  }

  protected async buildPrompt(template: string): Promise<string> {
    const concept = await this.loadConcept();
    return `${template}\n\nConcept: ${concept}`;
  }
}

export async function generateStory(options: StoryGeneratorOptions): Promise<string> {
  const generator = new StoryGenerator(options);
  return generator.generate();
} 