import type { StoryGeneratorOptions } from "../../types.ts";
import { BaseGenerator } from "./base.ts";

export class StoryGenerator extends BaseGenerator {
  protected override options: StoryGeneratorOptions & { outputFile: string };

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

  protected buildPrompt(template: string): string {
    return `${template}\n\nConcept: ${this.options.concept}`;
  }
}

export async function generateStory(options: StoryGeneratorOptions): Promise<string> {
  const generator = new StoryGenerator(options);
  return await generator.generate();
} 