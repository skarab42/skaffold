import type { SkaffoldBuildConfig } from './skaffold.js';
import { templateFactory } from './template.js';

export async function build(config: SkaffoldBuildConfig): Promise<void> {
  const template = await templateFactory(config);

  template.clearOutputDirectory();

  await template.copy('package.json');
  await template.copy('LICENSE.md');
  await template.copy('README.md');

  await template.copy('.gitignore');
  await template.copy('.eslintignore');
  await template.copy('.prettierignore');

  await template.copy('tsconfig.json');
  await template.copy('tsconfig.build.json');

  await template.copy('source/index.ts');

  if (config.features.includes('bin')) {
    await template.copy('source/bin/index.ts');
  }

  if (config.features.includes('test')) {
    await template.copy('test/index.test.ts');

    if (config.features.includes('coverage')) {
      await template.copy('vitest.config.mjs');
    }
  }

  await template.copy('.github/FUNDING.yml');
  await template.copy('.github/workflows/CI.yml');
}
