import { describeStoreContract } from './testing/index.js';
import { createMemoryStore } from './memory-store.test-support.js';

describeStoreContract('memory store', createMemoryStore);
