import { LLMConfig, LLMProvider } from "./providers/types.ts";
import * as claude from "./providers/claude.ts";
import * as openai from "./providers/openai.ts";
import * as groq from "./providers/groq.ts";

export type ProviderType = "claude" | "openai" | "groq" | "gemini";

export const createProvider = (type: ProviderType, config: Partial<LLMConfig> = {}): LLMProvider => {
  const providers = {
    claude: { generateContent: claude.generateContent },
    openai: { generateContent: openai.generateContent },
    groq: { generateContent: groq.generateContent },
    gemini: { generateContent: async () => { throw new Error("Not implemented") } }
  };

  return providers[type] || 
    (() => { throw new Error(`Provider ${type} not supported`); })();
};