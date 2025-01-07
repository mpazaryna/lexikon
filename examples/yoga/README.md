# Yoga Generators

## Create and Evaluate

```bash
deno run --allow-net --allow-env --allow-read --allow-write examples/yoga/generate.ts --provider=openai
deno run --allow-net --allow-env --allow-read --allow-write examples/yoga/generate.ts --provider=claude
deno run --allow-net --allow-env --allow-read --allow-write examples/yoga/generate.ts --provider=gemini
deno run --allow-net --allow-env --allow-read --allow-write examples/yoga/generate.ts --provider=groq
```

## Improve

```bash
# Basic usage
deno run --allow-read --allow-write examples/yoga/improve.ts --provider=claude
```
