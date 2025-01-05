import { join, dirname, fromFileUrl } from "@std/path";
import { parse } from "@std/flags";
import type { StoryConfig } from "../../core/generators/story.ts";
import { improveContent } from "../../core/improvement/domain.ts";
import { StoryImprover } from "../../core/improvement/story.ts";

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
  string: ["provider", "focus", "concept"],
  number: ["iterations", "min-score"],
  default: {
    iterations: 1,
    "min-score": 0,
    concept: "biologist",
  },
});

const provider = flags.provider as Provider;
if (!provider || !PROVIDER_CONFIGS[provider]) {
  console.error("Please specify a valid provider: openai, claude, gemini, or groq");
  console.error("\nUsage:");
  console.error("  deno run --allow-read --allow-write improve-story.ts --provider=claude [options]");
  console.error("\nOptions:");
  console.error("  --iterations=<number>     Number of improvement iterations (default: 1)");
  console.error("  --min-score=<number>      Stop when this score is reached (default: 0)");
  console.error("  --focus=<criteria>        Comma-separated list of criteria to focus on");
  console.error("  --concept=<string>        Story concept (default: biologist)");
  Deno.exit(1);
}

const __dirname = dirname(fromFileUrl(import.meta.url));

// Read the template file
const templatePath = join(__dirname, "templates", "hero-journey.txt");
const template = await Deno.readTextFile(templatePath);

// Create config
const config: StoryConfig = {
  provider,
  model: PROVIDER_CONFIGS[provider].model,
  maxTokens: PROVIDER_CONFIGS[provider].maxTokens,
  temperature: 0.7,
  template,
  concept: flags.concept,
  outputPath: join(__dirname, "..", "..", "output", `story-improved-${provider}.md`),
  evaluationPath: join(__dirname, "..", "..", "output", `story-evaluation-${provider}.md`)
};

// Create improver
const improver = new StoryImprover();

// Run improvement process
await improveContent(config, {
  iterations: flags.iterations,
  minScore: flags["min-score"],
  focusCriteria: flags.focus?.split(",").map(c => c.trim())
}, improver); 