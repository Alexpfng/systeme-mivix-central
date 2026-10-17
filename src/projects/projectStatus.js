export const PROJECT_STATUSES = [
  'idea',
  'exploring',
  'preparing',
  'active',
  'paused',
  'launched',
  'archived',
];

export const PROJECT_STATUS_LABELS = {
  idea: 'Idée',
  exploring: 'Exploration',
  preparing: 'Préparation',
  active: 'En cours',
  paused: 'En pause',
  launched: 'Lancé',
  archived: 'Archivé',
};

const ALLOWED_TRANSITIONS = {
  idea: ['idea', 'exploring'],
  exploring: ['exploring', 'preparing', 'paused'],
  preparing: ['preparing', 'active', 'paused'],
  active: ['active', 'paused', 'launched'],
  paused: ['paused', 'active', 'archived'],
  launched: ['launched', 'archived'],
  archived: ['archived'],
};

export function canTransitionProjectStatus(from, to) {
  return Boolean(ALLOWED_TRANSITIONS[from]?.includes(to));
}
