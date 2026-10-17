import MigrationDialog from '../migration/MigrationDialog';
import { useAuth } from '../auth/AuthProvider';

export default function App() {
  const { user, upsertContentItems } = useAuth();

  return (
    <main>
      <h1>MIVIX Central</h1>
      <section aria-label="Contenu de MIVIX Central" />
      <MigrationDialog userId={user?.id} upsertContentItems={upsertContentItems} />
    </main>
  );
}
