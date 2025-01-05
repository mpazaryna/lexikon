import { generateYogaSequence } from "../../core/generators/yoga.ts";
import { join, dirname, fromFileUrl } from "@std/path";
import { usageTracker } from "../../core/monitoring/index.ts";

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

async function generateYogaFromTemplate(provider: Provider) {
  console.log(`Generating yoga sequence using ${provider.toUpperCase()}...`);
  const templatePath = join(dirname(fromFileUrl(import.meta.url)), "templates", "hatha.txt");

  await generateYogaSequence({
    provider,
    temperature: 0.7,
    ...PROVIDER_CONFIGS[provider],
    level: "intermediate",
    duration: "60 minutes",
    focus: "strength and flexibility",
    templatePath
  });

  // Display usage statistics
  const stats = usageTracker.getUsageStats();
  console.log("\n Usage Statistics:");
  console.log(`Total API calls: ${stats.totalCalls}`);
  console.log(`Success rate: ${stats.successRate.toFixed(1)}%`);
  console.log(`Average latency: ${stats.averageLatency.toFixed(0)}ms`);
  console.log(`Total tokens used: ${stats.totalTokens}`);
  console.log(`Estimated cost: $${stats.totalCost.toFixed(4)}`);
  
  if (stats.usageByProvider[provider]) {
    console.log(`Tokens used by ${provider}: ${stats.usageByProvider[provider]}`);
  }
}

// Main execution
if (import.meta.main) {
  const provider = Deno.args[0] as Provider;
  
  if (!provider || !PROVIDER_CONFIGS[provider]) {
    console.log("Please specify which provider to run:");
    console.log("Available providers:", Object.keys(PROVIDER_CONFIGS).join(", "));
    console.log("\nExample:");
    console.log("  deno run --allow-net --allow-env --allow-read --allow-write examples/yoga/generate-yoga.ts openai");
    Deno.exit(1);
  }

  await generateYogaFromTemplate(provider);
} 