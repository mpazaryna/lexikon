/// <reference lib="esnext" />
/// <reference lib="dom" />

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  };
  export function readTextFile(path: string | URL): Promise<string>;
  export function readDir(path: string): AsyncIterableIterator<{
    name: string;
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
  }>;
} 