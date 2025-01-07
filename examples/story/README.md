# Story Domain

## Create / Evaluation

```bash
deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate.ts --provider=claude
deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate.ts --provider=gemini
deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate.ts --provider=openai
deno run --allow-net --allow-env --allow-read --allow-write examples/story/generate.ts --provider=groq
```

## Improvement

```bash
# Basic usage
deno run --allow-net --allow-env --allow-read --allow-write examples/story/improve.ts --provider=claude

# Run multiple improvement iterations
deno run --allow-net --allow-env --allow-read --allow-write examples/story/improve.ts --provider=claude --iterations=3

# Stop when reaching a minimum score
deno run --allow-net --allow-env --allow-read --allow-write examples/story/improve.ts --provider=claude --min-score=0.85

# Focus on specific criteria
deno run --allow-net --allow-env --allow-read --allow-write examples/story/improve.ts --provider=claude --focus="Character Development,Plot Coherence"

# Specify a different story concept
deno run --allow-net --allow-env --allow-read --allow-write examples/story/improve.ts --provider=claude --concept="astronaut"

# Combine options
deno run --allow-net --allow-env --allow-read --allow-write examples/story/improve-story.ts --provider=claude --iterations=5 --min-score=0.9 --focus="Character Development,Theme Development" --concept="detective"
```