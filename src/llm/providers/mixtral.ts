import { LLMProvider } from "../types.ts";

/**
 * Mixtral-specific implementation using Groq's API
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export class MixtralError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MixtralError";
  }
}

interface DenoError extends Error {
  name: string;
}

export class MixtralProvider implements LLMProvider {
  /**
   * Send a message to Mixtral via Groq and get a response
   * @param message The message to send to Mixtral
   * @returns The response from Mixtral
   */
  async chat(message: string): Promise<string> {
    try {
      const apiKey = Deno.env.get("GROQ_API_KEY");
      if (!apiKey) {
        throw new MixtralError("GROQ_API_KEY environment variable is not set");
      }

      if (!message.trim()) {
        throw new MixtralError("Message cannot be empty");
      }

      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            { role: "user", content: message }
          ],
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null
        }),
      });

      if (!response.ok) {
        throw new MixtralError(`Request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      // Wrap any Deno permission errors
      if (error instanceof Error && error.name === "NotCapable") {
        throw new MixtralError("Missing required permissions. Run with --allow-env and --allow-net flags");
      }
      throw error;
    }
  }
} 