import { useMemo, useState } from 'react';
import { MivixRobot } from './GeometricArt';
import MivixWidget from './MivixWidget';
import { MIVIX_WIDGETS } from './mivixData';
import '../styles/tokens.css';

function MivixMark() {
  return (
    <svg className="mivix-mark" viewBox="0 0 42 42" aria-hidden="true">
      <circle cx="21" cy="21" r="17" fill="none" stroke="var(--terracotta)" strokeWidth="1.5" />
      <circle cx="21" cy="21" r="10" fill="none" stroke="var(--terracotta)" strokeWidth="1.5" />
      <circle cx="21" cy="21" r="3" fill="var(--terracotta)" />
    </svg>
  );
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function StarIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.3" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5.5 20c.8-3.4 3-5.1 6.5-5.1s5.7 1.7 6.5 5.1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

export function VisualShell() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  const visibleWidgets = useMemo(
    () => MIVIX_WIDGETS.filter((widget) => {
      if (!normalizedQuery) return true;
      return `${widget.title} ${widget.label} ${widget.description}`.toLocaleLowerCase('fr').includes(normalizedQuery);
    }),
    [normalizedQuery],
  );

  return (
    <div className="mivix-app">
      <header className="mivix-topbar" role="banner">
        <div className="mivix-brand" aria-label="MIVIX Central">
          <MivixMark />
          <span className="sr-only">MIVIX Central</span>
          <span>MIVIX <small>Central</small></span>
        </div>
        <div className="mivix-topbar-spacer" />
        <label className="mivix-search">
          <SearchIcon />
          <span className="sr-only">Rechercher dans MIVIX</span>
          <input
            type="search"
            aria-label="Rechercher dans MIVIX"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher dans tout…"
          />
        </label>
        <button className="mivix-icon-button" type="button" aria-label="Favoris"><StarIcon /><span className="mivix-favorite-count">10</span></button>
        <button className="mivix-icon-button mivix-profile-button" type="button" aria-label="Profil"><UserIcon /></button>
      </header>

      <main className="mivix-main">
        <section className="mivix-intro" aria-labelledby="mivix-intro-title">
          <div className="intro-orbit intro-orbit-one" />
          <div className="intro-orbit intro-orbit-two" />
          <div className="intro-copy">
            <p className="mivix-eyebrow">Ton univers personnel</p>
            <h1 id="mivix-intro-title">Un espace pour<br /><em>conserver, apprendre,<br />créer et rêver.</em></h1>
            <p className="mivix-intro-note">MIVIX Central relie les choses qui comptent, sans les enfermer dans des cases.</p>
          </div>
          <div className="intro-sun" aria-hidden="true"><span /></div>
        </section>

        <section className="mivix-section" aria-labelledby="mivix-universes-title">
          <div className="mivix-section-heading">
            <div><p className="mivix-eyebrow">Tes univers</p><h2 id="mivix-universes-title">Tout ce qui compte,<br />au même endroit.</h2></div>
            <p>Chaque espace garde sa couleur, sa forme et sa mémoire. Entre où tu veux — rien ne se perd.</p>
          </div>
          <div className="mivix-widget-grid" data-testid="mivix-widget-grid">
            {visibleWidgets.length > 0 ? visibleWidgets.map((widget) => <MivixWidget key={widget.id} widget={widget} />) : <p className="mivix-empty-search">Aucun univers ne correspond à « {query} ».</p>}
          </div>
        </section>

        <section className="mivix-perspective" aria-label="Une manière douce de regarder">
          <div><p className="mivix-eyebrow">Vue d’ensemble</p><h2>Retrouver, relier,<br /><em>contempler.</em></h2></div>
          <p>Les dernières traces pourront bientôt se rassembler ici. Pour aujourd’hui, laisse la place aux prochaines idées.</p>
        </section>
      </main>

      <div className="mivix-robot-dock"><span className="robot-caption">Besoin d’un fil ?</span><MivixRobot /></div>
    </div>
  );
}

export default VisualShell;
