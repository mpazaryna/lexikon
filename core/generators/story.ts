/**
 * @module StoryGenerator
 * @description A specialized generator module for creating stories using various LLM providers.
 * This module extends the base generator functionality to handle story-specific generation
 * with customizable concepts and provider-specific output handling.
 */

import type { ProviderType, LLMResponse } from "../types.ts";
import { StoryEvaluator } from "../evaluation/story.ts";
import * as providers from "../llm/providers/mod.ts";

export interface StoryConfig {
  provider: ProviderType;
  model: string;
  maxTokens: number;
  temperature: number;
  template: string;
  concept: string;
}

export interface StoryResult {
  content: string;
  evaluation: {
    overallScore: number;
    recommendations: string[];
    criteriaScores: Record<string, { score: number; details: string[] }>;
  };
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function generateStory(config: StoryConfig): Promise<StoryResult> {
  const prompt = config.template.replace("{CONCEPT}", config.concept.trim());
  
  // Generate story using specified provider
  const provider = providers[config.provider];
  if (!provider) {
    throw new Error(`Provider ${config.provider} not supported`);
  }

  const response = await provider.generateContent(prompt, {
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature
  });

  // Evaluate the generated story
  const evaluator = new StoryEvaluator(config.template);
  const evaluation = evaluator.evaluateStory({
    ...response,
    model: config.model,
    provider: config.provider
  });

  // Log evaluation results
  console.log("\nStory Evaluation Results:");
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
      criteriaScores: evaluation.criteriaScores
    },
    usage: response.usage
  };
} 