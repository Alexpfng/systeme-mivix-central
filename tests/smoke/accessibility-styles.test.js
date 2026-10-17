import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tokens = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

test('defines a visible focus ring for search and icon controls', () => {
  expect(tokens).toMatch(/\.mivix-search:focus-within,\s*button:focus-visible,\s*input:focus-visible/);
  expect(tokens).toMatch(/outline:\s*2px solid var\(--terracotta\)/);
  expect(tokens).toMatch(/outline-offset:\s*3px/);
});
