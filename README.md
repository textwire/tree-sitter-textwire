# Tree Sitter Parser for Textwire

> [!NOTE]
> This project support Container Engines like Docker and Podman, so, you don't need to have anything on your machine other than Git and a Container engine.

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

### Without a Container Engine
If you don't use container engines like [Podman](https://podman.io/) or [Docker](https://www.docker.com/), you need to do a little bit setup. You need to have things like `gcc`, `npm` and `node` installed on your machine.

### With a Container Engine
If you use container engines like [Podman](https://podman.io/) or [Docker](https://www.docker.com/) it's a lot easier for you. You just need to have Podman with Podman Compose or Docker with Docker Compose installed on your machine.

#### Build the Image
To build the image, run this command:
```bash
docker compose build
# for Podman, run this:
podman-compose build
```

#### Enter the Container
To enter inside the container, run this command:
```bash
docker compose run --rm app
# for Podman, run this:
podman-compose run --rm app
```

You'll be able to run [NPM commands](#npm-commands-available) inside of the container.

## License
The Tree Sitter Textwire project is licensed under the [MIT License](https://github.com/textwire/tree-sitter-textwire/blob/main/LICENSE)
