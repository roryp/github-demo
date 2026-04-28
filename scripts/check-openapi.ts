#!/usr/bin/env tsx
/**
 * CI check: verifies the committed openapi.json matches what the generator produces.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSpec } from '../src/openapi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specPath = path.resolve(__dirname, '..', 'openapi.json');

if (!fs.existsSync(specPath)) {
  console.error('openapi.json not found. Run `npm run docs:api` first.');
  process.exit(1);
}

const committed = fs.readFileSync(specPath, 'utf-8');
const generated = JSON.stringify(generateSpec(), null, 2) + '\n';

if (committed !== generated) {
  console.error(
    'openapi.json is out of date. Run `npm run docs:api` and commit the result.',
  );
  process.exit(1);
}

console.log('openapi.json is up to date.');
