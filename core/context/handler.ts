import { join } from "@std/path";

export type Context = {
  content: string;
  metadata?: Record<string, unknown>;
};

export const loadFile = async (path: string): Promise<string> => {
  try {
    return await Deno.readTextFile(path);
  } catch (error) {
    throw { code: "FILE_ERROR", message: `Failed to load file: ${error.message}` };
  }
};

export const loadDirectory = async (dir: string): Promise<Context[]> => {
  const contexts: Context[] = [];
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isFile) {
      const content = await loadFile(join(dir, entry.name));
      contexts.push({ content, metadata: { filename: entry.name } });
    }
  }
  return contexts;
};

export const mergeContexts = (contexts: Context[], maxTokens = 8000): string => {
  return contexts
    .map(ctx => ctx.content)
    .join("\n\n")
    .slice(0, maxTokens);
};