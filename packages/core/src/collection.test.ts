import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { defineCollection } from './collection.js';

const schema = z.object({ title: z.string() });

describe('defineCollection', () => {
  test('defaults the version to 1', () => {
    expect(defineCollection({ type: 'note', schema }).version).toBe(1);
  });

  test('rejects an empty type', () => {
    expect(() => defineCollection({ type: '', schema })).toThrow(TypeError);
  });

  test.each([0, -1, 1.5])('rejects version %s', (version) => {
    expect(() =>
      defineCollection({ type: 'note', schema, version, migrate: () => ({ title: '' }) }),
    ).toThrow(TypeError);
  });

  test('requires migrate above version 1', () => {
    const definition = { type: 'note', schema, version: 2 } as unknown as Parameters<
      typeof defineCollection
    >[0];
    expect(() => defineCollection(definition)).toThrow(TypeError);
  });
});
