# @skarab/skaffold

The best way to generate a project as I would do it myself (Kappa)

## Installation

```bash
pnpm add --global @skarab/skaffold
```

## Example

```bash
skaffold create amazing-project
cd ./amazing-project
pnpm install
pnpm update # optional
```

## Usage

```bash
Usage: skaffold create [options] [name]

Create a new project.

If the package name is not provided, a random name will be generated.

Arguments:
  name                          a valid npm package name (default: "random")

Options:
  -f, --features [features...]  features to includes (choices: "all", "none", "lint-staged", "vitest", "vitest-type-assert", default: "all")
  --user-name [name]            user name
  --user-email [email]          user email
  --min-node-version [version]  min node version
  --min-pnpm-version [version]  min pnpm version
  -i, --interactive             interactive prompt (default: false)
  --list-created-files          list created files (default: true)
  --no-colors                   disable colors in output
  -h, --help                    display help for command
```
