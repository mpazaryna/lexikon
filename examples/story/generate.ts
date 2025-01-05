import { generateStory } from "../../core/generators/story.ts";
import { join, dirname, fromFileUrl } from "@std/path";
import { parse } from "@std/flags";
import { usageTracker } from "../../core/monitoring/index.ts";

// Add Deno types
declare global {
  interface Deno {
    readTextFile(path: string): Promise<string>;
    writeTextFile(path: string, data: string): Promise<void>;
    args: string[];
    exit(code: number): never;
  }
}

type Provider = "openai" | "claude" | "gemini" | "groq";

interface ProviderConfig {
  model: string;
  maxTokens: number;
}

const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  openai: {
    model: "gpt-4",
    maxTokens: 4000,
  },
  claude: {
    model: "claude-3-sonnet-20240229",
    maxTokens: 4000,
  },
  gemini: {
    model: "gemini-pro",
    maxTokens: 4000,
  },
  groq: {
    model: "mixtral-8x7b-32768",
    maxTokens: 4000,
  },
};

// Parse command line arguments
const flags = parse(Deno.args, {
  string: ["provider", "concept"],
  default: {
    concept: "biologist",
  },
});

const provider = flags.provider as Provider;
if (!provider || !PROVIDER_CONFIGS[provider]) {
  console.error("Please specify a valid provider: openai, claude, gemini, or groq");
  console.error("\nUsage:");
  console.error("  deno run --allow-read --allow-write generate.ts --provider=claude [options]");
  console.error("\nOptions:");
  console.error("  --concept=<string>        Story concept (default: biologist)");
  Deno.exit(1);
}

async function generateStoryFromTemplate(provider: Provider, concept: string) {
  console.log(`Generating story using ${provider.toUpperCase()}...`);
  const __dirname = dirname(fromFileUrl(import.meta.url));
  const templatePath = join(__dirname, "templates", "hero-journey.txt");
  const conceptPath = join(__dirname, "concept", `${concept}.txt`);

  const template = await Deno.readTextFile(templatePath);
  const conceptContent = await Deno.readTextFile(conceptPath);
  
  const result = await generateStory({
    provider,
    temperature: 0.7,
    ...PROVIDER_CONFIGS[provider],
    template,
    concept: conceptContent,
    outputPath: join(__dirname, "..", "..", "output", `story-${provider}.md`),
    evaluationPath: join(__dirname, "..", "..", "output", `story-evaluation-${provider}.md`)
  });

  // Save the generated story
  const outputPath = join(__dirname, "..", "..", "output", `story-${provider}.md`);
  await Deno.writeTextFile(outputPath, result.content);
  console.log(`\nStory saved to: ${outputPath}`);

  // Save evaluation results
  const evaluationPath = join(__dirname, "..", "..", "output", `story-evaluation-${provider}.md`);
  const evaluationContent = [
    `# Story Evaluation Results - ${provider.toUpperCase()}`,
    "",
    `## Overall Score: ${(result.evaluation.overallScore * 100).toFixed(1)}%`,
    "",
    "## Detailed Scores",
    ...Object.entries(result.evaluation.criteriaScores).map(([criterion, score]) => [
      `### ${criterion}: ${(score.score * 100).toFixed(1)}%`,
      ...score.details.map(detail => `- ${detail}`),
      ""
    ]).flat(),
    "## Recommendations",
    ...result.evaluation.recommendations.map(rec => `- ${rec}`),
    "",
    "## Usage Statistics",
    `- Total API calls: ${usageTracker.getUsageStats().totalCalls}`,
    `- Success rate: ${usageTracker.getUsageStats().successRate.toFixed(1)}%`,
    `- Average latency: ${usageTracker.getUsageStats().averageLatency.toFixed(0)}ms`,
    `- Total tokens used: ${usageTracker.getUsageStats().totalTokens}`,
    `- Estimated cost: $${usageTracker.getUsageStats().totalCost.toFixed(4)}`,
    "",
    "## Generation Details",
    `- Model: ${PROVIDER_CONFIGS[provider].model}`,
    `- Max tokens: ${PROVIDER_CONFIGS[provider].maxTokens}`,
    `- Temperature: 0.7`,
    `- Timestamp: ${new Date().toISOString()}`
  ].join("\n");

  await Deno.writeTextFile(evaluationPath, evaluationContent);
  console.log(`Evaluation results saved to: ${evaluationPath}`);

  // Display evaluation results
  console.log("\nEvaluation Details:");
  Object.entries(result.evaluation.criteriaScores).forEach(([criterion, score]) => {
    console.log(`${criterion}: ${(score.score * 100).toFixed(1)}%`);
    score.details.forEach(detail => console.log(`  - ${detail}`));
  });

  if (result.evaluation.recommendations.length > 0) {
    console.log("\nRecommendations for Improvement:");
    result.evaluation.recommendations.forEach(rec => console.log(`- ${rec}`));
  }

  // Display usage statistics
  const stats = usageTracker.getUsageStats();
  console.log("\nUsage Statistics:");
  console.log(`Total API calls: ${stats.totalCalls}`);
  console.log(`Success rate: ${stats.successRate.toFixed(1)}%`);
  console.log(`Average latency: ${stats.averageLatency.toFixed(0)}ms`);
  console.log(`Total tokens used: ${stats.totalTokens}`);
  console.log(`Estimated cost: $${stats.totalCost.toFixed(4)}`);
}

// Execute the generation
await generateStoryFromTemplate(provider, flags.concept); 