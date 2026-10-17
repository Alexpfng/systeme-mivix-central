export const LEGACY_STORE_KEY = 'mivix-store-v2';
export const MIGRATION_MARKER_KEY = 'mivix-content-items-migration-v1';
export const MIGRATION_VERSION = 2;

const DEFAULT_LEGACY_KEYS = [LEGACY_STORE_KEY, 'mivix-store', 'mivix'];
const CORE_FIELDS = new Set(['id', 'universe', 'created', 'type', 'title', 'txt', 'tag', 'fav']);
const ATTACHMENT_KEYS = ['attachment', 'attachments', 'file', 'files', 'media', 'asset', 'assets'];
const REFERENCE_KEYS = ['reference', 'references', 'ref', 'refs', 'source', 'sources', 'url', 'urls'];

function hash32(value, seed) {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hex32(value) {
  return value.toString(16).padStart(8, '0');
}

export function legacyIdToUuid(universeId, legacyId) {
  const source = `${String(universeId)}\u0000${String(legacyId)}`;
  const words = [2166136261, 2246822519, 3266489917, 668265263]
    .map((seed) => hash32(source, seed));
  const hex = words.map(hex32).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${(8 | (Number.parseInt(hex.slice(16, 17), 16) & 0x3)).toString(16)}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function resolveStorage(storage) {
  if (storage !== undefined) return storage;
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function safeGet(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function pickExisting(entry, keys) {
  const values = keys.flatMap((key) => asArray(entry[key]));
  return values.length ? values : undefined;
}

function parseCreatedAt(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value).toISOString();
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return new Date(value).toISOString();
  return new Date().toISOString();
}

function convertEntry(entry, universeId) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry) || !entry.id) return null;

  const legacy = {
    id: String(entry.id),
    ...Object.fromEntries(Object.entries(entry).filter(([key]) => !CORE_FIELDS.has(key))),
  };
  const attachments = pickExisting(entry, ATTACHMENT_KEYS);
  const references = pickExisting(entry, REFERENCE_KEYS);
  const metadata = {
    universe: entry.universe || universeId,
    favorite: Boolean(entry.fav),
    legacy,
  };

  if (attachments) metadata.attachments = attachments;
  if (references) metadata.references = references;

  const createdAt = parseCreatedAt(entry.created);
  return {
    id: legacyIdToUuid(entry.universe || universeId, entry.id),
    owner_id: null,
    title: typeof entry.title === 'string' ? entry.title : null,
    content_type: typeof entry.type === 'string' && entry.type.trim() ? entry.type : 'text',
    body: typeof entry.txt === 'string' ? entry.txt : null,
    tags: typeof entry.tag === 'string' && entry.tag.trim() ? [entry.tag] : [],
    metadata,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function readLegacyStorage(storage, { legacyKeys = DEFAULT_LEGACY_KEYS } = {}) {
  const target = resolveStorage(storage);
  if (!target || typeof target.getItem !== 'function') {
    return { status: 'unavailable', entries: [], errors: [] };
  }

  for (const key of legacyKeys) {
    const raw = safeGet(target, key);
    if (raw === null || raw === '') continue;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { status: 'invalid', entries: [], errors: [`${key} ne contient pas un objet d'univers.`] };
      }

      const entries = [];
      const idMapping = [];
      const errors = [];
      for (const [universeId, universeEntries] of Object.entries(parsed)) {
        if (!Array.isArray(universeEntries)) {
          errors.push(`${universeId} ignoré : la valeur n'est pas une liste.`);
          continue;
        }
        universeEntries.forEach((entry, index) => {
          const converted = convertEntry(entry, universeId);
          if (converted) {
            entries.push(converted);
            idMapping.push({
              legacyId: converted.metadata.legacy.id,
              universeId: converted.metadata.universe,
              id: converted.id,
            });
          }
          else errors.push(`${universeId}[${index}] ignoré : entrée invalide ou sans id.`);
        });
      }
      return { status: 'ready', key, data: parsed, entries, errors, idMapping };
    } catch {
      return { status: 'invalid', entries: [], errors: [`${key} contient un JSON invalide.`] };
    }
  }

  return { status: 'missing', entries: [], errors: [] };
}

function getMarker(storage) {
  const raw = safeGet(storage, MIGRATION_MARKER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function createBackupFailure() {
  return {
    message: 'Le backup local n’a pas pu être créé.',
    detail: 'Aucune écriture distante ni marqueur local n’a été effectué.',
  };
}

export function createBackupPayload(entries, timestamp, legacyData, idMapping = []) {
  const filename = `mivix-local-backup-${new Date(timestamp).toISOString().replace(/[:.]/g, '-')}.json`;
  const json = JSON.stringify({
    exportedAt: new Date(timestamp).toISOString(),
    source: LEGACY_STORE_KEY,
    legacyData,
    entries,
    idMapping,
  }, null, 2);
  return { filename, json };
}

export function downloadBackup({ filename, json }) {
  if (typeof document === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return filename;
  }
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return filename;
}

export async function migrateLegacyStorage({
  storage,
  legacyKeys,
  upsertContentItems,
  userId,
  exportBackup = downloadBackup,
  now = () => Date.now(),
} = {}) {
  const target = resolveStorage(storage);
  if (!target || typeof target.getItem !== 'function') return { status: 'unavailable', entries: [], errors: [] };

  const marker = getMarker(target);
  if (marker?.version === MIGRATION_VERSION) return { status: 'already-migrated', marker, entries: [], errors: [] };

  const source = readLegacyStorage(target, { legacyKeys });
  if (source.status === 'missing') return { status: 'empty', entries: [], errors: [] };
  if (source.status === 'invalid') return source;
  if (!userId) {
    return {
      status: 'missing-user',
      entries: source.entries,
      errors: [...source.errors, 'Utilisateur authentifié requis pour importer les données.'],
      idMapping: source.idMapping,
    };
  }

  const timestamp = now();
  const entries = source.entries.map((entry) => ({ ...entry, owner_id: userId }));
  const backup = createBackupPayload(entries, timestamp, source.data, source.idMapping);
  let backupResult;
  try {
    backupResult = await exportBackup(backup);
  } catch {
    const error = createBackupFailure();
    return {
      status: 'backup-failed',
      entries,
      errors: [...source.errors, error.message],
      error,
      backup,
      idMapping: source.idMapping,
    };
  }

  if (typeof upsertContentItems !== 'function') {
    return { status: 'awaiting-persistence', entries, errors: source.errors, backup, backupResult, idMapping: source.idMapping };
  }

  let remoteResult;
  try {
    remoteResult = await upsertContentItems(entries);
  } catch (error) {
    return {
      status: 'remote-failed',
      entries,
      errors: source.errors,
      error,
      backup,
      backupResult,
      idMapping: source.idMapping,
    };
  }
  const markerValue = {
    version: MIGRATION_VERSION,
    migratedAt: new Date(timestamp).toISOString(),
    sourceKey: source.key,
    count: entries.length,
    backupFilename: backup.filename,
    idMapping: source.idMapping,
  };
  if (!safeSet(target, MIGRATION_MARKER_KEY, JSON.stringify(markerValue))) {
    return {
      status: 'marker-failed',
      entries,
      errors: [...source.errors, 'Impossible d’enregistrer le marqueur local. Les IDs déterministes évitent les doublons lors d’une nouvelle tentative.'],
      backup,
      backupResult,
      remoteResult,
      idMapping: source.idMapping,
    };
  }

  return { status: 'migrated', entries, errors: source.errors, backup, backupResult, remoteResult, marker: markerValue, idMapping: source.idMapping };
}
