import { describeStoreContract } from '@nick-cms/core/testing';
import { env } from 'cloudflare:workers';

import { createD1Store } from '../src/index.js';

describeStoreContract('D1 store', () => createD1Store(env.DB));
