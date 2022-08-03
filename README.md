# @skarab/skaffold

The best way to scaffold a project as I would do it myself (Kappa)

## Features

- 🧱 `recommended`: always included!
  - Setup the holy trinity: [Prettier](https://prettier.io/), [ESLint](https://eslint.org/), [TypeScript](https://www.typescriptlang.org/) with my [shared configuration](#my-shared-configurations).
  - Setup [GitHub Actions](https://github.com/features/actions) to run the trinity on `push` and `pull_request`.
- 🔎 `lint-staged`: Setup [lint-staged](https://github.com/okonet/lint-staged) and [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks) to run Prettier and ESLint on staged files.
- ✅ `vitest`: Setup [Vitest](https://vitest.dev/) and create a minimal example in the `./test` directory.
- 🔥 `vitest-type-assert`: Setup [vite-plugin-vitest-typescript-assert](https://github.com/skarab42/vite-plugin-vitest-typescript-assert) and create a minimal example in the `./test` directory.
- 📦 `release`: Setup [semantic-release](https://github.com/semantic-release/semantic-release) for automatic release on NPM via GitHub Actions (see [Before publishing](#before-publishing)).

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
  -f, --features [features...]  features to includes (choices: "all", "recommended", "lint-staged", "vitest", "vitest-type-assert", "release", default: "all")
  --user-name [name]            user name
  --user-email [email]          user email
  --min-node-version [version]  min node version
  --min-pnpm-version [version]  min pnpm version
  -p, --public                  public package (default: false)
  -i, --interactive             interactive prompt (default: false)
  --list-created-files          list created files (default: false)
  --no-colors                   disable colors in output
  -h, --help                    display help for command
```

## Before publishing

If you have selected the `release` feature, please check the following points:

1. Make sure you add your [NPM_TOKEN](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow) as a secret in your [repo configuration](https://docs.github.com/en/actions/security-guides/encrypted-secrets).
2. Edit the `.gitignore` file and comment/uncomment the lines required for publication.

   ```bash
   # remove or comment the following line when you want to publish
   .github/workflows/test-release.yaml

   # uncomment the following line when you want to publish
   # .github/workflows/test.yaml
   ```

3. Edit the `package.json` and make it public.
   `json { "private": false, "publishConfig": { "access": "public" }, } `
   It's all good 🚀 the next time you push on the main branch your package will be automatically published on NPM.

## My shared configurations

- [@skarab/eslint-config](https://github.com/skarab42/eslint-config)
- [@skarab/prettier-config](https://github.com/skarab42/prettier-config)
- [@skarab/typescript-config](https://github.com/skarab42/typescript-config)
