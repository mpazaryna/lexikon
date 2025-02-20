// Type assertion utilities for tests
export function assertIsError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) {
    throw new Error('Expected error to be instance of Error');
  }
}

// Mock types that match the implementation but with stricter type safety
export interface MockGeneratorConfig {
  llm: {
    complete: (messages: Array<{ role: string; content: string }>) => Promise<{
      message: { content: string };
    }>;
  };
  retryOptions?: {
    maxAttempts: number;
    delayMs: number;
    // Match implementation's error handling signature
    onError: (error: Error, attempt: number) => void;
    onRetry: (attempt: number, delay: number) => void;
  };
  transforms?: Array<(content: string) => string>;
}

// Utility for handling unknown errors
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
} 