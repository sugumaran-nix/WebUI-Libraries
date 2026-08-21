import { useState } from "react";
import Icon from "./Icon";

function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + query.length)}</mark>{text.slice(index + query.length)}</>;
}

export default function ResourceCard({ lib, categoryLabel, accent, isNew, isCopied, query, stacks = [], onCopy, onVisit }) {
  const [previewState, setPreviewState] = useState("loading");
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const previewUrl = `https://image.thum.io/get/width/1200/crop/760/${previewAttempt ? "wait/2/" : ""}noanimate/https://${lib.url}`;
  const resourceHref = `https://${lib.url}`;
  const initials = lib.name.replace(/[^a-z0-9 ]/gi, "").split(" ").filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase() || "UI";

  const handlePreviewLoad = event => {
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

  return (
    <article className="directory-resource-card" style={{ "--card-accent": accent || "#1C69D4" }}>
      <div className="directory-preview-frame" aria-busy={previewState === "loading" || previewState === "retrying"}>
        <a className="directory-preview-link" href={resourceHref} target="_blank" rel="noopener noreferrer" onClick={() => onVisit(lib)} aria-label={`Open ${lib.name} website`}>
          {previewState !== "error" && <img src={previewUrl} alt={`${lib.name} website preview`} width="1200" height="760" loading="lazy" decoding="async" onLoad={handlePreviewLoad} onError={handlePreviewError} />}
          {(previewState === "loading" || previewState === "retrying") && <div className="directory-preview-skeleton" aria-label={`${lib.name} preview loading`}><span /><span /><span /></div>}
          {previewState === "error" && <div className="directory-preview-error"><span>{initials}</span><small>Preview unavailable</small></div>}
        </a>
        <div className="directory-preview-toolbar"><span>{previewState === "loaded" ? "LIVE PREVIEW" : previewState === "error" ? "PREVIEW UNAVAILABLE" : "LOADING PREVIEW"}</span><button type="button" className={`directory-copy-button ${isCopied ? "is-copied" : ""}`} onClick={event => onCopy(lib, event)} aria-label={isCopied ? "Website address copied" : `Copy the website address for ${lib.name}`}><Icon name={isCopied ? "check" : "copy"} size={14} /><span>{isCopied ? "Copied" : "Copy address"}</span></button></div>
      </div>
      <div className="directory-card-body">
        <div className="directory-card-meta"><span className="directory-card-category" style={{ "--category-accent": accent || "#1C69D4" }}>{categoryLabel}</span>{isNew && <span className="directory-new-badge">New</span>}<span className="directory-card-url">{lib.url}</span></div>
        <h3><a href={resourceHref} target="_blank" rel="noopener noreferrer" onClick={() => onVisit(lib)}><Highlight text={lib.name} query={query} /><Icon name="arrow" size={14} /></a></h3>
        <p><Highlight text={lib.desc} query={query} /></p>
        {stacks.length > 0 && <div className="directory-card-tags" aria-label={`${lib.name} technologies`}>{stacks.slice(0, 3).map(stack => <span key={stack}>{stack}</span>)}</div>}
        <div className="directory-card-actions"><a className="directory-visit-action" href={resourceHref} target="_blank" rel="noopener noreferrer" onClick={() => onVisit(lib)}>Visit website <Icon name="arrowRight" size={14} /></a><span className="directory-card-index">RESOURCE {String(lib.id).padStart(3, "0")}</span></div>
      </div>
    </article>
  );
}
