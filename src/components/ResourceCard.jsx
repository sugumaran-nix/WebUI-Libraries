import Icon from "./Icon";

function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + query.length)}</mark>{text.slice(index + query.length)}</>;
}

export default function ResourceCard({ lib, categoryLabel, stacks, isNew, isCopied, query, onCopy, onVisit }) {
  return (
    <article className="resource-card" style={{ "--card-accent": lib.accent || "#7C5CFC" }}>
      <div className="resource-card-top">
        <span className="resource-orbit" aria-hidden="true"><span /></span>
        <div className="resource-card-actions">
          {isNew && <span className="new-badge">New</span>}
          <button type="button" className={`icon-button ${isCopied ? "is-copied" : ""}`} onClick={(event) => onCopy(lib, event)} aria-label={isCopied ? "URL copied" : `Copy ${lib.name} URL`} title={isCopied ? "Copied" : "Copy URL"}>
            <Icon name={isCopied ? "check" : "copy"} size={14} />
          </button>
        </div>
      </div>
      <a className="resource-card-link" href={`https://${lib.url}`} target="_blank" rel="noopener noreferrer" onClick={() => onVisit(lib)}>
        <div className="resource-category">{categoryLabel}</div>
        <h3><Highlight text={lib.name} query={query} /><Icon name="arrow" size={14} /></h3>
        <p><Highlight text={lib.desc} query={query} /></p>
      </a>
      <div className="resource-card-footer">
        <span className="resource-domain">{lib.url}</span>
        <div className="resource-stacks">{stacks.slice(0, 3).map(stack => <span key={stack}>{stack}</span>)}</div>
      </div>
    </article>
  );
}
