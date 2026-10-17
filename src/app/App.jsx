import MigrationDialog from '../migration/MigrationDialog';
import { useAuth } from '../auth/AuthProvider';
import VisualShell from './VisualShell';

export { VisualShell } from './VisualShell';

export default function App() {
  const { user, upsertContentItems } = useAuth();

  return (
    <>
      <VisualShell />
      <MigrationDialog userId={user?.id} upsertContentItems={upsertContentItems} />
    </>
  );
}
