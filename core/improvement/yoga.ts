import type { DomainImprover, ImprovementResult } from "./domain.ts";
import type { YogaConfig } from "../generators/yoga.ts";
import { generateImprovedYogaSequence } from "../generators/yoga.ts";

export class YogaImprover implements DomainImprover<YogaConfig> {
  async generateImprovedContent(
    config: YogaConfig,
    previousEvaluation: ImprovementResult["evaluation"]
  ): Promise<ImprovementResult> {
    const result = await generateImprovedYogaSequence(config, previousEvaluation);
    return {
      content: result.content,
      evaluation: result.evaluation,
      usage: result.usage
    };
  }

  parseEvaluation(content: string): ImprovementResult["evaluation"] {
    const overallScore = parseFloat(content.match(/Overall Score: ([\d.]+)%/)?.[1] ?? "0") / 100;
    const criteriaScores: Record<string, { score: number; details: string[] }> = {};
    
    // Extract criteria scores from the evaluation content
    const sections = content.split("###");
    for (const section of sections) {
      const match = section.match(/([^:\n]+):\s*([\d.]+)%/);
      if (match) {
        const [_, name, score] = match;
        criteriaScores[name.trim()] = {
          score: parseFloat(score) / 100,
          details: []
        };
      }
    }

    return {
      overallScore,
      recommendations: [],
      criteriaScores,
      domainSpecificMetrics: {}
    };
  }
} 