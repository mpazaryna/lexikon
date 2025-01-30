import { LLMProvider, LLMProviderType } from "./types.ts";
import { ClaudeProvider } from "./providers/claude.ts";
import { OpenAIProvider } from "./providers/openai.ts";
import { GeminiProvider } from "./providers/gemini.ts";
import { MixtralProvider } from "./providers/mixtral.ts";

/**
 * Factory for creating LLM provider instances
 */
export class LLMFactory {
  /**
   * Create a new LLM provider instance
   * @param type The type of LLM provider to create
   * @returns A new instance of the specified LLM provider
   * @throws Error if the provider type is not supported
   */
  static createProvider(type: LLMProviderType): LLMProvider {
    switch (type) {
      case LLMProviderType.CLAUDE:
        return new ClaudeProvider();
      case LLMProviderType.OPENAI:
        return new OpenAIProvider();
      case LLMProviderType.GEMINI:
        return new GeminiProvider();
      case LLMProviderType.MIXTRAL:
        return new MixtralProvider();
      default:
        throw new Error(`Unsupported LLM provider type: ${type}`);
    }
  }
} 