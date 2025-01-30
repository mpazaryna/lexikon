/**
 * A simple module for chatting with Claude
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export class ClaudeError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ClaudeError";
  }
}

interface DenoError extends Error {
  name: string;
}

/**
 * Send a message to Claude and get a response
 * @param message The message to send to Claude
 * @returns The response from Claude
 */
export async function chat(message: string): Promise<string> {
  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new ClaudeError("ANTHROPIC_API_KEY environment variable is not set");
    }

    if (!message.trim()) {
      throw new ClaudeError("Message cannot be empty");
    }

    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [
          { role: "user", content: message }
        ]
      }),
    });

    if (!response.ok) {
      throw new ClaudeError(`Request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    // Wrap any Deno permission errors
    if (error instanceof Error && error.name === "NotCapable") {
      throw new ClaudeError("Missing required permissions. Run with --allow-env and --allow-net flags");
    }
    throw error;
  }
} 
