# @skarab/skaffold

The best way to scaffold a project as I would do it myself.

## Features

- 📐 Setup the holy trinity: [Prettier](https://prettier.io/), [ESLint](https://eslint.org/), [TypeScript](https://www.typescriptlang.org/) with my [shared configuration](#my-shared-configurations).
- 🤖 Setup [GitHub Actions](https://github.com/features/actions) to run the trinity on `push` and `pull_request`.
- 🔎 Setup [lint-staged](https://github.com/okonet/lint-staged) and [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks) to run Prettier and ESLint on staged files.
- ✅ Setup [Vitest](https://vitest.dev/) and create a minimal example in the `./test` directory.
- 📦 Setup [semantic-release](https://github.com/semantic-release/semantic-release) for automatic release on NPM via GitHub Actions (see [Publishing](#before-publishing)).

## Installation

```bash
pnpm add --global @skarab/skaffold
```

## Example

```bash
skaffold my-amazing-project
cd ./my-amazing-project
pnpm install
pnpm update # optional
```

## Usage

```ts
Usage: skaffold [options] [command]

The best way to scaffold a project as I would do it myself (Kappa).

Options:
  -v, --version            output the version number
  -h, --help               display help for command

Commands:
  create [options] [name]  create a new project
  help [command]           display help for command
```

## Publishing

If you have selected the `release` feature when creating your project, please check the following points:

1. Make sure you add your [NPM_TOKEN](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow) as a secret in your [repo configuration](https://docs.github.com/en/actions/security-guides/encrypted-secrets).
2. Edit the `.github/workflows/CI.yml` file and uncomment the `release` job.
3. Edit the `package.json` and make your project public.

   ```json
   {
     "private": false,
     "publishConfig": {
       "access": "public"
     }
   }
   ```

> The next time you push on the main branch your package will be automatically published on NPM 🚀

## My shared configurations

- [@skarab/eslint-config](https://github.com/skarab42/eslint-config)
- [@skarab/prettier-config](https://github.com/skarab42/prettier-config)
- [@skarab/typescript-config](https://github.com/skarab42/typescript-config)
