import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tokens = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

test('defines a visible focus ring for search and icon controls', () => {
  const focusRule = tokens.match(/\.mivix-search:focus-within,[\s\S]*?\}/)?.[0] ?? '';

  expect(focusRule).toMatch(/\.mivix-search:focus-within,\s*\.mivix-icon-button:focus-visible/);
  expect(tokens).toMatch(/outline:\s*2px solid var\(--terracotta\)/);
  expect(tokens).toMatch(/outline-offset:\s*3px/);
  expect(tokens).toMatch(/\.mivix-search input:focus-visible\s*\{\s*outline:\s*0;/);
  expect(focusRule).not.toMatch(/input:focus-visible/);
});
