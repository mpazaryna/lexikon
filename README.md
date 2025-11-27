# Lexikon: A Modular LLM Development Toolkit

<img src="/assets/logo.jpeg" width="500" alt="Lexikon Logo">

## Portfolio Notice

**Important**: This repository is shared primarily as a portfolio piece and reference implementation. It represents tools I've built for my own development workflow and is not actively maintained for public use. While you're welcome to fork and use this code under the terms of the license, please note:

- This is not an actively maintained open source project
- I am not seeking contributions or feature requests
- Issues and pull requests will not be regularly monitored
- No guarantees of support or updates are provided

Feel free to use this as inspiration or reference for your own projects.

## Overview

Lexikon provides a lightweight, standardized interface for interacting with Large Language Models (LLMs), inspired by the simplicity and effectiveness of ODBC (Open Database Connectivity) drivers. Just as ODBC standardized database interactions across different systems, Lexikon aims to standardize LLM interactions while maintaining simplicity and flexibility.

## Why Lexikon?

While solutions like LangChain exist, they often provide more functionality than needed, leading to increased complexity, dependency bloat, and a higher learning curve. Lexikon takes a different approach:

- **Simplicity First**: Focus on core LLM interactions without the overhead of chains and agents
- **Functional Design**: Pure functional approach rather than class-based architecture
- **Minimal Dependencies**: Lightweight implementation with essential features only
- **Standard Interface**: Consistent API across different LLM providers
- **Composable Modules**: Use only what you need

## Supported Providers

| Provider | Models | Via |
|----------|--------|-----|
| Claude (Anthropic) | claude-3-opus, claude-3-sonnet, claude-3-haiku, claude-3.5-sonnet, claude-3.5-haiku | Direct API |
| Gemini (Google) | gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash | Direct API |
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4-turbo | OpenRouter |
| DeepSeek | deepseek-r1-distill-llama-70b | Groq |
| Mixtral | mixtral-8x7b-32768 | Groq |

## Quick Start

### Prerequisites

- [Deno](https://deno.land/) runtime installed
- API keys for your chosen provider(s)

### Basic Usage

```typescript
import { createLLMClient } from "@lexikon/llm";

const client = createLLMClient("claude", {
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
  model: "claude-3-sonnet-20240229",
});

const response = await client.complete({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(response.content);
```

### Streaming

```typescript
import { ClaudeClient } from "@lexikon/llm";

const client = new ClaudeClient({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
  model: "claude-3-sonnet-20240229",
});

for await (const chunk of client.completeStream({
  messages: [{ role: "user", content: "Tell me a story" }],
})) {
  Deno.stdout.writeSync(new TextEncoder().encode(chunk.content));
}
```

### Template-Based Generation

```typescript
import { createGenerator } from "@lexikon/generator";
import { createLLMClient } from "@lexikon/llm";

const llm = createLLMClient("claude", {
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const result = await createGenerator({ llm })
  .loadTemplate("./prompts/template.md")
  .withContext({ topic: "TypeScript patterns" })
  .generate();
```

## Project Structure

```
lexikon/
├── llm/                    # Core LLM interface module
│   ├── src/
│   │   ├── clients/        # Provider implementations (claude, gemini, openai, etc.)
│   │   ├── providers/      # Low-level provider abstractions
│   │   ├── shared/         # Shared interfaces
│   │   └── utils/          # Logging, env utilities
│   ├── tests/              # Unit, integration, e2e tests
│   └── examples/           # Usage examples
│
├── generator/              # Template-based content generation
│   ├── src/
│   │   ├── generator.ts    # Main generator implementation
│   │   ├── template.ts     # Template loading and context injection
│   │   └── utils.ts        # Retry logic
│   └── tests/
│
├── examples/               # Combined usage examples
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## Modules

### @lexikon/llm

Core module providing a unified interface for LLM interactions.

**Key Features:**
- Factory pattern for client creation
- Streaming support with async iterators
- Token usage tracking
- Custom error handling with `LLMError`
- Flexible logging system

**Key Types:**
- `LLMClient` - Core interface with `complete()` and `completeStream()`
- `Message` - Role-based messages (user, assistant, system)
- `Completion` - Response with content and token usage
- `LLMConfig` - Configuration (apiKey, model, maxTokens, temperature)

### @lexikon/generator

Template-based content generation with LLM completion.

**Key Features:**
- Template loading from files
- Context variable injection
- Configurable retry logic
- Fluent/builder API

## Development

### Running Tests

```bash
# Run all tests
deno task test

# Run with coverage
deno task test:cov

# Run specific module tests
deno test llm/tests/
deno test generator/tests/
```

### Linting & Formatting

```bash
deno lint
deno fmt
```

### Type Checking

```bash
deno check llm/mod.ts
deno check generator/mod.ts
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | API key for Claude |
| `GOOGLE_API_KEY` | API key for Gemini |
| `OPENROUTER_API_KEY` | API key for OpenRouter (OpenAI access) |
| `GROQ_API_KEY` | API key for Groq (DeepSeek, Mixtral) |
| `LLM_LOG_LEVEL` | Logging level (debug, info, warn, error) |

## Architecture

Lexikon follows several design patterns:

- **Factory Pattern**: `createLLMClient()` for client instantiation
- **Strategy Pattern**: Interchangeable provider implementations
- **Builder Pattern**: Fluent API in generator module
- **Adapter Pattern**: Provider interface abstracting different API formats

## License

MIT License - See [LICENSE](LICENSE) for details.

Copyright (c) 2024 Matthew Pazaryna
