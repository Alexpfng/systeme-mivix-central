import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

test('declares the MIVIX display and sans fonts in the document head', () => {
  expect(indexHtml).toContain('fonts.googleapis.com/css2?family=Hanken+Grotesk');
  expect(indexHtml).toContain('family=Schibsted+Grotesk');
  expect(indexHtml).toContain('fonts.gstatic.com');
});
