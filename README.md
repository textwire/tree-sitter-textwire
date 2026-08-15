# Tree Sitter Parser for Textwire

This is a Tree-sitter parser for Textwire templating language for Go.

## Commands

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

## External Scanner

Handles TEXT tokens and detects:
- Directives starting with @ (e.g., @if, @for)
- Brace statements {{ }}
- `_OPEN_PAREN` - Hidden external token to disambiguate `@slot` from `@slot('name')`

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

## NPM Commands

### Install Dependencies
Run the following command to install the required NPM dependencies:
```bash
npm i
```

## Available Make Commands
You can find Make commands in the [Makefile](Makefile) in the root of the project.

### Build the parser
Run the following command to build the parser:
```bash
make generate
```

### Install / Setup tree sitter
Run the following command to install tree sitter:
```bash
make install
```

### Test that everything works
Run the following command to test that everything works:
```bash
make test
```

## Contribute

### With a Container Engine

#### Build the Image
To build the image, run this command.

With Podman:
```bash
podman-compose build
```

With Docker:
```bash
docker compose build
```

#### Create `node_modules`
Run this command to install npm packages and generate a `node_modules` directory on your local machine.

With Podman:
```bash
podman-compose run --rm app npm i
```

With Docker:
```bash
docker compose run --rm app npm i
```

#### Enter the Container
To enter inside the container, run this command.

With Podman:
```bash
podman-compose run --rm app
```

With Docker:
```bash
docker compose run --rm app
```

You'll be able to run [NPM commands](#npm-commands-available) inside of the container.

## License

The Tree Sitter Textwire project is licensed under the [MIT License](https://codeberg.org/textwire/tree-sitter-textwire/src/branch/master/LICENSE)
