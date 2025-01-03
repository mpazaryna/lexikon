export type LLMConfig = {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export type LLMResponse = {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type LLMProvider = {
  generateContent: (prompt: string, config?: Partial<LLMConfig>) => Promise<LLMResponse>;
}

export type LLMError = {
  code: string;
  message: string;
  provider?: string;
  status?: number;
}