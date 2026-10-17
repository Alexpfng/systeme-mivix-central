function requireOwner(ownerId) {
  if (!ownerId) throw new Error('Utilisateur authentifié requis pour gérer les projets.');
}

export async function listProjects({ client, ownerId }) {
  requireOwner(ownerId);
  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createProject({ client, ownerId, input }) {
  requireOwner(ownerId);
  const name = input?.name?.trim();
  if (!name) throw new Error('Le nom du projet est obligatoire.');

  const row = {
    owner_id: ownerId,
    name,
    description: input.description?.trim() || null,
    status: input.status || 'idea',
    color: input.color || null,
    symbol: input.symbol || null,
    metadata: input.metadata || {},
  };
  const { data, error } = await client.from('projects').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject({ client, ownerId, projectId, patch }) {
  requireOwner(ownerId);
  const { data, error } = await client
    .from('projects')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('owner_id', ownerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function archiveProject(args) {
  return updateProject({ ...args, patch: { status: 'archived' } });
}
