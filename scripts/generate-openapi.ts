import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openApiSpec } from '../src/openapi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(__dirname, '..', 'openapi.json');

const serialized = JSON.stringify(openApiSpec, null, 2) + '\n';
const isCheck = process.argv.includes('--check');

if (isCheck) {
  if (!fs.existsSync(outFile)) {
    console.error('openapi.json is missing. Run `npm run docs:api`.');
    process.exit(1);
  }
  const current = fs.readFileSync(outFile, 'utf8');
  if (current !== serialized) {
    console.error('openapi.json is out of date. Run `npm run docs:api`.');
    process.exit(1);
  }
  console.log('openapi.json is up to date.');
} else {
  fs.writeFileSync(outFile, serialized);
  console.log(`Wrote ${path.relative(process.cwd(), outFile)}`);
}
