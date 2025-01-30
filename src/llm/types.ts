/**
 * Base interface for all LLM providers
 */
export interface LLMProvider {
  /**
   * Send a message to the LLM and get a response
   * @param message The message to send to the LLM
   * @returns The response from the LLM
   */
  chat(message: string): Promise<string>;
}

/**
 * Available LLM providers
 */
export enum LLMProviderType {
  CLAUDE = "claude",
  OPENAI = "openai",
  GEMINI = "gemini",
  MIXTRAL = "mixtral"
} 