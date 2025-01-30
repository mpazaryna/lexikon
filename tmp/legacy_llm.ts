import { Logger } from "@/utils/logger.ts";

export type LLMProvider = "openai" | "claude";
const LOG_FILE = "llm";

export class LLMService {
  private provider: LLMProvider;
  private apiKey: string;
  private logger: Logger;

  constructor(provider: LLMProvider, options: { apiKey?: string } = {}) {
    this.logger = new Logger(LOG_FILE);
    this.logger.log(`Initializing LLMService with provider: ${provider}`);
    
    if (!this.isValidProvider(provider)) {
      const errorMessage = "Unsupported LLM provider";
      this.logger.log(errorMessage, "ERROR");
      throw new Error(errorMessage);
    }
    
    this.provider = provider;
    
    if (provider === "openai") {
      this.apiKey = options.apiKey || Deno.env.get("OPENAI_API_KEY") || "";
      if (!this.apiKey) {
        const errorMessage = "OPENAI_API_KEY environment variable must be set";
        this.logger.log(errorMessage, "ERROR");
        throw new Error(errorMessage);
      }
    } else {
      this.apiKey = options.apiKey || Deno.env.get("ANTHROPIC_API_KEY") || "";
      if (!this.apiKey) {
        const errorMessage = "ANTHROPIC_API_KEY environment variable must be set";
        this.logger.log(errorMessage, "ERROR");
        throw new Error(errorMessage);
      }
    }
    this.logger.log(`${provider} initialized`);
  }

  private isValidProvider(provider: string): provider is LLMProvider {
    return ["openai", "claude"].includes(provider);
  }

  async chat(prompt: string): Promise<string> {
    this.logger.log(`Starting chat with prompt: ${prompt}`);
    
    if (!prompt.trim()) {
      const errorMessage = "Prompt cannot be empty";
      this.logger.log(errorMessage, "ERROR");
      throw new Error(errorMessage);
    }

    try {
      let response: string;
      
      if (this.provider === "openai") {
        this.logger.log("Using OpenAI provider");
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1024
          })
        });

        if (!openaiResponse.ok) {
          const error = await openaiResponse.json();
          throw new Error(error.error?.message || "OpenAI API error");
        }

        const data = await openaiResponse.json();
        response = data.choices[0].message.content;
      } else {
        this.logger.log("Using Claude provider");
        const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1024,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }],
            system: "You are a helpful AI assistant that provides accurate, detailed responses."
          })
        });

        if (!claudeResponse.ok) {
          const error = await claudeResponse.json();
          throw new Error(error.error?.message || "Claude API error");
        }

        const data = await claudeResponse.json();
        response = data.content[0].text;
      }
      
      this.logger.log(`Chat response received: ${response.substring(0, 100)}...`);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.log(`Detailed error: ${error.stack || error.message}`, "ERROR");
        
        // Handle specific error cases
        if (error.message.includes("Failed to fetch") || 
            error.message.includes("network") ||
            error.message.includes("ECONNREFUSED")) {
          const errorMessage = "Connection error";
          this.logger.log(`Chat error: ${errorMessage}`, "ERROR");
          throw new Error(errorMessage);
        }

        if (error.message.includes("auth") || error.message.includes("key")) {
          const errorMessage = "Invalid API key";
          this.logger.log(errorMessage, "ERROR");
          throw new Error(errorMessage);
        }

        this.logger.log(`Chat error: ${error.message}`, "ERROR");
        throw new Error(`${this.provider} chat error: ${error.message}`);
      }
      
      const errorMessage = `${this.provider} chat error: Unknown error occurred`;
      this.logger.log(errorMessage, "ERROR");
      throw new Error(errorMessage);
    }
  }
} 