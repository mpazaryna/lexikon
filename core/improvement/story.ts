import type { DomainImprover, ImprovementResult } from "./domain.ts";
import type { StoryConfig } from "../generators/story.ts";
import { generateStory } from "../generators/story.ts";

export class StoryImprover implements DomainImprover<StoryConfig> {
  async generateImprovedContent(
    config: StoryConfig,
    previousEvaluation: ImprovementResult["evaluation"]
  ): Promise<ImprovementResult> {
    const improvementPrompt = this.createImprovementPrompt(previousEvaluation);
    const enhancedConfig = {
      ...config,
      template: improvementPrompt + config.template
    };
    
    const result = await generateStory(enhancedConfig);
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

  private createImprovementPrompt(evaluation: ImprovementResult["evaluation"]): string {
    const improvements: string[] = [];
    
    if (evaluation.criteriaScores["Character Development"]?.score < 0.8) {
      improvements.push("Provide detailed descriptions for ALL main characters, including their motivations and unique traits");
    }
    
    if (evaluation.criteriaScores["Required Sections"]?.score < 1) {
      improvements.push("Ensure all required sections are present: Title, Main Characters, Plot Summary, and Key Themes");
    }
    
    if (evaluation.criteriaScores["List Format"]?.score < 0.8) {
      improvements.push("Format all lists properly with bullet points (*)");
    }

    if (evaluation.criteriaScores["Plot Coherence"]?.score < 0.8) {
      improvements.push("Ensure the plot is coherent with clear cause-and-effect relationships between events");
    }

    if (evaluation.criteriaScores["Theme Development"]?.score < 0.8) {
      improvements.push("Develop themes more thoroughly, showing how they are reflected in the characters and plot");
    }

    if (improvements.length === 0) {
      return "";
    }

    return `
IMPORTANT: Your previous story needed improvements in these areas:
${improvements.map(imp => `- ${imp}`).join("\n")}

Please generate a new story that specifically addresses these points while maintaining the high quality in other areas.

`;
  }
} 