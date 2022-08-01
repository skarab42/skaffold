import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';
import { expect, test } from 'vitest';
import { api } from '../src/index.js';

test('type assertion', () => {
  expectType(api.life).identicalTo<number>();
});

test('value assertion', () => {
  expect(api.life).toBe(42);
});
