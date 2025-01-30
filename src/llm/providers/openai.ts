import { LLMProvider } from "../types.ts";

/**
 * OpenAI-specific implementation
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAIError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OpenAIError";
  }
}

interface DenoError extends Error {
  name: string;
}

export class OpenAIProvider implements LLMProvider {
  /**
   * Send a message to OpenAI and get a response
   * @param message The message to send to OpenAI
   * @returns The response from OpenAI
   */
  async chat(message: string): Promise<string> {
    try {
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) {
        throw new OpenAIError("OPENAI_API_KEY environment variable is not set");
      }

      if (!message.trim()) {
        throw new OpenAIError("Message cannot be empty");
      }

      const response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "user", content: message }
          ],
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new OpenAIError(`Request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      // Wrap any Deno permission errors
      if (error instanceof Error && error.name === "NotCapable") {
        throw new OpenAIError("Missing required permissions. Run with --allow-env and --allow-net flags");
      }
      throw error;
    }
  }
} 