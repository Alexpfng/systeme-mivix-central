import { GeometricArt } from './GeometricArt';

export default function MivixWidget({ widget }) {
  return (
    <article
      className={`mivix-widget widget-${widget.id}`}
      style={{ '--widget-bg': widget.color, '--widget-accent': widget.accent }}
    >
      <div className="widget-copy">
        <span className="widget-label">{widget.label}</span>
        <h3>{widget.title}</h3>
        <p>{widget.description}</p>
        <span className="widget-detail">{widget.detail}</span>
      </div>
      <GeometricArt kind={widget.art} label={`Forme géométrique ${widget.title}`} />
    </article>
  );
}
