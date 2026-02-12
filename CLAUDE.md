# CLAUDE.md — AGX (Architecture Graph Language)

## Project Overview

AGX is a Domain-Specific Language (DSL) for describing hierarchical graphs and system architectures, built with [Langium](https://langium.org/). It allows users to define types, nodes, edges, and their relationships through a specialized syntax.

## Repository Structure

```
agx/
├── samples/                          # Example .agx files
├── recipe.md                         # Langium development workflow guide
└── argx/                             # Main workspace (npm workspaces)
    ├── packages/
    │   ├── language/                  # Core language definition (grammar, AST, validation, scoping)
    │   │   ├── src/
    │   │   │   ├── achitecture-graph.langium          # Grammar definition
    │   │   │   ├── achitecture-graph-module.ts         # Dependency injection module
    │   │   │   ├── achitecture-graph-validator.ts      # Semantic validation rules
    │   │   │   ├── architecture-graph-scopes.ts        # Cross-reference scope provider
    │   │   │   ├── architecture-graph-stdlib.ts        # Built-in standard library
    │   │   │   ├── generated/                          # Auto-generated from grammar (do NOT edit)
    │   │   │   └── index.ts                            # Public exports
    │   │   └── test/                                   # Vitest tests
    │   ├── cli/                       # Command-line interface
    │   │   ├── bin/cli.js             # Entry point
    │   │   └── src/
    │   │       ├── main.ts            # CLI commands (Commander)
    │   │       └── generator.ts       # Code generator from AST
    │   └── extension/                 # VSCode extension (language client + server)
    └── playground/                    # TypeScript playground
```

## Build & Development Commands

All commands run from `/home/user/agx/argx/`:

```bash
npm run build                # Build all packages
npm run watch                # Watch mode compilation
npm run langium:generate     # Generate AST/parser from grammar (required after grammar changes)
npm run langium:watch        # Watch grammar changes and regenerate
npm run test                 # Run tests (vitest)
npm run clean                # Clean build artifacts
```

Typical workflow after changing the grammar:
```bash
npm run langium:generate && npm run build
```

## Testing

- **Framework:** Vitest (v3.1.3)
- **Config:** `argx/packages/language/vitest.config.ts`
- **Test files:** `argx/packages/language/test/*.test.ts`
  - `parsing.test.ts` — Parser validation
  - `linking.test.ts` — Cross-reference linking
  - `validating.test.ts` — Semantic validation rules

Run tests:
```bash
cd argx && npm run test
```

Tests use Langium's `parseHelper` with `EmptyFileSystem` for isolation. Always call `clearDocuments()` after tests.

## Key Conventions

### Naming
- **Files:** kebab-case (`architecture-graph-scopes.ts`)
- **Classes:** PascalCase (`AchitectureGraphValidator`)
- **Note:** The spelling "achitecture" (missing 'r') is intentional and consistent throughout — do not "fix" it

### TypeScript
- Strict mode enabled (`strict: true`)
- `noUnusedLocals`, `noImplicitReturns`, `noImplicitOverride` enforced
- ES2020 target, ES modules
- Source maps enabled

### Language Package Patterns
- **Validators** extend Langium's `ValidationRegistry`, use `ValidationAcceptor` to report `'warning'` or `'error'`
- **Scope providers** implement `ScopeProvider`, override `getScope()`, use `MapScope` for named lookups
- **Exports** go through `src/index.ts` which re-exports everything including generated code
- **Generated files** in `src/generated/` (ast.ts, grammar.ts, module.ts) are auto-generated — never edit manually

### Grammar (`.langium`) Quick Reference
```
Model       := (Attribute | AType | ANode | AEdge)*
AType       := 'type' name (':' supers)? ('{' attributes '}' | ';')
ANode       := kind name ('{' attributes | nodes | edges '}' | ';')
AEdge       := source '->' target (':' kind)? ';'?
Attribute   := name '=' value ';'?
```

## Dependencies

| Package | Purpose |
|---------|---------|
| langium ~4.2.0 | Core DSL framework |
| langium-cli ~4.2.0 | Grammar-to-AST generation |
| vitest ~3.1.3 | Testing |
| commander ~11.1.0 | CLI argument parsing |
| chalk ~5.3.0 | Terminal colors |
| vscode-languageclient/server ~9.0.1 | LSP integration |
| esbuild ~0.25.5 | Extension bundling |
| typescript ~5.8.3 | Compiler |

## No Linter/Formatter

There is no ESLint or Prettier configured. TypeScript strict mode is the primary code quality gate.

## No CI/CD

No GitHub Actions or CI pipeline is configured. Development is VSCode-oriented with launch configs for debugging the extension and language server.
