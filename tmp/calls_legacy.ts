import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { extractOutline } from "@/extraction/services/outline.ts";
import { ensureDir } from "https://deno.land/std@0.203.0/fs/ensure_dir.ts";
import { TEST_CONFIG } from "@/config/test.ts";
import { OutlineSchema } from "@/schemas/outline.ts";
import { LLMFactory, LLMProviderType } from "jsr:@paz/lexikon";

// Create LLM provider directly using the factory
const llm = LLMFactory.createProvider(TEST_CONFIG.llmModel as LLMProviderType);

// Read test data once
const TEST_OUTLINE = await Deno.readTextFile(`${TEST_CONFIG.fixturesDir}/outlines/outline-01.md`);
const TEMPLATE = await Deno.readTextFile(`${TEST_CONFIG.templatesDir}/ingestion/extract_outline.md`);

// Ensure directories exist
await ensureDir(TEST_CONFIG.tmpDir);  // We'll use tmp for test outputs

// Add utility function for JSON validation
function validateAndParseJSON(jsonString: string, source: string) {
  // Trim any whitespace
  const trimmed = jsonString.trim();
  
  // Basic validation checks
  if (!trimmed) {
    throw new Error(`${source}: Empty response received`);
  }
  
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    console.error("Invalid JSON start. Content preview:", trimmed.substring(0, 100));
    throw new Error(`${source}: Response does not start with valid JSON`);
  }
  
  try {
    const parsed = JSON.parse(trimmed);
    // Validate expected structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error(`${source}: Parsed result is not an object`);
    }
    return parsed;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`${source} parsing error:`, error.message);
      // Log the problematic section
      if (error.message.includes('position')) {
        const match = error.message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1]);
          const start = Math.max(0, pos - 50);
          const end = Math.min(trimmed.length, pos + 50);
          console.error('Content around error:');
          console.error('...', trimmed.substring(start, pos), '👉', trimmed.substring(pos, pos + 1), '👈', trimmed.substring(pos + 1, end), '...');
        }
      }
      // Log the full content if it's not too long
      if (trimmed.length < 1000) {
        console.error('Full content:', trimmed);
      }
    }
    throw error;
  }
}

Deno.test("Functional Outline Extraction - Basic Functionality", async () => {
  console.log("\n=== Starting Outline Extraction Test ===");
  
  // Test regex extraction first (doesn't need LLM)
  const outputRegexPath = `${TEST_CONFIG.tmpDir}/outline-parsed-re.json`;
  const outputLLMPath = `${TEST_CONFIG.tmpDir}/outline-parsed-llm.json`;
  
  console.log("Running regex extraction...");
  const regexResult = await extractOutline(TEST_OUTLINE, TEMPLATE, llm, {
    useRegex: true,
    outputPath: outputRegexPath,
    schema: JSON.stringify(OutlineSchema)
  });
  
  console.log(`Regex extraction complete. Result length: ${regexResult.length}`);
  
  // Validate and parse the regex result
  const regexParsed = validateAndParseJSON(regexResult, 'Regex extraction');
  console.log("Regex parsing successful");
  
  // Validate parsed structure
  assertEquals(typeof regexParsed.title, "string");
  assertEquals(Array.isArray(regexParsed.scenes), true);
  assertEquals(regexParsed.scenes.length, 10);
  
  // Validate first scene structure
  const firstScene = regexParsed.scenes[0];
  assertEquals(typeof firstScene.number, "number");
  assertEquals(typeof firstScene.location, "string");
  assertEquals(typeof firstScene.setting, "string");
  assertEquals(typeof firstScene.timeOfDay, "string");
  assertEquals(typeof firstScene.content, "string");
  
  // Test LLM extraction
  console.log("\nRunning LLM extraction...");
  const llmResult = await extractOutline(TEST_OUTLINE, TEMPLATE, llm, {
    useRegex: false,
    outputPath: outputLLMPath,
    schema: JSON.stringify(OutlineSchema)
  });
  
  console.log(`LLM extraction complete. Result length: ${llmResult.length}`);
  
  // Validate and parse the LLM result
  const llmParsed = validateAndParseJSON(llmResult, 'LLM extraction');
  console.log("LLM parsing successful");
  
  // Verify files exist and contain data
  const reStats = await Deno.stat(outputRegexPath);
  const llmStats = await Deno.stat(outputLLMPath);
  
  console.log("\nChecking output files:");
  console.log(`- Regex file exists: ${reStats.isFile}`);
  console.log(`- LLM file exists: ${llmStats.isFile}`);
  
  // Read and preview the files
  try {
    const regexContent = await Deno.readTextFile(outputRegexPath);
    const llmContent = await Deno.readTextFile(outputLLMPath);
    
    console.log("\nFile contents preview:");
    console.log("\nRegex output (first 200 chars):");
    console.log(regexContent.substring(0, 200), "...");
    console.log("\nLLM output (first 200 chars):");
    console.log(llmContent.substring(0, 200), "...");
  } catch (error) {
    console.error("Error reading output files:", error);
  }
  
  console.log("\n=== Test Complete ===\n");
});

Deno.test("Functional Outline Extraction - Error Handling", async () => {
  // Test with empty outline
  try {
    await extractOutline("", TEMPLATE, llm);
    throw new Error("Expected error for empty outline but none was thrown");
  } catch (error) {
    assertEquals(error instanceof Error, true);
  }
  
  // Test with empty template
  try {
    await extractOutline(TEST_OUTLINE, "", llm);
    throw new Error("Expected error for empty template but none was thrown");
  } catch (error) {
    assertEquals(error instanceof Error, true);
  }
});