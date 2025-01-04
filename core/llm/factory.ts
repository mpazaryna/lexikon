import type { LLMConfig, LLMProvider, ProviderType } from "../../types.ts";
import * as claude from "./providers/claude.ts";
import * as openai from "./providers/openai.ts";
import * as groq from "./providers/groq.ts";
import * as gemini from "./providers/gemini.ts";

export const createProvider = (type: ProviderType, config: Partial<LLMConfig> = {}): LLMProvider => {
  const providers = {
    claude: { generateContent: (prompt: string) => claude.generateContent(prompt, config) },
    openai: { generateContent: (prompt: string) => openai.generateContent(prompt, config) },
    groq: { generateContent: (prompt: string) => groq.generateContent(prompt, config) },
    gemini: { generateContent: (prompt: string) => gemini.generateContent(prompt, config) }
  };

  return providers[type] || 
    (() => { throw new Error(`Provider ${type} not supported`); })();
};