import { join } from "@std/path";
import { ensureDir } from "@std/fs";
import { createProvider } from "../llm/factory.ts";
import { loadFile } from "../context/handler.ts";
import { BaseGeneratorOptions, ProviderType } from "../../types.ts";

export abstract class BaseGenerator {
  protected options: BaseGeneratorOptions;

  constructor(options: BaseGeneratorOptions) {
    this.options = {
      temperature: 0.7,
      maxTokens: 4000,
      ...options,
    };
  }

  protected async loadTemplate(): Promise<string> {
    const { template, templatePath } = this.options;
    
    if (template) {
      console.log("📝 Using provided template string");
      return template;
    } 
    
    if (templatePath) {
      console.log(`📂 Loading template from: ${templatePath}`);
      const content = await loadFile(templatePath);
      console.log("✅ Template loaded successfully");
      return content;
    }
    
    throw new Error("Either template or templatePath must be provided");
  }

  protected abstract buildPrompt(template: string): string | Promise<string>;

  async generate(): Promise<string> {
    console.log("🚀 Starting generation...");
    
    // Get template content
    const templateContent = await this.loadTemplate();

    // Initialize LLM
    const { provider, temperature, maxTokens, model } = this.options;
    console.log(`🤖 Initializing ${provider.toUpperCase()}...`);
    const llm = createProvider(provider as ProviderType, { 
      temperature, 
      maxTokens,
      ...(model ? { model } : {})
    });

    // Generate content
    console.log("📝 Generating content...");
    const prompt = await this.buildPrompt(templateContent);
    const response = await llm.generateContent(prompt);
    console.log("✅ Content generated successfully");

    // Save response
    console.log(`💾 Saving response to output/${this.options.outputFile}...`);
    await ensureDir("output");
    await Deno.writeTextFile(join("output", this.options.outputFile), response.content);
    console.log(`✨ Process completed! Saved to output/${this.options.outputFile}`);

    return response.content;
  }
} 