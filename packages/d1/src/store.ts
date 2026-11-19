import type { Store } from '@nick-cms/core';

import type { D1DatabaseLike } from './d1.js';
import { createD1DocumentRecords } from './documents.js';

/** A `Store` over a D1 database that has Nick's migrations applied. */
export function createD1Store(db: D1DatabaseLike): Store {
  return { documents: createD1DocumentRecords(db) };
}
