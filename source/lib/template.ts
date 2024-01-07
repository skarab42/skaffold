import { createRequire } from 'node:module';
import path from 'node:path';

import fs from 'fs-extra';
import Handlebars from 'handlebars';
import * as prettier from 'prettier';

import type { Feature } from './features.js';
import { metaDirname } from './meta.js';
import type { SkaffoldBuildConfig, Type } from './skaffold.js';

export type TemplateFactory = {
  clearOutputDirectory(): void;
  copy(templateName: string, data?: Record<string, unknown>): Promise<void>;
};

export async function templateFactory(config: SkaffoldBuildConfig): Promise<TemplateFactory> {
  const templateDirectory = path.resolve(metaDirname(import.meta), '..', '..', 'templates');

  Handlebars.registerHelper('yhear', () => new Date().getFullYear());
  Handlebars.registerHelper('isType', (type: Type) => type === config.type);
  Handlebars.registerHelper('isDefined', (...values) => values.every(Boolean));
  Handlebars.registerHelper('hasFeature', (...features: unknown[]) =>
    features.slice(0, -1).every((feature) => config.features.includes(feature as Feature)),
  );

  Handlebars.registerHelper('nodeVersionsPattern', () => {
    const lastIndex = config.nodeVersions.length - 1;
    return config.nodeVersions
      .map((version, index) => (index === lastIndex ? `>=${version}` : `^${version}`))
      .join(' || ');
  });

  const require = createRequire(import.meta.url);
  const prettierConfig = require.resolve('@skarab/prettier-config');
  const prettierOptions = await prettier.resolveConfig(prettierConfig);

  if (!prettierOptions) {
    throw new Error('No prettier config found.');
  }

  return {
    clearOutputDirectory: () => fs.emptyDirSync(config.outputDirectory),
    async copy(templateName) {
      const outputFilePath = path.resolve(config.outputDirectory, templateName);
      const templatePath = path.resolve(templateDirectory, `${templateName}.handlebars`);
      const templateText = fs.readFileSync(templatePath, 'utf8');

      const template = Handlebars.compile(templateText);
      let computed = template(config);

      try {
        computed = await prettier.format(computed, { ...prettierOptions, filepath: templateName });
      } catch (error: unknown) {
        if ((error as Error).name !== 'UndefinedParserError') {
          throw error;
        }
      }

      fs.outputFileSync(outputFilePath, computed);
    },
  };
}
