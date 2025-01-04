import type { LLMConfig, LLMProvider, ProviderType } from "../../types.ts";
import * as claude from "./providers/claude.ts";
import * as openai from "./providers/openai.ts";
import * as groq from "./providers/groq.ts";
import * as gemini from "./providers/gemini.ts";

export const createProvider = (type: ProviderType, config: Partial<LLMConfig> = {}): LLMProvider => {
  const providers = {
    claude: { generateContent: claude.generateContent },
    openai: { generateContent: openai.generateContent },
    groq: { generateContent: groq.generateContent },
    gemini: { generateContent: gemini.generateContent }
  };

  return providers[type] || 
    (() => { throw new Error(`Provider ${type} not supported`); })();
};