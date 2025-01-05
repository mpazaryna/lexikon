export type ProviderType = "openai" | "claude" | "gemini" | "groq";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  content: string;
  usage: TokenUsage;
  model?: string;
  provider?: ProviderType;
} 