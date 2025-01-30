import { LLMProvider, LLMProviderType } from "./types.ts";
import { ClaudeProvider } from "./providers/claude.ts";
import { OpenAIProvider } from "./providers/openai.ts";

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
      default:
        throw new Error(`Unsupported LLM provider type: ${type}`);
    }
  }
} 