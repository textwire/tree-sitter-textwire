# Tree Sitter Parser for Textwire

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
> [!NOTE]
> If you use [🐳 Docker](https://app.docker.com/) instead of [🦦 Podman](https://podman.io/), just replace `podman-compose` with `docker compose` in code examples below.

#### Build the Image
To build the image, run this command:
```bash
podman-compose build
```

#### Enter the Container
To enter inside the container, run this command:
```bash
podman-compose run --rm app
```

You'll be able to run [NPM commands](#npm-commands-available) inside of the container.

## License
The Tree Sitter Textwire project is licensed under the [MIT License](https://github.com/textwire/tree-sitter-textwire/blob/main/LICENSE)
