import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES } from './projectStatus';
import { createProject, listProjects } from './projectRepository';

const EMPTY_FORM = { name: '', description: '', status: 'idea' };

function ProjectCard({ project, onSelect }) {
  return (
    <button className="mivix-project-card" type="button" onClick={() => onSelect(project)}>
      <span className="mivix-project-card-top">
        <span className="mivix-project-symbol" aria-hidden="true">{project.symbol || '✦'}</span>
        <span className="mivix-project-status">{PROJECT_STATUS_LABELS[project.status] || project.status}</span>
      </span>
      <strong>{project.name}</strong>
      <span>{project.description || 'Une idée à faire grandir.'}</span>
      <small>Ouvrir le projet →</small>
    </button>
  );
}

export default function ProjectsWidget({ onBack, onSelectProject = () => {} }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  async function getClient() {
    const module = await import('../lib/supabase');
    return module.supabase;
  }

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getClient().then((client) => listProjects({ client, ownerId: user?.id }))
      .then((items) => mounted && setProjects(items))
      .catch((loadError) => mounted && setError(loadError.message))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [user?.id]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const client = await getClient();
      const project = await createProject({ client, ownerId: user?.id, input: form });
      setProjects((current) => [project, ...current]);
      setForm(EMPTY_FORM);
      setIsFormOpen(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mivix-projects-panel" aria-labelledby="mivix-projects-title">
      <div className="mivix-projects-heading">
        <div>
          <p className="mivix-eyebrow">Relier les fils</p>
          <h2 id="mivix-projects-title">Des idées qui prennent forme.</h2>
          <p>Des idées de business, de création et de vie, réunies dans un même espace.</p>
        </div>
        <button className="mivix-primary-button" type="button" onClick={() => setIsFormOpen(true)}>+ Nouveau projet</button>
      </div>

      {isFormOpen && (
        <form className="mivix-project-form" onSubmit={handleSubmit}>
          <div className="mivix-project-form-heading">
            <div><p className="mivix-eyebrow">Nouvelle idée</p><h3>Donner une forme au projet</h3></div>
            <button className="mivix-form-close" type="button" onClick={() => setIsFormOpen(false)} aria-label="Fermer le formulaire">×</button>
          </div>
          <label>Nom du projet<input aria-label="Nom du projet" name="name" value={form.name} onChange={updateField} placeholder="Ex. Studio MIVIX" required /></label>
          <label>Description<textarea aria-label="Description" name="description" value={form.description} onChange={updateField} placeholder="Ce que cette idée pourrait devenir…" rows="4" /></label>
          <label>État<select aria-label="État du projet" name="status" value={form.status} onChange={updateField}>{PROJECT_STATUSES.map((status) => <option key={status} value={status}>{PROJECT_STATUS_LABELS[status]}</option>)}</select></label>
          <div className="mivix-project-form-actions"><button className="mivix-secondary-button" type="button" onClick={() => setIsFormOpen(false)}>Annuler</button><button className="mivix-primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Création…' : 'Créer le projet'}</button></div>
        </form>
      )}

      {error && <p className="mivix-project-error" role="alert">{error}</p>}
      {isLoading ? <p className="mivix-project-empty">Les projets arrivent…</p> : projects.length === 0 ? (
        <div className="mivix-project-empty"><span aria-hidden="true">◎</span><h3>Le premier projet peut commencer ici.</h3><p>Ajoute une idée, puis enrichis-la avec tes notes, tes images et tes fichiers.</p><button className="mivix-secondary-button" type="button" onClick={() => setIsFormOpen(true)}>Créer mon premier projet</button></div>
      ) : (
        <div className="mivix-project-grid">{projects.map((project) => <ProjectCard key={project.id} project={project} onSelect={onSelectProject} />)}</div>
      )}
      <button className="mivix-back-button" type="button" onClick={onBack}>← <span>Retour aux univers</span></button>
    </section>
  );
}
