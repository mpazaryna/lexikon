# Documentation

This directory contains the API documentation for the Lexikon project.

## Generated Documentation

The API documentation is generated using Deno's built-in documentation generator. The generated files are not stored in the repository, but you can easily generate them locally.

### How to Generate

Run the following command from the project root:

```bash
deno task docs
```

This will generate HTML documentation in the `docs/api` directory.

### What's Generated

The documentation includes:

- All exported types and interfaces
- Function signatures and parameters
- Module exports and their descriptions
- JSDoc comments from the codebase

### Viewing the Documentation

After generation, open `docs/api/index.html` in your web browser to view the documentation. 