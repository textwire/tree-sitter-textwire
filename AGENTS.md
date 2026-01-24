This is a treesitter parser for Textwire templating language for Go.

## Instructions
- Don't run commands localy on the host, only inside of Podman container with `podman-compose run --rm app <your-command>` command.

## Structure
- `grammar.js` is where all the common grammar lives
- `src/scanner.c` is for more advanced parsing

## Commands
- `podman-compose run --rm app make test` Generate grammar into C code and run tests
- `podman-compose run --rm app make parse` Parse ./example.tw file
