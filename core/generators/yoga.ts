/**
 * @module YogaGenerator
 * @description A specialized generator module for creating yoga sequences using various LLM providers.
 * This module extends the base generator functionality to create customized yoga routines
 * based on specified difficulty levels, durations, and focus areas.
 */

import type { ProviderType, LLMResponse, TokenUsage } from "../types.ts";
import type { DomainConfig } from "../improvement/domain.ts";
import { YogaEvaluator } from "../evaluation/yoga.ts";
import * as providers from "../llm/providers/mod.ts";

export interface YogaConfig extends DomainConfig {
  level: string;
  duration: string;
  focus: string;
}

export interface YogaResult {
  content: string;
  evaluation: {
    overallScore: number;
    recommendations: string[];
    criteriaScores: Record<string, { score: number; details: string[] }>;
    domainSpecificMetrics: Record<string, string | number>;
  };
  usage: TokenUsage;
}

export async function generateYogaSequence(config: YogaConfig): Promise<YogaResult> {
  const prompt = config.template
    .replace("{LEVEL}", config.level)
    .replace("{DURATION}", config.duration)
    .replace("{FOCUS}", config.focus);
  
  // Generate sequence using specified provider
  const provider = providers[config.provider];
  if (!provider) {
    throw new Error(`Provider ${config.provider} not supported`);
  }

  const rawResponse = await provider.generateContent(prompt, {
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature
  });

  // Ensure response has required fields
  const response: LLMResponse = {
    content: rawResponse.content,
    usage: rawResponse.usage ?? {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    },
    model: config.model,
    provider: config.provider
  };

  // Evaluate the generated sequence
  const evaluator = new YogaEvaluator(config.template, {
    name: "Yoga Sequence",
    description: "A structured yoga practice sequence with proper form and safety guidelines",
    templatePath: "examples/yoga/templates/hatha.txt",
    outputPath: "output/yoga-{provider}.md",
    evaluationPath: "output/yoga-evaluation-{provider}.md"
  });

  const evaluation = evaluator.evaluateYogaSequence(response);

  // Log evaluation results
  console.log("\nYoga Sequence Evaluation Results:");
  console.log(`Overall Score: ${(evaluation.overallScore * 100).toFixed(1)}%`);
  
  if (evaluation.recommendations.length > 0) {
    console.log("\nRecommendations for Improvement:");
    evaluation.recommendations.forEach(rec => console.log(`- ${rec}`));
  }

  return {
    content: response.content,
    evaluation: {
      overallScore: evaluation.overallScore,
      recommendations: evaluation.recommendations,
      criteriaScores: evaluation.criteriaScores,
      domainSpecificMetrics: evaluation.domainSpecificMetrics ?? {}
    },
    usage: response.usage
  };
}

function createImprovementPrompt(evaluation: YogaResult["evaluation"]): string {
  const improvements: string[] = [];
  
  if (evaluation.criteriaScores["Sanskrit Names"]?.score < 0.5) {
    improvements.push("Include Sanskrit names for ALL yoga poses in parentheses after the English name");
  }
  
  if (evaluation.criteriaScores["List Format"]?.score < 0.8) {
    improvements.push("Ensure each pose instruction is properly formatted as a bullet point with a single asterisk (*)");
  }
  
  if (evaluation.criteriaScores["Safety Guidelines"]?.score < 1) {
    improvements.push("Include comprehensive safety guidelines and precautions for each section");
  }
  
  if (evaluation.criteriaScores["Alignment Cues"]?.score < 1) {
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

export async function generateImprovedYogaSequence(
  config: YogaConfig,
  previousEvaluation: YogaResult["evaluation"]
): Promise<YogaResult> {
  const improvementPrompt = createImprovementPrompt(previousEvaluation);
  const enhancedConfig = {
    ...config,
    template: improvementPrompt + config.template
  };
  
  return generateYogaSequence(enhancedConfig);
} 