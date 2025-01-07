import type { DomainImprover, ImprovementResult } from "./domain.ts";
import type { YogaConfig } from "../generators/yoga.ts";
import { generateYogaSequence } from "../generators/yoga.ts";

export class YogaImprover implements DomainImprover<YogaConfig> {
  async generateImprovedContent(
    config: YogaConfig,
    previousEvaluation: ImprovementResult["evaluation"]
  ): Promise<ImprovementResult> {
    const improvementPrompt = this.createImprovementPrompt(previousEvaluation);
    const enhancedConfig = {
      ...config,
      template: improvementPrompt + config.template
    };
    
    const result = await generateYogaSequence(enhancedConfig);
    return {
      content: result.content,
      evaluation: result.evaluation,
      usage: result.usage
    };
  }

  private createImprovementPrompt(previousEvaluation: ImprovementResult["evaluation"]): string {
    const improvements: string[] = [];
    
    if (previousEvaluation.criteriaScores["Sanskrit Names"]?.score < 0.5) {
      improvements.push("Include Sanskrit names for ALL yoga poses in parentheses after the English name");
    }
    
    if (previousEvaluation.criteriaScores["List Format"]?.score < 0.8) {
      improvements.push("Ensure each pose instruction is properly formatted as a bullet point with a single asterisk (*)");
    }
    
    if (previousEvaluation.criteriaScores["Safety Guidelines"]?.score < 1) {
      improvements.push("Include comprehensive safety guidelines and precautions for each section");
    }
    
    if (previousEvaluation.criteriaScores["Alignment Cues"]?.score < 1) {
      improvements.push("Provide detailed alignment cues for each pose, at least 10 throughout the sequence");
    }

    if (improvements.length === 0) {
      return "";
    }

    return `
IMPORTANT: Your previous yoga sequence needed improvements in these areas:
${improvements.map(imp => `- ${imp}`).join("\n")}

Please generate a new sequence that specifically addresses these points while maintaining the high quality in other areas.

`;
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