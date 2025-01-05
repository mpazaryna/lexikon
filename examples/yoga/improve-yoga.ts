import { generateImprovedYogaSequence, type YogaResult } from "../../core/generators/yoga.ts";
import { join, dirname, fromFileUrl } from "@std/path";
import { usageTracker } from "../../core/monitoring/index.ts";

// Add Deno types
declare global {
  const Deno: {
    readTextFile(path: string): Promise<string>;
    writeTextFile(path: string, data: string): Promise<void>;
    args: string[];
    exit(code: number): never;
  };
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

async function improveYogaSequence(provider: Provider) {
  const __dirname = dirname(fromFileUrl(import.meta.url));
  
  // Read the template file
  const templatePath = join(__dirname, "templates", "hatha.txt");
  const template = await Deno.readTextFile(templatePath);
  
  // Read the previous evaluation results
  const evaluationPath = join(__dirname, "..", "..", "output", `yoga-evaluation-${provider}.md`);
  const evaluationContent = await Deno.readTextFile(evaluationPath);
  
  // Parse the evaluation content to extract scores
  // This is a simple parser - you might want to make it more robust
  const overallScore = parseFloat(evaluationContent.match(/Overall Score: ([\d.]+)%/)?.[1] ?? "0") / 100;
  const criteriaScores: Record<string, { score: number; details: string[] }> = {};
  
  // Extract criteria scores from the evaluation content
  const sections = evaluationContent.split("###");
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

  const previousEvaluation: YogaResult["evaluation"] = {
    overallScore,
    recommendations: [],
    criteriaScores,
    domainSpecificMetrics: {}
  };

  // Generate improved sequence
  const result = await generateImprovedYogaSequence({
    provider,
    model: PROVIDER_CONFIGS[provider].model,
    maxTokens: PROVIDER_CONFIGS[provider].maxTokens,
    temperature: 0.7,
    template,
    level: "intermediate",
    duration: "60 minutes",
    focus: "strength and flexibility"
  }, previousEvaluation);

  // Write improved sequence to a new file
  const outputPath = join(__dirname, "..", "..", "output", `yoga-improved-${provider}.md`);
  await Deno.writeTextFile(outputPath, result.content);
  
  // Track usage
  usageTracker.recordUsage(
    provider,
    PROVIDER_CONFIGS[provider].model,
    {
      content: result.content,
      usage: result.usage,
      model: PROVIDER_CONFIGS[provider].model,
      provider
    },
    0 // latencyMs - we don't track this in the improvement flow
  );

  console.log(`\nImproved yoga sequence generated and saved to ${outputPath}`);
  console.log(`Previous overall score: ${(overallScore * 100).toFixed(1)}%`);
  console.log(`New overall score: ${(result.evaluation.overallScore * 100).toFixed(1)}%`);
}

// Get provider from command line args
const provider = Deno.args[0] as Provider;
if (!provider || !PROVIDER_CONFIGS[provider]) {
  console.error("Please specify a valid provider: openai, claude, gemini, or groq");
  Deno.exit(1);
}

await improveYogaSequence(provider); 