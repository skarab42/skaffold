import { test } from 'vitest';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';
import { api } from '../source/index.js';

test('The Ultimate Question of Life', () => {
  expectType(api.life).identicalTo<number>();
});
