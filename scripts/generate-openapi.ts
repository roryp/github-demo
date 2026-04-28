#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSpec } from '../src/openapi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '..', 'openapi.json');

const spec = generateSpec();
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2) + '\n');
console.log(`OpenAPI spec written to ${outPath}`);
