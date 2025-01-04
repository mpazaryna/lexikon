import type { YogaGeneratorOptions } from "../../types.ts";
import { BaseGenerator } from "./base.ts";

export class YogaGenerator extends BaseGenerator {
  protected override options: YogaGeneratorOptions & { outputFile: string };

  constructor(options: YogaGeneratorOptions) {
    const { provider, ...rest } = options;
    const baseOptions = {
      provider,
      outputFile: "yoga-sequence.md",
      level: "beginner",
      duration: "60 minutes",
      focus: "strength and flexibility",
      ...rest,
    };
    super(baseOptions);
    this.options = baseOptions;
  }

  protected buildPrompt(template: string): string {
    const { level, duration, focus } = this.options;
    return `${template}\n\nLevel: ${level}\nDuration: ${duration}\nFocus: ${focus}`;
  }
}

export async function generateYogaSequence(options: YogaGeneratorOptions): Promise<string> {
  const generator = new YogaGenerator(options);
  return await generator.generate();
} 