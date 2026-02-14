This is a Tree-sitter parser for Textwire templating language for Go.

## Commands (run via Podman)

All commands must be run inside the Podman container:

```bash
podman-compose run --rm app <command>
```

| Command | Description |
|---------|-------------|
| `make test` | Generate grammar and run all tests |
| `npm run tree-sitter -- test --filter "test name"` | Run single test by name |
| `make parse` | Parse the example.tw file |
| `make generate` | Generate C parser from grammar.js |
| `make compile` | Compile parser into textwire.so |

## Structure

- `grammar.js` - Grammar definition using Tree-sitter DSL
- `src/scanner.c` - External scanner for text tokenization
- `src/parser.c` - Generated C parser (do not edit)
- `test/corpus/` - Test cases in Tree-sitter format
- `example.tw` - Contains Textwire syntax examples for manual testing (use with `make parse`)

## Grammar

Grammar uses Tree-sitter's JavaScript DSL:
- `word` - keyword extraction optimization
- `externals` - tokens handled by external scanner
- `extras` - whitespace/comments to ignore
- Use `field()` to name children
- Use `prec.left()` / `prec.right()` for associativity

Example:
```javascript
module.exports = grammar({
  name: 'textwire',
  externals: $ => [$.text],
  rules: {
    program: $ => repeat($._definition),
  },
})
```

## External Scanner

Handles TEXT tokens and detects:
- Directives starting with @ (e.g., @if, @for)
- Brace statements {{ }}

## Tests

Test format in `test/corpus/*.txt`:
```
==================
Test description
==================
Input text
---

(expected parse tree)
```

Run tests:
```bash
podman-compose run --rm app make test
podman-compose run --rm app npm run tree-sitter -- test --filter "test name"
```
