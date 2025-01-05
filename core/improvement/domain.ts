import type { ProviderType, TokenUsage } from "../types.ts";
import { usageTracker } from "../monitoring/index.ts";

export interface ImprovementOptions {
  iterations?: number;
  minScore?: number;
  focusCriteria?: string[];
}

export interface DomainConfig {
  provider: ProviderType;
  model: string;
  maxTokens: number;
  temperature: number;
  template: string;
  outputPath: string;
  evaluationPath: string;
}

export interface ImprovementResult {
  content: string;
  evaluation: {
    overallScore: number;
    recommendations: string[];
    criteriaScores: Record<string, { score: number; details: string[] }>;
    domainSpecificMetrics: Record<string, string | number>;
  };
  usage: TokenUsage;
}

export interface DomainImprover<T extends DomainConfig> {
  generateImprovedContent: (config: T, previousEvaluation: ImprovementResult["evaluation"]) => Promise<ImprovementResult>;
  parseEvaluation: (content: string) => ImprovementResult["evaluation"];
}

export async function improveContent<T extends DomainConfig>(
  config: T,
  options: ImprovementOptions,
  improver: DomainImprover<T>
): Promise<ImprovementResult[]> {
  const { iterations = 1, minScore = 0, focusCriteria } = options;
  const results: ImprovementResult[] = [];
  
  let currentIteration = 1;
  let lastResult: ImprovementResult | null = null;
  
  while (currentIteration <= iterations) {
    console.log(`\nIteration ${currentIteration}/${iterations}`);
    
    // Read the previous evaluation results
    const evaluationPath = lastResult 
      ? config.evaluationPath.replace(".md", `-${currentIteration-1}.md`)
      : config.evaluationPath;
    
    const evaluationContent = await Deno.readTextFile(evaluationPath);
    const evaluation = improver.parseEvaluation(evaluationContent);
    
    // Generate improved content
    const result = await improver.generateImprovedContent(config, evaluation);
    results.push(result);

    // Write improved content to a new file
    const outputPath = config.outputPath.replace(".md", `-${currentIteration}.md`);
    await Deno.writeTextFile(outputPath, result.content);
    
    // Track usage
    usageTracker.recordUsage(
      config.provider,
      config.model,
      {
        content: result.content,
        usage: result.usage
      },
      0
    );

    console.log(`\nImproved content generated and saved to ${outputPath}`);
    console.log(`Previous overall score: ${(evaluation.overallScore * 100).toFixed(1)}%`);
    console.log(`New overall score: ${(result.evaluation.overallScore * 100).toFixed(1)}%`);

    // Check if we've reached the minimum score
    if (minScore > 0 && result.evaluation.overallScore >= minScore) {
      console.log(`\nReached target score of ${minScore * 100}%. Stopping improvements.`);
      break;
    }

    if (focusCriteria) {
      console.log("\nFocused Criteria Scores:");
      for (const criterion of focusCriteria) {
        const oldScore = evaluation.criteriaScores[criterion]?.score ?? 0;
        const newScore = result.evaluation.criteriaScores[criterion]?.score ?? 0;
        console.log(`${criterion}: ${(oldScore * 100).toFixed(1)}% → ${(newScore * 100).toFixed(1)}%`);
      }
    }

    lastResult = result;
    currentIteration++;
  }

  return results;
} 