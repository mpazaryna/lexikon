# Lexikon: A Language Model Interface Framework

## Background

Lexikon provides a lightweight, standardized interface for interacting with Large Language Models (LLMs), inspired by the simplicity and effectiveness of ODBC (Open Database Connectivity) drivers. Just as ODBC standardized database interactions across different systems, Lexikon aims to standardize LLM interactions while maintaining simplicity and flexibility.

### Why Not LangChain?

While LangChain is a powerful framework, it often introduces unnecessary complexity for basic LLM interactions. Lexikon takes a different approach:

- **Simplicity First**: Focus on core LLM interactions without the overhead of chains and agents
- **Functional Design**: Pure functional approach rather than class-based architecture
- **Minimal Dependencies**: Lightweight implementation with essential features only
- **Standard Interface**: Consistent API across different LLM providers

## Features

- Multiple LLM Provider Support:
  - Claude (Anthropic)
  - GPT-4 (OpenAI)
  - Mixtral (Groq)
  - More coming soon...
- Context Management
- File Handling
- Response Processing
- Error Management

## Installation

```bash
# Coming soon
```

## Usage

```typescript
import { createProvider } from "@lexikon/core";

const llm = createProvider("claude", { temperature: 0.7 });
const response = await llm.generateContent("Your prompt here");
```

## Examples

The repository includes example implementations:

- Story Generation
- Yoga Sequence Creation

## Project Structure

```ascii
lexikon/
├── core/
│   ├── llm/
│   │   ├── types.ts
│   │   ├── factory.ts
│   │   └── providers/
│   └── context/
│       └── handler.ts
└── examples/
    ├── story/
    └── yoga/
```

## Roadmap

### Immediate TODOs

1. Stream Response Support
   - Implement streaming for real-time responses
   - Add progress indicators

2. Token Management
   - Add token counting
   - Implement context window management
   - Auto-chunking for large prompts

3. Error Handling
   - Enhance error types
   - Add retry mechanisms
   - Rate limiting support

4. Provider Extensions
   - Implement Azure OpenAI
   - Add Llama support

5. Testing
   - Unit tests for core functionality
   - Integration tests
   - Mock providers for testing

### Future Enhancements

1. Memory Systems
   - Simple conversation history
   - Context management
   - State persistence

2. Performance Optimization
   - Response caching
   - Batch processing
   - Request queuing

3. Monitoring
   - Usage tracking
   - Cost estimation
   - Performance metrics

4. Documentation
   - API documentation
   - Usage examples
   - Best practices guide

## Philosophy

Lexikon is built on three core principles:

1. **Simplicity**: Each component should do one thing well
2. **Standardization**: Consistent interface across providers
3. **Extensibility**: Easy to add new providers and features

Like ODBC drivers of the past, Lexikon aims to be the standard interface between applications and language models, providing a clean, consistent API while handling the complexity of different provider implementations.

## Contributing

Contributions are welcome! Please read our contributing guidelines for details.

## License

MIT

---

## Background Rationale

The development of Lexikon was motivated by a common pattern in LLM application development: the repeated implementation of similar infrastructure code across projects. This pattern mirrors the historical challenge in database connectivity that ODBC solved.

### Historical Parallel

Just as applications in the 80s and 90s needed a standardized way to interact with different databases (leading to ODBC), today's applications need a standardized way to interact with different LLMs. The current landscape of LLM interactions often involves:

1. Writing boilerplate code for each provider
2. Managing different response formats
3. Handling context and prompts
4. Error handling and retry logic

While solutions like LangChain exist, they often provide more functionality than needed, leading to:

- Increased complexity
- Dependency bloat
- Reduced flexibility
- Higher learning curve

Lexikon aims to provide the minimal necessary abstraction layer, similar to how ODBC provided a simple, standard interface for database operations.
