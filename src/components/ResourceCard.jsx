import { useState } from "react";
import Icon from "./Icon";

function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + query.length)}</mark>{text.slice(index + query.length)}</>;
}

export default function ResourceCard({ lib, categoryLabel, accent, isNew, isCopied, query, onCopy, onVisit }) {
  const [previewState, setPreviewState] = useState("loading");
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const previewUrl = `https://image.thum.io/get/width/1200/crop/760/${previewAttempt ? "wait/2/" : ""}noanimate/https://${lib.url}`;
  const initials = lib.name.replace(/[^a-z0-9 ]/gi, "").split(" ").filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase() || "UI";

  const retryPreview = (event) => {
    const image = event.currentTarget;
    if (image.naturalWidth < 320 || image.naturalHeight < 160) {
      if (previewAttempt === 0) {
        setPreviewAttempt(1);
        setPreviewState("retrying");
      } else {
        setPreviewState("error");
      }
      return;
    }
    setPreviewState("loaded");
  };

  const handlePreviewError = () => {
    if (previewAttempt === 0) {
      setPreviewAttempt(1);
      setPreviewState("retrying");
    } else {
      setPreviewState("error");
    }
  };

  const resourceHref = `https://${lib.url}`;

  return (
    <article className="resource-card" style={{ "--card-accent": accent || lib.accent || "#0066B3" }}>
      <div className="resource-card-link">
        <div className="resource-preview" aria-busy={previewState === "loading" || previewState === "retrying"}>
          <a className="resource-preview-link" href={resourceHref} target="_blank" rel="noopener noreferrer" onClick={() => onVisit(lib)} aria-label={`Open ${lib.name} website`}>
            {previewState !== "error" && (
              <img
                src={previewUrl}
                alt={`${lib.name} website preview`}
                width="1200"
                height="760"
                loading="lazy"
                decoding="async"
                onLoad={retryPreview}
                onError={handlePreviewError}
              />
            )}
            {(previewState === "loading" || previewState === "retrying") && <div className="preview-skeleton" aria-label={`${lib.name} preview loading`}><span className="preview-skeleton-line" /><span className="preview-skeleton-line short" /></div>}
            {previewState === "error" && <div className="preview-placeholder"><span className="preview-initials">{initials}</span><small>Preview unavailable · card opens site</small></div>}
          </a>
          <div className="resource-preview-tools">
            <button type="button" className={`icon-button ${isCopied ? "is-copied" : ""}`} onClick={(event) => onCopy(lib, event)} aria-label={isCopied ? "URL copied" : `Copy ${lib.name} URL`} title={isCopied ? "Copied" : "Copy URL"}>
              <Icon name={isCopied ? "check" : "copy"} size={14} />
            </button>
          </div>
        </div>
        <a className="resource-card-copy" href={resourceHref} target="_blank" rel="noopener noreferrer" onClick={() => onVisit(lib)}>
          <div className="resource-category-line"><span className="resource-category">{categoryLabel}</span>{isNew && <span className="new-badge">New</span>}</div>
          <h3><Highlight text={lib.name} query={query} /><Icon name="arrow" size={14} /></h3>
          <p><Highlight text={lib.desc} query={query} /></p>
        </a>
      </div>
    </article>
  );
}
