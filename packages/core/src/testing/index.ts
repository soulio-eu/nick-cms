import { describe, expect, test } from 'vitest';

import { DocumentKeyConflictError } from '../errors.js';
import type { Store, StoredDocument } from '../store.js';

let typeCounter = 0;

function uniqueType(): string {
  typeCounter += 1;
  return `contract-${String(typeCounter)}-${crypto.randomUUID()}`;
}

function document(type: string, overrides: Partial<StoredDocument> = {}): StoredDocument {
  return {
    id: crypto.randomUUID(),
    type,
    key: null,
    schemaVersion: 1,
    data: { value: 1 },
    createdAt: new Date('2026-01-02T03:04:05.123Z'),
    updatedAt: new Date('2026-01-02T03:04:05.123Z'),
    ...overrides,
  };
}

function at(milliseconds: number): Date {
  return new Date(Date.UTC(2026, 0, 1) + milliseconds);
}

/**
 * Registers Vitest tests that check a `Store` implementation against the `DocumentRecords`
 * contract. Call it from an adapter's test file. `makeStore` is called once per test and may
 * return the same, non-empty store every time: each test uses its own document type.
 */
export function describeStoreContract(name: string, makeStore: () => Store | Promise<Store>): void {
  const records = async () => (await makeStore()).documents;

  describe(`${name} satisfies the store contract`, () => {
    test('round-trips JSON data, dates with milliseconds, key and schema version', async () => {
      const store = await records();
      const stored = document(uniqueType(), {
        key: 'hello',
        schemaVersion: 3,
        data: {
          text: 'Příliš žluťoučký kůň 🐎',
          decimal: 0.1,
          negative: -42,
          nested: [
            [1, 2],
            [{ deep: true }, []],
          ],
          empty: {},
          nothing: null,
          flag: false,
        },
        createdAt: new Date('2026-03-04T05:06:07.891Z'),
        updatedAt: new Date('2026-03-05T05:06:07.012Z'),
      });
      await store.insert(stored);
      expect(await store.get(stored.type, stored.id)).toEqual(stored);
    });

    test('get returns null for a missing id and for an id of another type', async () => {
      const store = await records();
      const stored = document(uniqueType());
      await store.insert(stored);
      expect(await store.get(stored.type, crypto.randomUUID())).toBeNull();
      expect(await store.get(uniqueType(), stored.id)).toBeNull();
    });

    test('getByKey finds a document by key within its type only', async () => {
      const store = await records();
      const stored = document(uniqueType(), { key: 'about' });
      await store.insert(stored);
      expect(await store.getByKey(stored.type, 'about')).toEqual(stored);
      expect(await store.getByKey(stored.type, 'missing')).toBeNull();
      expect(await store.getByKey(uniqueType(), 'about')).toBeNull();
    });

    test('documents without a key never conflict', async () => {
      const store = await records();
      const type = uniqueType();
      await store.insert(document(type));
      await store.insert(document(type));
      expect(await store.list(type, { limit: 10 })).toHaveLength(2);
    });

    test('a key held by another document of the type throws DocumentKeyConflictError', async () => {
      const store = await records();
      const type = uniqueType();
      await store.insert(document(type, { key: 'taken' }));
      await expect(store.insert(document(type, { key: 'taken' }))).rejects.toBeInstanceOf(
        DocumentKeyConflictError,
      );
    });

    test('the same key may exist in two types', async () => {
      const store = await records();
      const first = document(uniqueType(), { key: 'shared' });
      const second = document(uniqueType(), { key: 'shared' });
      await store.insert(first);
      await store.insert(second);
      expect(await store.getByKey(second.type, 'shared')).toEqual(second);
    });

    test('a key is free again after its document is deleted', async () => {
      const store = await records();
      const type = uniqueType();
      const first = document(type, { key: 'reused' });
      await store.insert(first);
      await store.delete(type, first.id);
      const second = document(type, { key: 'reused' });
      await store.insert(second);
      expect(await store.getByKey(type, 'reused')).toEqual(second);
    });

    test('an id that exists in any type is rejected', async () => {
      const store = await records();
      const first = document(uniqueType());
      await store.insert(first);
      await expect(store.insert(document(uniqueType(), { id: first.id }))).rejects.toThrow();
    });

    test('list orders by createdAt, then id, within the type, and honours limit', async () => {
      const store = await records();
      const type = uniqueType();
      const base = crypto.randomUUID();
      const late = document(type, { createdAt: at(2000) });
      const tieA = document(type, { id: `${base}-a`, createdAt: at(1001) });
      const tieB = document(type, { id: `${base}-b`, createdAt: at(1001) });
      const early = document(type, { createdAt: at(5) });
      for (const row of [late, tieB, early, tieA]) {
        await store.insert(row);
      }
      await store.insert(document(uniqueType(), { createdAt: at(1) }));
      expect(await store.list(type, { limit: 10 })).toEqual([early, tieA, tieB, late]);
      expect(await store.list(type, { limit: 2 })).toEqual([early, tieA]);
    });

    test('list returns documents strictly after a position, across createdAt ties', async () => {
      const store = await records();
      const type = uniqueType();
      const base = crypto.randomUUID();
      const first = document(type, { id: `${base}-a`, createdAt: at(7) });
      const second = document(type, { id: `${base}-b`, createdAt: at(7) });
      const third = document(type, { id: `${base}-c`, createdAt: at(7) });
      for (const row of [third, second, first]) {
        await store.insert(row);
      }
      expect(await store.list(type, { limit: 1, after: first })).toEqual([second]);
      expect(await store.list(type, { limit: 10, after: second })).toEqual([third]);
      expect(await store.list(type, { limit: 10, after: third })).toEqual([]);
    });

    test('list compares the position as (createdAt, id), not field by field', async () => {
      const store = await records();
      const type = uniqueType();
      const base = crypto.randomUUID();
      const earlierHighId = document(type, { id: `${base}-z`, createdAt: at(5) });
      const laterLowId = document(type, { id: `${base}-a`, createdAt: at(6) });
      await store.insert(earlierHighId);
      await store.insert(laterLowId);
      expect(await store.list(type, { limit: 10, after: earlierHighId })).toEqual([laterLowId]);
    });

    test('list accepts a position whose document no longer exists', async () => {
      const store = await records();
      const type = uniqueType();
      const first = document(type, { createdAt: at(1) });
      const gone = document(type, { createdAt: at(2) });
      const last = document(type, { createdAt: at(3) });
      for (const row of [first, gone, last]) {
        await store.insert(row);
      }
      await store.delete(type, gone.id);
      const position = { createdAt: gone.createdAt, id: gone.id };
      expect(await store.list(type, { limit: 10, after: position })).toEqual([last]);
    });

    test('replace changes data, schema version and updatedAt, and keeps key and createdAt', async () => {
      const store = await records();
      const stored = document(uniqueType(), { key: 'kept' });
      await store.insert(stored);
      const change = { data: { value: 2 }, schemaVersion: 2, updatedAt: at(99_999) };
      const expected = { ...stored, ...change };
      expect(await store.replace(stored.type, stored.id, change)).toEqual({
        outcome: 'replaced',
        document: expected,
      });
      expect(await store.get(stored.type, stored.id)).toEqual(expected);
    });

    test('replace accepts the same schema version', async () => {
      const store = await records();
      const stored = document(uniqueType(), { schemaVersion: 2 });
      await store.insert(stored);
      const change = { data: { value: 2 }, schemaVersion: 2, updatedAt: at(1) };
      expect(await store.replace(stored.type, stored.id, change)).toEqual({
        outcome: 'replaced',
        document: { ...stored, ...change },
      });
    });

    test('replace refuses a document stored at a newer schema version', async () => {
      const store = await records();
      const stored = document(uniqueType(), { schemaVersion: 3 });
      await store.insert(stored);
      const change = { data: { value: 2 }, schemaVersion: 2, updatedAt: at(1) };
      expect(await store.replace(stored.type, stored.id, change)).toEqual({
        outcome: 'newer',
        schemaVersion: 3,
      });
      expect(await store.get(stored.type, stored.id)).toEqual(stored);
    });

    test('replace reports a missing document and ignores other types', async () => {
      const store = await records();
      const stored = document(uniqueType(), { schemaVersion: 3 });
      await store.insert(stored);
      const change = { data: { value: 2 }, schemaVersion: 1, updatedAt: at(1) };
      expect(await store.replace(stored.type, crypto.randomUUID(), change)).toEqual({
        outcome: 'missing',
      });
      expect(await store.replace(uniqueType(), stored.id, change)).toEqual({ outcome: 'missing' });
      expect(await store.get(stored.type, stored.id)).toEqual(stored);
    });

    test('delete reports whether it removed a document, within the type only', async () => {
      const store = await records();
      const stored = document(uniqueType());
      await store.insert(stored);
      expect(await store.delete(uniqueType(), stored.id)).toBe(false);
      expect(await store.get(stored.type, stored.id)).toEqual(stored);
      expect(await store.delete(stored.type, stored.id)).toBe(true);
      expect(await store.delete(stored.type, stored.id)).toBe(false);
      expect(await store.get(stored.type, stored.id)).toBeNull();
    });
  });
}
