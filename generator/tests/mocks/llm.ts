import type { MockGeneratorConfig } from "../test_utils.ts";
import { assertIsError, getErrorMessage } from "../test_utils.ts";

export const mockLLMClient = {
  complete: async (messages: Array<{ role: string; content: string }>) => {
    // Simple mock that returns different responses based on input
    const prompt = messages[0].content;
    
    if (prompt.includes("error")) {
      throw new Error("Mock LLM error");
    }

    return {
      message: {
        content: `Mock response for: ${prompt.slice(0, 50)}...`
      }
    };
  }
};

export const mockGeneratorConfig: MockGeneratorConfig = {
  llm: mockLLMClient,
  retryOptions: {
    maxAttempts: 2,
    delayMs: 100,
    // Type-safe error handlers
    onError: (error: unknown, attempt: number) => {
      // Handle error type assertion in the mock
      console.error(`Mock error handler: ${getErrorMessage(error)} (attempt ${attempt})`);
    },
    onRetry: (attempt: number, delay: number) => {
      console.log(`Mock retry handler: attempt ${attempt}, delay ${delay}ms`);
    }
  }
};

// Add type guard for error handling
export function isError(error: unknown): error is Error {
  return error instanceof Error;
} 