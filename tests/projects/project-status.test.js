import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  canTransitionProjectStatus,
} from '../../src/projects/projectStatus';

test('defines the complete MIVIX project lifecycle', () => {
  expect(PROJECT_STATUSES).toEqual([
    'idea',
    'exploring',
    'preparing',
    'active',
    'paused',
    'launched',
    'archived',
  ]);
  expect(PROJECT_STATUS_LABELS.idea).toBe('Idée');
  expect(PROJECT_STATUS_LABELS.archived).toBe('Archivé');
});

test('allows useful forward and pause transitions but prevents reopening archived projects', () => {
  expect(canTransitionProjectStatus('idea', 'exploring')).toBe(true);
  expect(canTransitionProjectStatus('active', 'paused')).toBe(true);
  expect(canTransitionProjectStatus('paused', 'active')).toBe(true);
  expect(canTransitionProjectStatus('archived', 'active')).toBe(false);
  expect(canTransitionProjectStatus('idea', 'launched')).toBe(false);
});
