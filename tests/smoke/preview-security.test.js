import { isVisualPreview } from '../../src/main';

test('production-like environments never enable the unauthenticated visual preview', () => {
  const location = new URL('http://localhost/?preview=mivix');

  expect(isVisualPreview(location, {})).toBe(false);
  expect(isVisualPreview(location, { DEV: false })).toBe(false);
});
