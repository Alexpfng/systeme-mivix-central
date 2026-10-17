import { useState } from 'react';
import {
  migrateLegacyStorage,
  readLegacyStorage,
} from './legacyStorage';

function statusMessage(status) {
  if (status === 'unavailable') return 'LocalStorage indisponible : aucune donnée ne sera modifiée.';
  if (status === 'empty') return 'Aucune donnée locale à importer.';
  if (status === 'invalid') return 'Les données locales ne sont pas lisibles. Rien n’a été modifié.';
  return null;
}

export default function MigrationDialog({
  storage,
  userId,
  source: providedSource,
  migrate = migrateLegacyStorage,
  upsertContentItems,
  exportBackup,
  onComplete,
}) {
  const [source] = useState(() => providedSource || readLegacyStorage(storage));
  const [state, setState] = useState({ status: 'idle', result: null });
  const unavailableMessage = statusMessage(source.status);
  const canMigrate = source.status === 'ready' && source.entries.length > 0 && state.status === 'idle';

  async function confirmMigration() {
    setState({ status: 'working', result: null });
    try {
      const result = await migrate({ storage, userId, upsertContentItems, exportBackup });
      setState({ status: result.status, result });
      onComplete?.(result);
    } catch (error) {
      setState({ status: 'error', result: { error } });
    }
  }

  const finished = state.status === 'migrated';
  const failure = state.status === 'error' || state.status === 'marker-failed' || state.status === 'remote-failed' || state.status === 'missing-user';

  return (
    <section role="dialog" aria-labelledby="migration-title" aria-describedby="migration-description">
      <h2 id="migration-title">Importer vos données MIVIX</h2>
      <p id="migration-description">
        Cette étape crée d’abord un backup JSON horodaté, puis copie vos contenus vers votre espace privé.
        Vos données locales ne seront jamais supprimées automatiquement.
      </p>

      {source.status === 'ready' && (
        <p>{source.entries.length} élément{source.entries.length > 1 ? 's' : ''} prêt{source.entries.length > 1 ? 's' : ''} à importer.</p>
      )}
      {unavailableMessage && <p role="status">{unavailableMessage}</p>}
      {source.errors?.length > 0 && (
        <ul aria-label="Erreurs de lecture">
          {source.errors.map((error) => <li key={error}>{error}</li>)}
        </ul>
      )}

      {canMigrate && (
        <button type="button" onClick={confirmMigration}>
          Confirmer l’importation
        </button>
      )}
      {state.status === 'working' && <p role="status">Importation en cours…</p>}
      {finished && <p role="status">Migration terminée. Le backup reste disponible et vos données locales sont conservées.</p>}
      {state.status === 'awaiting-persistence' && (
        <p role="status">Backup créé. La persistance distante doit encore être configurée.</p>
      )}
      {state.status === 'remote-failed' && (
        <p role="alert">La persistance distante a échoué. Le backup est conservé et le marqueur local n’a pas été écrit.</p>
      )}
      {state.status === 'missing-user' && (
        <p role="alert">Aucun utilisateur authentifié : l’importation est refusée.</p>
      )}
      {state.status === 'marker-failed' && (
        <p role="alert">Les données distantes sont enregistrées, mais le marqueur local a échoué. Une nouvelle tentative réutilisera les mêmes IDs pour éviter les doublons.</p>
      )}
      {failure && <p role="alert">La migration n’est pas confirmée. Vos données locales restent intactes.</p>}
    </section>
  );
}
