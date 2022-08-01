import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';
import { expect, test } from 'vitest';

test('type assertion', () => {
  expectType<string>().assignableTo('life');
});

test('value assertion', () => {
  expect(42).toBe(42);
});
