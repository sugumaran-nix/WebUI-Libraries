import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./components/Icon";
import ResourceCard from "./components/ResourceCard";
import DirectoryView from "./components/DirectoryView";
import {
  CATEGORIES,
  CAT_COLOR,
  CAT_RESOLVE,
  LIBS,
  LIB_STACKS,
  NEW_IDS,
  SORT_OPTIONS,
  STACK_FILTERS,
  VERIFIED_DATE,
} from "./data";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("ui-folio-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getRecent() {
  try { return JSON.parse(localStorage.getItem("uidir-recent") || "[]"); } catch { return []; }
}

function addRecent(resource) {
  try {
    const previous = getRecent().filter(item => item.id !== resource.id);
    localStorage.setItem("uidir-recent", JSON.stringify([resource, ...previous].slice(0, 5)));
  } catch {}
}

function getUrlParams() {
  const defaults = { cat: "all", q: "", stack: "all", sort: "featured", view: "grid" };
  if (typeof window === "undefined") return defaults;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem("ui-folio-filters") || "{}"); } catch {}
  const params = new URLSearchParams(window.location.search);
  return {
    cat: params.has("cat") ? params.get("cat") : saved.cat || defaults.cat,
    q: params.has("q") ? params.get("q") : saved.q || defaults.q,
    stack: params.has("stack") ? params.get("stack") : saved.stack || defaults.stack,
    sort: params.has("sort") ? params.get("sort") : saved.sort || defaults.sort,
    view: params.has("view") ? params.get("view") : saved.view || defaults.view,
  };
}

function getRoute() {
  if (typeof window === "undefined") return "/";
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  return pathname === "/directory" ? "/directory" : "/";
}

const POPULAR_ORDER = [16, 30, 29, 53, 54, 50, 51, 49, 58, 59, 1, 2, 9, 73, 88, 86, 87, 162, 163, 158, 123, 118, 64, 65];
const POPULAR_RANK = new Map(POPULAR_ORDER.map((id, index) => [id, index]));

function syncUrl(cat, query, stack, sort, view) {
  const params = new URLSearchParams();
  if (cat !== "all") params.set("cat", cat);
  if (query) params.set("q", query);
  if (stack !== "all") params.set("stack", stack);
  if (sort !== "featured") params.set("sort", sort);
  if (view !== "grid") params.set("view", view);
  const value = params.toString();
  window.history.replaceState(null, "", value ? `?${value}` : window.location.pathname);
}

function EmptyState({ onClear }) {
  return (
    <div className="empty-state">
      <div className="empty-symbol"><Icon name="spark" size={24} /></div>
      <h3>No resources match that signal.</h3>
      <p>Try a broader search, remove a filter, or return to the full index.</p>
      <button type="button" className="button button-secondary" onClick={onClear}>Reset discovery <Icon name="arrowRight" size={14} /></button>
    </div>
  );
}

function ThemeToggle({ theme, onToggle }) {
  const nextTheme = theme === "light" ? "dark" : "light";
  return (
    <button type="button" className="theme-switch" onClick={onToggle} aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`}>
      <span className="theme-switch-icon"><Icon name={theme === "light" ? "moon" : "sun"} size={16} /></span>
    </button>
  );
}

function VengeanceLanding({ onNavigate }) {
  const sectionRef = useRef(null);
  const marqueeImages = [
    "https://image.thum.io/get/width/900/crop/560/noanimate/https://ui.shadcn.com",
    "https://image.thum.io/get/width/900/crop/560/noanimate/https://godly.design",
    "https://image.thum.io/get/width/900/crop/560/noanimate/https://refero.design",
    "https://image.thum.io/get/width/900/crop/560/noanimate/https://mobbin.com",
    "https://image.thum.io/get/width/900/crop/560/noanimate/https://www.saasframe.io",
    "https://image.thum.io/get/width/900/crop/560/noanimate/https://linear.app",
    "https://image.thum.io/get/width/900/crop/560/noanimate/https://tailwindcss.com",
    "https://image.thum.io/get/width/900/crop/560/noanimate/https://www.awwwards.com",
  ];
  const marqueeTiles = [...marqueeImages, ...marqueeImages];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    let frame = 0;
    let nextPoint = null;
    const handlePointerMove = event => {
      nextPoint = event;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!nextPoint) return;
        const rect = section.getBoundingClientRect();
        const x = ((nextPoint.clientX - rect.left) / rect.width) * 100;
        const y = ((nextPoint.clientY - rect.top) / rect.height) * 100;
        section.style.setProperty("--pointer-x", `${x}%`);
        section.style.setProperty("--pointer-y", `${y}%`);
        nextPoint = null;
      });
    };
    section.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      section.removeEventListener("pointermove", handlePointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="vengeance-landing" aria-labelledby="vengeance-title">
      <div className="vengeance-glow" aria-hidden="true" />
      <div className="vengeance-topline">
        <span className="landing-status"><Icon name="compass" size={12} /> Open-source design garage</span>
        <div className="vengeance-toplinks"><button type="button" onClick={() => onNavigate("/directory")}><Icon name="library" size={12} /> Directory</button><button type="button" onClick={() => { onNavigate("/directory"); }}><Icon name="compass" size={12} /> Inspiration</button><a href="https://github.com/sugumaran-nix/WebUI-Libraries" target="_blank" rel="noopener noreferrer"><Icon name="github" size={12} /> GitHub</a></div>
      </div>
      <div className="vengeance-marquee" aria-hidden="true"><div className="vengeance-marquee-track">{marqueeTiles.map((image, index) => <div className="vengeance-tile" key={`${image}-${index}`}><img src={image} alt="" loading="lazy" /></div>)}</div></div>
      <div className="vengeance-content">
        <div className="vengeance-kicker">DESIGN GARAGE · CURATED INTERFACE RESOURCES</div>
        <h1 id="vengeance-title">DESIGN GARAGE</h1>
        <div className="vengeance-intro">
          <div className="vengeance-subtitle"><span>FIND BETTER</span><span>BUILD FASTER</span></div>
          <div className="vengeance-copy"><p>A focused index of libraries, design systems, inspiration galleries, and frontend tools for people who care about the details.</p><p>Explore {LIBS.length} hand-picked resources, compare real previews, filter by topic or stack, and move from a spark of inspiration to a shipped interface.</p></div>
        </div>
        <button type="button" className="vengeance-cta" onClick={() => onNavigate("/directory")}>Browse the directory <Icon name="arrowRight" size={15} /></button>
      </div>
      <p className="vengeance-footer">A living reference desk for digital makers: fewer tabs, better signals, and a more considered way to discover what belongs in your next product.</p>
    </section>
  );
}

export default function App() {
  const initial = getUrlParams();
  const [route, setRoute] = useState(getRoute);
  const [theme, setTheme] = useState(getInitialTheme);
  const [activeCategory, setActiveCategory] = useState(initial.cat);
  const [query, setQuery] = useState(initial.q);
  const [debouncedQuery, setDebouncedQuery] = useState(initial.q);
  const [stackFilter, setStackFilter] = useState(initial.stack);
  const [sortBy, setSortBy] = useState(initial.sort);
  const [viewMode, setViewMode] = useState(initial.view);
  const [copiedId, setCopiedId] = useState(null);
  const [recent, setRecent] = useState(getRecent);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggested, setSuggested] = useState(false);
  const [suggestion, setSuggestion] = useState({ name: "", url: "", note: "" });
  const searchRef = useRef(null);
  const isDirectory = route === "/directory";

  useEffect(() => {
    const handlePopstate = () => setRoute(getRoute());
    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState(null, "", path);
    setRoute(getRoute());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuggest = () => {
    if (!isDirectory) navigateTo("/directory");
    setSuggestOpen(true);
    window.setTimeout(() => {
      const trigger = document.getElementById("suggest-resource-trigger");
      trigger?.scrollIntoView({ behavior: "smooth", block: "center" });
      trigger?.focus({ preventScroll: true });
    }, 0);
  };

  useEffect(() => {
    try { localStorage.setItem("ui-folio-theme", theme); } catch {}
    document.documentElement.style.colorScheme = theme;
    document.body.style.background = theme === "dark" ? "#050505" : "#FFFFFF";
  }, [theme]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 140);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (isDirectory) syncUrl(activeCategory, query, stackFilter, sortBy, viewMode);
    else window.history.replaceState(null, "", window.location.pathname);
    try { localStorage.setItem("ui-folio-filters", JSON.stringify({ cat: activeCategory, q: query, stack: stackFilter, sort: sortBy, view: viewMode })); } catch {}
  }, [isDirectory, activeCategory, query, stackFilter, sortBy, viewMode]);

  useEffect(() => {
    if (!isDirectory) {
      document.title = "Design Garage — Interface Resources and Frontend Tools";
      return;
    }
    const titleParts = [];
    if (activeCategory !== "all") titleParts.push(CATEGORIES.find(item => item.id === activeCategory)?.label || activeCategory);
    if (stackFilter !== "all") titleParts.push(stackFilter);
    if (query) titleParts.push(`“${query}”`);
    document.title = titleParts.length ? `${titleParts.join(" · ")} — Design Garage` : "Resource Directory — Design Garage";
  }, [isDirectory, activeCategory, query, stackFilter]);

  useEffect(() => {
    const handleKeydown = event => {
      const inputActive = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if (event.key === "/" && !inputActive) { event.preventDefault(); searchRef.current?.focus(); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); document.querySelector(".desktop-filter")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
      if (event.key === "Escape") {
        if (query) setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [query]);

  const counts = useMemo(() => {
    const result = { all: LIBS.length };
    LIBS.forEach(resource => {
      const key = CAT_RESOLVE(resource.cat);
      result[key] = (result[key] || 0) + 1;
    });
    return result;
  }, []);

  const filteredResources = useMemo(() => {
    const needle = debouncedQuery.toLowerCase().trim();
    const matches = LIBS.filter(resource => {
      const resolvedCategory = CAT_RESOLVE(resource.cat);
      const stacks = LIB_STACKS[resource.id] || [];
      const categoryMatch = activeCategory === "all" || activeCategory === resource.cat || activeCategory === resolvedCategory;
      const stackMatch = stackFilter === "all" || stacks.includes(stackFilter);
      const searchMatch = !needle || resource.name.toLowerCase().includes(needle) || resource.desc.toLowerCase().includes(needle) || resource.url.toLowerCase().includes(needle) || stacks.some(stack => stack.toLowerCase().includes(needle));
      return categoryMatch && stackMatch && searchMatch;
    });
    return [...matches].sort((left, right) => {
      if (sortBy === "az") return left.name.localeCompare(right.name);
      if (sortBy === "za") return right.name.localeCompare(left.name);
      if (sortBy === "short") return left.name.length - right.name.length || left.name.localeCompare(right.name);
      if (sortBy === "long") return right.name.length - left.name.length || left.name.localeCompare(right.name);
      if (sortBy === "newest") return (right.added || "").localeCompare(left.added || "") || left.name.localeCompare(right.name);
      if (sortBy === "oldest") return (left.added || "").localeCompare(right.added || "") || left.name.localeCompare(right.name);
      if (sortBy === "popular") return (POPULAR_RANK.get(left.id) ?? 999) - (POPULAR_RANK.get(right.id) ?? 999) || left.name.localeCompare(right.name);
      return 0;
    });
  }, [activeCategory, debouncedQuery, sortBy, stackFilter]);

  const categoryLabel = CATEGORIES.find(item => item.id === activeCategory)?.label || "All categories";
  const activeFilterCount = (activeCategory !== "all" ? 1 : 0) + (query ? 1 : 0) + (stackFilter !== "all" ? 1 : 0) + (sortBy !== "featured" ? 1 : 0);
  const newResources = useMemo(() => LIBS.filter(resource => NEW_IDS.has(resource.id)).slice(0, 6), []);
  const trendResources = useMemo(() => LIBS.filter(resource => NEW_IDS.has(resource.id) && ["inspiration", "design-tools", "dev-tools"].includes(resource.cat)).slice(0, 3), []);

  const handleVisit = resource => { addRecent(resource); setRecent(getRecent()); };
  const copyUrl = (resource, event) => {
    event.preventDefault();
    event.stopPropagation();
    const value = `https://${resource.url}`;
    const finishCopy = () => {
      setCopiedId(resource.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    };
    const fallbackCopy = () => {
      try {
        const helper = document.createElement("textarea");
        helper.value = value;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      } catch {}
    };
    let clipboardWrite;
    try {
      clipboardWrite = navigator.clipboard?.writeText?.(value);
    } catch {
      fallbackCopy();
    }
    if (clipboardWrite?.catch) clipboardWrite.catch(fallbackCopy);
    else if (!clipboardWrite) fallbackCopy();
    finishCopy();
  };
  const clearFilters = () => {
    setActiveCategory("all");
    setQuery("");
    setStackFilter("all");
    setSortBy("featured");
  };
  const sendSuggestion = () => {
    if (!suggestion.name.trim() || !suggestion.url.trim()) return;
    const cleanUrl = suggestion.url.trim().startsWith("http") ? suggestion.url.trim() : `https://${suggestion.url.trim()}`;
    const subject = encodeURIComponent(`Resource suggestion: ${suggestion.name.trim()}`);
    const body = encodeURIComponent(`Name: ${suggestion.name.trim()}\nURL: ${cleanUrl}\n${suggestion.note.trim() ? `\nWhy should we include it: ${suggestion.note.trim()}` : ""}`);
    window.open(`https://github.com/sugumaran-nix/WebUI-Libraries/issues/new?title=${subject}&body=${body}`, "_blank");
    setSuggested(true);
    setSuggestion({ name: "", url: "", note: "" });
    setTimeout(() => setSuggested(false), 2800);
  };

  return (
    <div className={`app-shell theme-${theme}`}>
      <style>{`
        :root { --paper:#F7F7F1; --surface:#FFFFFF; --surface-soft:#FFF4A8; --surface-elevated:#FFFFFF; --ink:#050505; --muted:#171717; --line:rgba(5,5,5,.22); --accent:#684B00; --accent-fill:#FFD400; --accent-ink:#050505; --action:#0047D4; --violet:#5B35C9; --pink:#D60055; --lime:#00D9FF; --cyan:#00D9FF; --focus:#0057FF; --on-accent:#050505; --on-soft:#050505; --shadow:5px 5px 0 rgba(5,5,5,.9); --neo-shadow-color:#050505; --radius:0; --ease:cubic-bezier(.23,1,.32,1); --font-display:"DM Serif Display", Georgia, serif; --font-sans:"DM Sans", Inter, ui-sans-serif, system-ui, sans-serif; }
        .theme-dark { --paper:#050505; --surface:#0D0D0D; --surface-soft:#262000; --surface-elevated:#111111; --ink:#FFFFFF; --muted:#F0F0E8; --line:rgba(255,255,255,.28); --accent:#FFD400; --accent-fill:#FFD400; --accent-ink:#050505; --action:#0047D4; --violet:#9A7BFF; --pink:#FF5C8A; --lime:#00D9FF; --cyan:#00D9FF; --focus:#00D9FF; --on-accent:#050505; --on-soft:#050505; --shadow:5px 5px 0 rgba(0,0,0,.95); --neo-shadow-color:#FFD400; }
        * { box-sizing:border-box; }
        body { margin:0; overflow-x:hidden; background:var(--paper); font-family:var(--font-sans); font-size:15px; text-rendering:optimizeLegibility; -webkit-font-smoothing:antialiased; }
        button, input, select, textarea { font:inherit; }
        button, a { -webkit-tap-highlight-color:transparent; }
        button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline:3px solid var(--focus); outline-offset:3px; }
        .app-shell { min-height:100vh; overflow:visible; color:var(--ink); background:var(--paper); transition:background .28s var(--ease), color .28s var(--ease); }
        .app-shell::before { content:""; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.16; background-image:radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--accent) 30%,transparent),transparent 25%),radial-gradient(circle at 88% 15%,color-mix(in srgb,var(--cyan) 20%,transparent),transparent 24%),linear-gradient(color-mix(in srgb,var(--ink) 10%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--ink) 10%,transparent) 1px,transparent 1px); background-size:auto,auto,44px 44px,44px 44px; }
        .theme-dark::before { opacity:.22; background-image:radial-gradient(circle at 15% 10%,rgba(255,212,0,.2),transparent 28%),radial-gradient(circle at 86% 15%,rgba(0,217,255,.16),transparent 26%),linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px); background-size:auto,auto,44px 44px,44px 44px; }
        .app-shell > * { position:relative; z-index:1; } .directory-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .site-header { position:fixed; inset:0 0 auto; z-index:80; border-bottom:1px solid var(--line); background:color-mix(in srgb,var(--surface-elevated) 82%,transparent); box-shadow:0 10px 30px color-mix(in srgb,var(--ink) 7%,transparent); backdrop-filter:saturate(150%) blur(22px); -webkit-backdrop-filter:saturate(150%) blur(22px); }
        .directory-header { position:fixed; inset:0 0 auto; z-index:80; }
        .header-inner { display:flex; align-items:center; gap:1rem; width:min(1440px,100%); min-height:72px; margin:0 auto; padding:0 28px; }
        .brand-lockup { display:flex; align-items:center; gap:.7rem; min-width:220px; padding:0; border:0; color:var(--ink); background:transparent; text-align:left; cursor:pointer; }
        .brand-symbol { display:grid; place-items:center; width:38px; height:38px; border:2px solid var(--ink); border-radius:12px; color:var(--accent-ink); background:var(--accent-fill); box-shadow:3px 3px 0 var(--ink); }
        .brand-name { font-size:12px; font-weight:900; letter-spacing:.15em; line-height:1; }
        .brand-caption { display:block; margin-top:5px; color:var(--muted); font-size:10px; font-weight:600; } .brand-lockup:hover { transform:none; }
        .header-nav { display:flex; align-items:center; gap:.2rem; margin-left:auto; }
        .mobile-menu-toggle { display:none; align-items:center; justify-content:center; width:44px; height:44px; padding:0; border:1px solid var(--line); border-radius:10px; color:var(--ink); background:var(--surface); cursor:pointer; }
        .mobile-nav { display:none; }
        .header-nav button, .theme-switch { border:0; background:transparent; color:var(--muted); cursor:pointer; transition:all .18s var(--ease); } .header-nav button, .github-link { display:inline-flex; align-items:center; gap:6px; }
        .header-nav button { padding:.55rem .7rem; border-radius:9px; font-size:11px; font-weight:800; }
        .header-nav button:hover, .github-link:hover { color:var(--ink); background:var(--surface-soft); }
        .header-actions { display:flex; align-items:center; gap:.35rem; }
        .theme-switch { display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; padding:0; border:0; border-radius:10px; color:var(--ink); background:transparent; box-shadow:none; font-size:10px; font-weight:800; }
        .theme-switch:hover { color:var(--accent); background:transparent; transform:none; }
        .theme-switch-icon { display:grid; place-items:center; width:22px; height:22px; border-radius:8px; color:currentColor; background:transparent; }
        .button { display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:44px; border:1px solid transparent; border-radius:10px; padding:0 .8rem; cursor:pointer; font-size:11px; font-weight:800; transition:all .18s var(--ease); }
        .button:hover { transform:translateY(-2px); }
        .button-primary { color:#FFFFFF; background:var(--action); box-shadow:3px 3px 0 var(--ink); }
        .button-secondary { color:var(--ink); border-color:var(--line); background:var(--surface); backdrop-filter:blur(14px); }
        .button-ghost { color:var(--muted); background:transparent; }
        .icon-button { display:grid; place-items:center; width:40px; height:40px; padding:0; border:1px solid var(--line); border-radius:10px; color:var(--muted); background:var(--surface); cursor:pointer; transition:all .18s var(--ease); backdrop-filter:blur(14px); }
        .icon-button:hover { color:var(--ink); background:var(--surface-soft); transform:translateY(-2px); }
        .icon-button.is-copied { color:var(--on-soft); border-color:var(--lime); background:var(--lime); }
        .app-main { width:min(1440px,100%); margin:0 auto; padding:30px 28px 80px; } .github-link { display:grid; place-items:center; width:34px; height:34px; padding:0; color:var(--muted); text-decoration:none; } .github-link svg { flex:0 0 auto; } .github-link:hover { color:var(--ink); background:var(--surface-soft); transform:translateY(-1px); }
        .vengeance-main { width:100%; max-width:none; margin:0; padding:72px 0 0; }
        .vengeance-landing { position:relative; min-height:calc(100vh - 72px); overflow:hidden; isolation:isolate; color:var(--landing-fg); background:var(--landing-bg); --landing-bg:#FFFBE6; --landing-fg:#050505; --landing-accent:#684B00; --landing-cool:#145DFF; --landing-cta-ink:#FFFFFF; --pointer-x:50%; --pointer-y:50%; } .theme-dark .vengeance-landing { --landing-bg:#050505; --landing-fg:#FFFFFF; --landing-accent:#FFD400; --landing-cool:#00D9FF; --landing-cta-ink:#050505; }
        .vengeance-landing::before { content:""; position:absolute; inset:0; z-index:-2; opacity:.6; background-image:linear-gradient(color-mix(in srgb,var(--landing-fg) 8%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--landing-fg) 8%,transparent) 1px,transparent 1px); background-size:44px 44px; mask-image:linear-gradient(180deg,rgba(0,0,0,.8),transparent 85%); }
        .vengeance-glow { position:absolute; inset:0; z-index:-1; pointer-events:none; background:radial-gradient(circle at var(--pointer-x) var(--pointer-y),color-mix(in srgb,var(--landing-cool) 25%,transparent),transparent 29%),radial-gradient(circle at 72% 18%,color-mix(in srgb,var(--landing-accent) 18%,transparent),transparent 34%),linear-gradient(120deg,transparent 45%,color-mix(in srgb,var(--landing-cool) 5%,transparent)); transition:background .25s var(--ease); }
        .vengeance-topline { position:absolute; top:24px; left:clamp(22px,5vw,72px); right:clamp(22px,5vw,72px); z-index:5; display:flex; align-items:center; justify-content:space-between; gap:18px; color:color-mix(in srgb,var(--landing-fg) 68%,transparent); font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .vengeance-topline a, .vengeance-toplinks button, .vengeance-toplinks a { display:inline-flex; align-items:center; gap:6px; color:inherit; text-decoration:none; transition:color .18s var(--ease); } .landing-status { display:inline-flex; align-items:center; gap:6px; }
        .vengeance-topline a:hover, .vengeance-toplinks button:hover, .vengeance-toplinks a:hover { color:var(--landing-fg); }
        .vengeance-toplinks { display:flex; align-items:center; gap:18px; }
        .vengeance-toplinks button { padding:0; border:0; background:transparent; font-size:inherit; font-weight:inherit; letter-spacing:inherit; text-transform:inherit; cursor:pointer; }
        .vengeance-marquee { position:absolute; top:0; left:0; right:0; z-index:1; height:min(48vh,420px); overflow:hidden; opacity:.42; mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,.88) 48%,transparent 100%); }
        .vengeance-marquee-track { display:flex; align-items:flex-start; gap:16px; width:max-content; height:auto; min-height:calc(min(48vh,420px) - 62px); padding:34px 0 28px; animation:vengeance-marquee 34s linear infinite; }
        .vengeance-tile { width:clamp(190px,22vw,320px); height:auto; aspect-ratio:16/10; align-self:flex-start; flex:0 0 auto; overflow:hidden; border:1px solid color-mix(in srgb,var(--landing-fg) 18%,transparent); border-radius:10px; background:color-mix(in srgb,var(--landing-fg) 8%,var(--landing-bg)); box-shadow:0 18px 38px color-mix(in srgb,var(--landing-fg) 16%,transparent); filter:saturate(.82) contrast(1.04); }
        .vengeance-tile img { display:block; width:100%; height:100%; object-fit:cover; }
        @keyframes vengeance-marquee { from { transform:translateX(0); } to { transform:translateX(calc(-50% - 8px)); } }
        @media (prefers-reduced-motion: reduce) { .vengeance-marquee-track { animation:none; } .app-shell, .app-shell * { scroll-behavior:auto !important; transition-duration:0.01ms !important; animation-duration:0.01ms !important; animation-iteration-count:1 !important; } .button:hover, .icon-button:hover, .theme-switch:hover { transform:none; } }
        .vengeance-content { position:relative; z-index:3; display:flex; flex-direction:column; justify-content:center; width:min(1280px,100%); min-height:calc(100vh - 72px); margin:0 auto; padding:clamp(100px,14vh,160px) clamp(22px,6vw,92px) 130px; }
        .vengeance-kicker { align-self:flex-start; margin-bottom:18px; color:var(--landing-cool); font-size:10px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; }
        .vengeance-content h1 { margin:0; font-family:Georgia,'Times New Roman',serif; font-size:clamp(5rem,17vw,14rem); font-weight:400; line-height:.78; letter-spacing:-.1em; color:var(--landing-fg); }
        .vengeance-intro { display:grid; grid-template-columns:minmax(170px,.35fr) minmax(0,1fr); gap:clamp(28px,7vw,105px); max-width:820px; margin-top:clamp(58px,9vh,100px); padding-left:clamp(0px,8vw,125px); }
        .vengeance-subtitle { display:flex; flex-direction:column; gap:2px; color:var(--landing-accent); font-size:clamp(18px,2.7vw,31px); font-weight:700; line-height:1.03; letter-spacing:-.05em; }
        .vengeance-copy { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:clamp(18px,4vw,58px); color:color-mix(in srgb,var(--landing-fg) 70%,transparent); font-size:11px; line-height:1.7; }
        .vengeance-copy p { margin:0; }
        .vengeance-cta { display:inline-flex; align-items:center; gap:8px; align-self:flex-start; margin-top:34px; padding:11px 15px; border:1px solid color-mix(in srgb,var(--landing-cool) 60%,transparent); border-radius:10px; color:var(--landing-cta-ink); background:var(--landing-cool); box-shadow:0 12px 28px color-mix(in srgb,var(--landing-cool) 22%,transparent); font-size:10px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; transition:transform .18s var(--ease),background .18s var(--ease); }
        .vengeance-cta:hover { transform:translateY(-2px); background:var(--landing-fg); }
        .vengeance-footer { position:absolute; right:clamp(22px,5vw,72px); bottom:22px; left:clamp(22px,5vw,72px); max-width:620px; margin:0 auto; color:color-mix(in srgb,var(--landing-fg) 48%,transparent); font-size:9px; line-height:1.65; text-align:center; }
        @media (max-width:820px) { .vengeance-topline { align-items:flex-start; flex-direction:column; gap:10px; } .vengeance-toplinks { gap:12px; } .vengeance-content { padding-top:150px; } .vengeance-intro { grid-template-columns:1fr; gap:22px; padding-left:0; } .vengeance-subtitle { flex-direction:row; gap:10px; font-size:21px; } .vengeance-copy { grid-template-columns:1fr; gap:12px; } .vengeance-footer { position:relative; right:auto; bottom:auto; left:auto; padding:0 22px 24px; } }
        @media (max-width:560px) { .vengeance-landing { min-height:calc(100vh - 64px); } .vengeance-content { min-height:calc(100vh - 64px); padding-top:142px; } .vengeance-content h1 { font-size:clamp(4.5rem,22vw,8rem); } .vengeance-marquee { height:33vh; } .vengeance-marquee-track { min-height:0; } .vengeance-tile { width:clamp(210px,72vw,280px); aspect-ratio:16/10; } .vengeance-topline { top:16px; font-size:8px; } .vengeance-kicker { font-size:8px; } }
        .welcome-grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr); gap:24px; min-height:390px; padding:clamp(26px,5vw,62px); overflow:hidden; border-radius:32px; color:#FFF; background:linear-gradient(125deg,#0B3D91 0%,#0066B3 48%,#5CA8E6 100%); box-shadow:0 30px 80px rgba(0,43,84,.28); }
        .welcome-copy { align-self:center; max-width:680px; }
        .eyebrow { color:var(--lime); font-size:10px; font-weight:900; letter-spacing:.17em; text-transform:uppercase; }
        .welcome-title { max-width:680px; margin:18px 0 16px; font-family:Georgia,'Times New Roman',serif; font-size:clamp(3.3rem,8vw,7.2rem); font-weight:400; letter-spacing:-.075em; line-height:.86; }
        .welcome-title em { color:var(--lime); font-style:normal; }
        .welcome-copy p { max-width:600px; margin:0; color:rgba(255,255,255,.78); font-size:15px; line-height:1.65; }
        .hero-search { display:flex; align-items:center; gap:.65rem; max-width:620px; margin-top:28px; padding:.5rem .55rem .5rem .85rem; border:1px solid rgba(255,255,255,.22); border-radius:14px; background:rgba(255,255,255,.12); box-shadow:0 12px 30px rgba(0,0,0,.12); backdrop-filter:blur(14px); }
        .hero-search svg { flex-shrink:0; color:var(--lime); }
        .hero-search input { flex:1; min-width:0; border:0; outline:0; color:#FFF; background:transparent; font-size:13px; } .hero-search input:focus-visible { outline:3px solid var(--focus); outline-offset:3px; border-radius:4px; }
        .hero-search input::placeholder { color:rgba(255,255,255,.62); }
        .hero-search-kbd { color:rgba(255,255,255,.66); font-size:10px; font-weight:800; white-space:nowrap; }
        .hero-orbit { position:relative; min-height:260px; align-self:stretch; }
        .hero-orbit::before, .hero-orbit::after { content:""; position:absolute; border:1px solid rgba(255,255,255,.22); border-radius:50%; transform:rotate(-18deg); }
        .hero-orbit::before { inset:6% -4% 5% 3%; }
        .hero-orbit::after { inset:18% 13% 16% 18%; border-color:rgba(92,168,230,.5); transform:rotate(22deg); }
        .hero-orbit-card { position:absolute; display:flex; align-items:center; gap:.65rem; padding:.8rem; border:1px solid rgba(255,255,255,.22); border-radius:16px; background:rgba(0,0,0,.22); box-shadow:0 18px 40px rgba(0,0,0,.22); backdrop-filter:blur(12px); }
        .hero-orbit-card strong, .hero-orbit-card span { display:block; }
        .hero-orbit-card strong { color:#FFF; font-size:12px; }
        .hero-orbit-card span { margin-top:4px; color:rgba(255,255,255,.62); font-size:9px; }
        .hero-orbit-card.one { top:13%; left:7%; transform:rotate(-8deg); }
        .hero-orbit-card.two { top:45%; right:0; transform:rotate(8deg); }
        .hero-orbit-card.three { bottom:6%; left:18%; transform:rotate(-4deg); }
        .mini-avatar { display:grid; place-items:center; width:30px; height:30px; border-radius:10px; color:#0A0A0A; background:var(--lime); font-size:11px; font-weight:900; }
        .metric-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:18px 0 34px; }
        .metric-card { padding:16px; border:1px solid var(--line); border-radius:16px; background:var(--surface); box-shadow:0 10px 25px rgba(0,0,0,.045); }
        .metric-card-label { color:var(--muted); font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .metric-card strong { display:block; margin-top:8px; color:var(--ink); font-family:var(--font-display); font-size:30px; font-weight:400; letter-spacing:-.05em; }
        .metric-card small { display:block; margin-top:4px; color:var(--muted); font-size:10px; }
        .section-header { display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; margin-bottom:14px; }
        .section-header h2 { margin:3px 0 0; color:var(--ink); font-family:var(--font-display); font-size:clamp(1.8rem,3vw,2.5rem); font-weight:400; line-height:1.03; letter-spacing:-.055em; }
        .section-header p { margin:0; color:var(--muted); font-size:11px; }
        .spotlight-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-bottom:38px; }
        .spotlight-card { position:relative; min-height:158px; padding:18px; overflow:hidden; border:1px solid var(--line); border-radius:18px; color:var(--ink); background:var(--surface); text-decoration:none; box-shadow:0 12px 30px rgba(0,0,0,.05); transition:transform .22s var(--ease), box-shadow .22s var(--ease), border-color .22s var(--ease); }
        .spotlight-card::before { content:""; position:absolute; width:160px; height:160px; right:-48px; bottom:-74px; border-radius:50%; background:var(--spotlight-color,#E10600); opacity:.18; }
        .spotlight-card:hover { transform:translateY(-5px); border-color:var(--spotlight-color,#0066B3); box-shadow:0 20px 36px rgba(0,0,0,.12); }
        .spotlight-card-top { display:flex; justify-content:space-between; color:var(--spotlight-color,#0066B3); font-size:10px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
        .spotlight-card h3 { max-width:220px; margin:25px 0 7px; font-size:17px; letter-spacing:-.04em; }
        .spotlight-card p { max-width:270px; margin:0; color:var(--muted); font-size:11px; line-height:1.45; }
        .workspace { display:block; }
        .directory-main { padding-top:calc(72px + 16px + 60px); }
        .quick-access-panel { position:fixed; top:88px; left:28px; z-index:70; width:min(1384px,calc(100% - 56px)); margin:0; padding:9px 10px; overflow:visible; border:1px solid var(--line); border-radius:12px; background:color-mix(in srgb,var(--surface-elevated) 82%,transparent); box-shadow:0 16px 34px color-mix(in srgb,var(--ink) 10%,transparent); backdrop-filter:saturate(150%) blur(20px); -webkit-backdrop-filter:saturate(150%) blur(20px); }
        .quick-access-row { display:flex; align-items:center; gap:10px; width:100%; min-width:0; overflow:visible; }
        .quick-access-heading { display:flex; align-items:center; gap:6px; flex:0 0 auto; height:28px; padding-right:2px; }
        .quick-access-heading h2 { margin:0; color:var(--ink); font-family:var(--font-display); font-size:19px; font-weight:400; line-height:1; letter-spacing:-.05em; }
        .quick-access-status { display:inline-flex; align-items:center; gap:3px; color:var(--muted); font-size:9px; font-weight:800; white-space:nowrap; }
        .filter-control-group { display:flex; align-items:center; gap:7px; flex:0 0 auto; }
        .filter-row-summary { display:flex; align-items:center; gap:10px; flex:1 1 auto; min-width:80px; color:var(--muted); }
        .filter-summary-rule { flex:1 1 auto; height:1px; min-width:24px; background:linear-gradient(90deg,var(--line),transparent); }
        .filter-summary-copy { display:inline-flex; align-items:baseline; gap:6px; white-space:nowrap; font-size:10px; }
        .filter-summary-copy strong { color:var(--ink); font-size:14px; }
        .filter-summary-copy small { color:var(--muted); font-size:9px; }
        .filter-actions { display:flex; align-items:center; gap:8px; flex:0 0 auto; margin-left:auto; }
        .quick-access-status svg { color:var(--accent); }
        .filter-popover { position:relative; flex:0 0 auto; }
        .filter-trigger { display:inline-flex; align-items:center; gap:6px; min-height:40px; padding:0 11px; border:1px solid var(--line); border-radius:9px; color:var(--ink); background:var(--surface); font-size:11px; font-weight:900; cursor:pointer; white-space:nowrap; transition:all .18s var(--ease); backdrop-filter:blur(14px); }
        .filter-trigger:hover, .filter-popover.is-open .filter-trigger { color:var(--ink); background:var(--surface-soft); }
        .filter-trigger svg { color:var(--pink); }
        .filter-popover-menu { position:absolute; top:calc(100% + 8px); left:0; z-index:100; display:grid; gap:4px; min-width:190px; max-height:340px; overflow:auto; padding:8px; border:1px solid var(--line); border-radius:12px; background:color-mix(in srgb,var(--surface-elevated) 90%,transparent); box-shadow:0 18px 42px color-mix(in srgb,var(--ink) 18%,transparent); backdrop-filter:saturate(150%) blur(20px); -webkit-backdrop-filter:saturate(150%) blur(20px); }
        .filter-option-button { display:flex; align-items:center; justify-content:space-between; gap:18px; width:100%; padding:8px 9px; border:0; border-radius:8px; color:var(--muted); background:transparent; font-size:11px; font-weight:700; text-align:left; cursor:pointer; }
        .filter-option-button:hover, .filter-option-button.selected { color:var(--ink); background:var(--surface-soft); }
        .filter-option-button span { color:var(--muted); font-size:9px; }
        .framework-menu { display:grid; grid-template-columns:1fr; gap:2px; width:230px; min-width:230px; }
        .sort-menu { min-width:150px; }
        .quick-access-chip { display:flex; align-items:center; width:100%; min-height:28px; padding:0 8px; border:0; border-radius:8px; color:var(--ink); background:var(--surface); font-size:10px; font-weight:800; text-align:left; cursor:pointer; transition:all .18s var(--ease); }
        .quick-access-chip:hover, .quick-access-chip.selected { color:var(--on-soft); background:var(--lime); }
        .recent-trigger { color:var(--ink); }
        .recent-menu { width:270px; min-width:270px; }
        .recent-menu-heading { display:flex; align-items:baseline; justify-content:space-between; gap:10px; padding:3px 5px 7px; border-bottom:0; }
        .recent-menu-heading strong { color:var(--ink); font-size:11px; }
        .recent-menu-heading span { color:var(--muted); font-size:9px; }
        .recent-popover-card { display:flex; align-items:center; gap:8px; padding:7px 5px; border-radius:8px; color:var(--ink); text-decoration:none; }
        .recent-popover-card:hover { background:var(--surface-soft); }
        .recent-popover-card > span:nth-child(2) { display:grid; min-width:0; flex:1; }
        .recent-popover-card strong { overflow:hidden; font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
        .recent-popover-card small { overflow:hidden; margin-top:2px; color:var(--muted); font-size:8px; text-overflow:ellipsis; white-space:nowrap; }
        .recent-popover-card > svg { flex:0 0 auto; color:var(--muted); }
        .recent-popover-orbit { display:grid; place-items:center; flex:0 0 auto; width:24px; height:24px; border:0; border-radius:8px; color:var(--violet); background:var(--surface-soft); font-size:10px; font-weight:900; }
        .recent-empty { margin:5px; color:var(--muted); font-size:10px; line-height:1.45; }
        .quick-access-clear { display:inline-flex; align-items:center; gap:6px; flex:0 0 auto; min-height:32px; padding:0 10px; border:1px solid transparent; border-radius:9px; color:var(--pink); background:transparent; font-size:10px; font-weight:900; cursor:pointer; }
        .quick-access-clear:hover:not(:disabled) { color:var(--ink); background:color-mix(in srgb,var(--pink) 12%,transparent); }
        .quick-access-clear:disabled { cursor:default; opacity:.35; }
        .filter-panel-heading h2 { margin:3px 0 0; font-family:var(--font-display); font-size:24px; font-weight:400; line-height:1.05; letter-spacing:-.05em; }
        .panel-eyebrow, .filter-label { color:var(--pink); font-size:9px; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
        .filter-block { padding:17px 0; border-bottom:1px solid var(--line); }
        .filter-options { display:flex; flex-direction:column; gap:3px; margin-top:10px; }
        .filter-option { display:flex; justify-content:space-between; width:100%; padding:8px 9px; border:1px solid transparent; border-radius:9px; color:var(--muted); background:transparent; font-size:11px; font-weight:700; text-align:left; cursor:pointer; transition:all .17s var(--ease); }
        .filter-option:hover { color:var(--ink); background:var(--surface-soft); }
        .filter-option.selected { color:var(--ink); border-color:color-mix(in srgb,var(--accent) 26%,transparent); background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 14%,transparent),color-mix(in srgb,var(--pink) 9%,transparent)); }
        .filter-option span:last-child { color:var(--muted); font-size:10px; }
        .filter-pills { display:flex; flex-wrap:wrap; gap:5px; margin-top:10px; }
        .filter-pill { padding:6px 8px; border:1px solid var(--line); border-radius:999px; color:var(--muted); background:transparent; font-size:10px; font-weight:800; cursor:pointer; }
        .filter-pill:hover, .filter-pill.selected { color:var(--on-soft); border-color:var(--lime); background:var(--lime); }
        .filter-select { width:100%; min-height:36px; margin-top:9px; padding:0 9px; border:1px solid var(--line); border-radius:9px; color:var(--ink); background:var(--surface); font-size:11px; outline:none; }
        .filter-panel-tip { display:flex; gap:.5rem; margin-top:17px; padding:10px; border-radius:10px; color:var(--muted); background:var(--surface-soft); font-size:10px; line-height:1.4; }
        .filter-panel-tip svg { flex-shrink:0; color:var(--pink); }
        .filter-done { display:inline-flex; align-items:center; justify-content:center; gap:.45rem; width:100%; min-height:38px; margin-top:14px; border:0; border-radius:10px; color:#0A0A0A; background:var(--lime); font-size:11px; font-weight:900; cursor:pointer; }
        .results-area { min-width:0; }
        .results-header { display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; padding-bottom:14px; border-bottom:1px solid var(--line); }
        .results-header h2 { margin:4px 0 0; font-family:var(--font-display); font-size:clamp(2rem,4vw,3rem); font-weight:400; line-height:1; letter-spacing:-.06em; }
        .results-subtitle { margin:6px 0 0; color:var(--muted); font-size:11px; }
        .results-actions { display:flex; align-items:center; gap:7px; }
        .filter-state-note { display:inline-flex; align-items:center; gap:5px; color:var(--muted); font-size:10px; font-weight:800; }
        .filter-state-note svg { color:var(--accent); }
        .view-toggle { display:flex; gap:2px; padding:0; border:0; border-radius:8px; background:var(--surface); }
        .view-toggle button { display:grid; place-items:center; width:30px; height:30px; border:0; border-radius:8px; color:var(--muted); background:transparent; cursor:pointer; }
        .view-toggle button.active { color:var(--on-soft); background:var(--lime); }
        .active-filters { display:flex; flex-wrap:wrap; gap:6px; margin:14px 0; }
        .active-filter { display:inline-flex; align-items:center; gap:5px; padding:6px 9px; border-radius:8px; color:var(--ink); background:var(--surface-soft); font-size:10px; font-weight:800; }
        .active-filter button { display:grid; place-items:center; padding:0; border:0; color:var(--muted); background:transparent; cursor:pointer; }
        .recent-strip { display:flex; align-items:center; gap:8px; margin:0 0 17px; padding:10px 12px; overflow:auto; border:1px solid var(--line); border-radius:12px; background:var(--surface); }
        .recent-label { flex-shrink:0; color:var(--pink); font-size:9px; font-weight:900; letter-spacing:.11em; text-transform:uppercase; }
        .recent-link { display:inline-flex; align-items:center; gap:4px; flex-shrink:0; padding:5px 8px; border-radius:7px; color:var(--muted); background:var(--surface-soft); font-size:10px; font-weight:700; text-decoration:none; }
        .recent-link:hover { color:var(--ink); }
        .resource-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        .resource-grid.list-view { grid-template-columns:1fr; }
        .resource-card { position:relative; display:flex; flex-direction:column; width:100%; min-width:0; min-height:0; overflow:hidden; border:1px solid var(--line); border-radius:12px; background:var(--surface); box-shadow:var(--shadow); transition:transform .2s var(--ease), box-shadow .2s var(--ease), border-color .2s var(--ease); backdrop-filter:blur(16px); }
        .resource-card::before { display:none; }
        .resource-card:hover { transform:translateY(-4px); border-color:color-mix(in srgb,var(--accent) 48%,var(--line)); box-shadow:0 22px 42px color-mix(in srgb,var(--ink) 16%,transparent); }
        .resource-card:focus-within { outline:2px solid var(--accent); outline-offset:2px; box-shadow:0 0 0 5px color-mix(in srgb,var(--accent) 18%,transparent),0 12px 28px rgba(14,41,49,.12); }
        .resource-preview { position:relative; aspect-ratio:16/10; margin:0; overflow:hidden; border-bottom:1px solid var(--line); border-radius:11px 11px 0 0; background:linear-gradient(135deg,var(--surface-soft),var(--surface-elevated)); }
        .resource-preview::before { content:""; position:absolute; inset:0 0 auto; z-index:3; height:25px; border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent); background:linear-gradient(180deg,color-mix(in srgb,var(--surface-elevated) 92%,transparent),color-mix(in srgb,var(--surface-soft) 72%,transparent)); }
        .resource-preview::after { content:""; position:absolute; top:9px; left:11px; z-index:4; width:34px; height:7px; pointer-events:none; border-radius:999px; background:radial-gradient(circle at 3px 3px,var(--pink) 0 3px,transparent 3.5px),radial-gradient(circle at 17px 3px,var(--cyan) 0 3px,transparent 3.5px),radial-gradient(circle at 31px 3px,var(--accent) 0 3px,transparent 3.5px); }
        .resource-preview img { position:absolute; top:25px; left:0; display:block; width:100%; height:calc(100% - 25px); object-fit:contain; object-position:top center; background:var(--surface-soft); transition:transform .45s var(--ease), opacity .3s var(--ease); }
        .resource-card:hover .resource-preview img { transform:scale(1.025); }
        .resource-preview-tools { position:absolute; top:1px; right:8px; z-index:5; }
        .resource-preview-tools .icon-button { width:36px; height:36px; border:0; border-radius:7px; color:var(--ink); background:transparent; box-shadow:none; backdrop-filter:none; }
        .resource-preview-tools .icon-button:hover, .resource-preview-tools .icon-button.is-copied { color:var(--accent); border-color:transparent; background:var(--lime); }
        .preview-skeleton { position:absolute; inset:25px 0 0; display:grid; align-content:end; gap:7px; padding:16px; overflow:hidden; background:linear-gradient(135deg,var(--surface-soft),var(--surface-elevated)); }
        .preview-skeleton::before { content:""; position:absolute; inset:0; background:linear-gradient(105deg,transparent 25%,rgba(255,255,255,.32) 45%,transparent 65%); transform:translateX(-100%); animation:preview-shimmer 1.35s infinite; }
        .preview-skeleton-line { position:relative; width:46%; height:7px; border-radius:999px; background:color-mix(in srgb,var(--ink) 16%,transparent); }
        .preview-skeleton-line.short { width:28%; }
        @keyframes preview-shimmer { to { transform:translateX(100%); } }
        .preview-placeholder { position:absolute; inset:25px 0 0; display:grid; place-items:center; align-content:center; gap:8px; color:var(--muted); background:linear-gradient(135deg,var(--surface-soft),var(--surface-elevated)); }
        .preview-placeholder small { font-size:9px; font-weight:800; letter-spacing:.04em; }
        .preview-fallback-link { color:var(--ink); font-size:9px; font-weight:900; text-decoration:underline; text-underline-offset:3px; }
        .preview-initials { display:grid; place-items:center; width:42px; height:42px; border:1px solid color-mix(in srgb,var(--accent) 45%,transparent); border-radius:8px; color:var(--accent-ink); background:var(--accent-fill); font-size:12px; font-weight:900; }
        .resource-card-link { display:flex; flex:1; flex-direction:column; color:var(--ink); text-decoration:none; }
        .resource-card-link:focus-visible { outline:3px solid var(--focus); outline-offset:-3px; }
        .resource-card-copy { display:flex; flex:1; flex-direction:column; padding:11px 14px 12px; }
        .resource-category-line { display:flex; align-items:center; gap:7px; min-height:15px; }
        .resource-category { color:var(--card-accent); font-size:8px; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
        .resource-card h3 { display:flex; align-items:center; justify-content:space-between; gap:10px; margin:5px 0 5px; font-size:17px; line-height:1.08; letter-spacing:-.05em; }
        .resource-card h3 svg { flex-shrink:0; opacity:.48; transition:transform .18s var(--ease); }
        .resource-card:hover h3 svg { transform:translate(3px,-3px); opacity:1; }
        .resource-card p { min-height:34px; margin:0; color:var(--muted); font-size:10px; line-height:1.45; }
        .resource-card mark { padding:0 2px; border-radius:3px; color:var(--ink); background:var(--lime); }
        .new-badge { padding:2px 5px; border-radius:8px; color:var(--ink); background:var(--lime); font-size:7px; font-weight:900; letter-spacing:.05em; text-transform:uppercase; }
        .empty-state { display:grid; place-items:center; min-height:300px; padding:30px; border:1px dashed var(--line); border-radius:18px; text-align:center; }
        .empty-symbol { display:grid; place-items:center; width:54px; height:54px; margin-bottom:13px; border-radius:18px; color:var(--on-soft); background:var(--lime); }
        .empty-state h3 { margin:0; font-family:var(--font-display); font-size:22px; font-weight:400; line-height:1.05; }
        .empty-state p { max-width:300px; margin:7px 0 16px; color:var(--muted); font-size:11px; line-height:1.5; }
        .suggest-section { margin-top:42px; border:1px solid var(--line); border-radius:20px; overflow:hidden; background:linear-gradient(135deg,var(--surface),var(--surface-soft)); }
        .suggest-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:22px; cursor:pointer; }
        .suggest-title { display:flex; gap:.8rem; align-items:center; }
        .suggest-icon { display:grid; place-items:center; width:38px; height:38px; border-radius:13px; color:var(--on-soft); background:var(--lime); }
        .suggest-title strong { display:block; font-size:13px; }
        .suggest-title span { display:block; margin-top:4px; color:var(--muted); font-size:10px; }
        .suggest-form { display:grid; gap:12px; padding:0 22px 22px; }
        .suggest-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .field { display:grid; gap:6px; }
        .field label { color:var(--muted); font-size:10px; font-weight:800; }
        .field input, .field textarea { width:100%; border:1px solid var(--line); border-radius:10px; padding:10px; outline:0; color:var(--ink); background:var(--surface); font-size:11px; } .field input:focus-visible, .field textarea:focus-visible { outline:3px solid var(--focus); outline-offset:3px; }
        .field textarea { min-height:80px; resize:vertical; }
        .suggest-form-footer { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
        .suggest-form-footer p { margin:0; color:var(--muted); font-size:10px; }
        .app-footer { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:24px 0 0; color:var(--muted); font-size:10px; }
        @media (max-width:1060px) { .header-nav { display:none; } .mobile-menu-toggle { display:inline-flex; } .directory-main { padding-top:calc(64px + 16px + 60px); } .quick-access-panel { top:80px; left:18px; width:calc(100% - 36px); } .results-area { width:100%; } .mobile-nav { position:absolute; top:calc(100% + 8px); left:18px; right:18px; z-index:90; display:grid; gap:4px; padding:8px; border:1px solid var(--line); border-radius:12px; background:color-mix(in srgb,var(--surface-elevated) 96%,transparent); box-shadow:0 18px 42px color-mix(in srgb,var(--ink) 18%,transparent); backdrop-filter:saturate(150%) blur(20px); } .mobile-nav button, .mobile-nav a { display:flex; align-items:center; gap:10px; min-height:44px; padding:0 12px; border:0; border-radius:8px; color:var(--ink); background:transparent; font-size:12px; font-weight:800; text-decoration:none; text-align:left; } .mobile-nav button:hover, .mobile-nav a:hover, .mobile-nav button[aria-current="page"] { background:var(--surface-soft); } }
        @media (max-width:820px) { .header-inner, .app-main { padding-left:18px; padding-right:18px; } .header-inner { min-height:64px; } .brand-lockup { min-width:auto; } .brand-caption { display:none; } .header-actions { margin-left:auto; } .theme-switch-label { display:none; } .welcome-grid { grid-template-columns:1fr; min-height:auto; padding:28px 22px 18px; } .hero-orbit { min-height:185px; } .hero-orbit-card.one { left:3%; } .hero-orbit-card.two { right:4%; } .metric-grid { grid-template-columns:repeat(2,1fr); } .spotlight-grid { grid-template-columns:1fr; } .resource-grid, .resource-grid.list-view { grid-template-columns:1fr; gap:16px; } }
        @media (max-width:700px) { .view-toggle { display:none; } .resource-grid, .resource-grid.list-view { grid-template-columns:1fr; } }
        @media (max-width:560px) { .app-main { padding-top:16px; } .header-nav button, .github-link { min-height:44px; min-width:44px; } .header-actions .github-link { display:none; } .resource-card p { font-size:12px; line-height:1.55; } .resource-card-copy { padding:14px 16px 16px; } .vengeance-main { padding-top:64px; } .directory-main { padding-top:calc(64px + 12px + 60px); } .welcome-title { font-size:clamp(3.15rem,16vw,5rem); } .hero-search { margin-top:22px; } .hero-search-kbd { display:none; } .hero-search .button { min-width:38px; padding:0; } .metric-grid { gap:8px; margin-bottom:28px; } .metric-card { padding:12px; } .metric-card strong { font-size:24px; } .section-header { align-items:flex-start; flex-direction:column; gap:5px; } .spotlight-card { min-height:140px; } .landing-topics { padding:18px; } .landing-topic-grid { grid-template-columns:1fr; } .quick-access-panel { top:76px; left:18px; overflow-x:auto; overflow-y:visible; scrollbar-width:none; } .quick-access-panel::-webkit-scrollbar { display:none; } .quick-access-row { width:max-content; min-width:100%; } .quick-access-heading .quick-access-status { display:none; } .filter-row-summary { min-width:40px; } .filter-summary-rule { display:none; } .filter-summary-copy small { display:none; } .filter-actions .quick-access-status { display:none; } .filter-trigger { padding:0 7px; } .filter-popover-menu { position:fixed; top:132px; left:18px; max-width:calc(100vw - 36px); } .github-link span { display:none; } .brand-name { font-size:10px; letter-spacing:.09em; } .framework-menu { width:230px; } .recent-menu { width:270px; } .resource-grid { grid-template-columns:1fr; } .results-header { align-items:flex-start; flex-direction:column; } .results-actions { width:100%; justify-content:space-between; } .suggest-form-grid { grid-template-columns:1fr; } .app-footer { align-items:flex-start; flex-direction:column; } }
        @media (min-width:821px) { .resource-grid:not(.list-view) { grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); } }
        @media (max-width:700px) { .resource-grid, .resource-grid.list-view { gap:12px; } .resource-card { border-radius:14px; } .resource-preview { aspect-ratio:16/10; } .resource-card-copy { padding:12px; } .resource-card h3 { font-size:16px; line-height:1.12; } .resource-card p { min-height:0; font-size:11px; line-height:1.5; } .resource-preview-tools .icon-button { width:40px; height:40px; } .filter-trigger { min-height:40px; } }
        @media (max-width:560px) { .quick-access-panel { left:12px; width:calc(100% - 24px); padding:8px; } .quick-access-row { gap:8px; } .filter-control-group { gap:6px; } .filter-popover-menu { max-height:min(60vh,340px); } .filter-option-button, .quick-access-chip { min-height:40px; } .active-filter button { min-width:32px; min-height:32px; } }
        @media (max-width:820px) { .quick-access-panel { overflow:visible; } .quick-access-row { flex-wrap:wrap; overflow:visible; } .filter-control-group { flex:1 1 auto; flex-wrap:wrap; min-width:0; } .filter-row-summary { flex-basis:100%; min-width:0; } .filter-actions { margin-left:auto; } }
        @media (max-width:700px) { .directory-main { padding-top:calc(64px + 12px + 220px); } .quick-access-panel { top:76px; left:12px; width:calc(100% - 24px); padding:10px; } .quick-access-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; width:100%; min-width:0; } .quick-access-heading { grid-column:1 / -1; height:auto; min-height:28px; } .filter-control-group { display:grid; grid-column:1 / -1; grid-template-columns:repeat(2,minmax(0,1fr)); width:100%; gap:8px; } .filter-popover { min-width:0; } .filter-trigger { width:100%; justify-content:space-between; min-height:44px; padding:0 10px; } .filter-row-summary { grid-column:1 / -1; display:flex; min-width:0; } .filter-summary-copy { width:100%; justify-content:space-between; } .filter-actions { grid-column:1 / -1; width:100%; justify-content:space-between; margin-left:0; } .filter-popover-menu { position:fixed; top:calc(64px + 220px); left:12px; right:12px; width:auto; min-width:0; max-width:none; max-height:min(58vh,360px); } }
        .directory-main { padding:104px clamp(18px,4vw,48px) 56px; }
        .directory-experience { width:min(1360px,100%); margin:0 auto; }
        .directory-masthead { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:20px 26px; align-items:end; padding:clamp(22px,3.5vw,42px); border:1px solid var(--line); border-radius:24px; background:linear-gradient(135deg,color-mix(in srgb,var(--surface-elevated) 98%,transparent),color-mix(in srgb,var(--accent) 5%,var(--surface))); box-shadow:0 24px 70px color-mix(in srgb,var(--ink) 7%,transparent); }
        .directory-masthead-copy { max-width:760px; }
        .directory-eyebrow { margin:0 0 10px; color:var(--accent); font-size:9px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; }
        .directory-masthead h1 { margin:0; color:var(--ink); font-family:var(--font-display); font-size:clamp(2.9rem,7vw,6.8rem); font-weight:400; line-height:.9; letter-spacing:-.08em; }
        .directory-lede { max-width:620px; margin:20px 0 0; color:var(--muted); font-size:14px; line-height:1.65; }
        .directory-masthead-stat { display:grid; justify-items:end; align-content:end; gap:4px; min-width:150px; padding-bottom:4px; }
        .directory-masthead-stat strong { color:var(--ink); font-size:clamp(2rem,4vw,3.6rem); font-weight:500; letter-spacing:-.08em; }
        .directory-masthead-stat span { color:var(--muted); font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        .directory-search-panel { grid-column:1 / -1; }
        .directory-search-panel label { display:block; margin-bottom:8px; color:var(--muted); font-size:10px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; }
        .directory-search-field { display:flex; align-items:center; gap:9px; min-height:52px; padding:0 14px; border:1px solid var(--line); border-radius:13px; color:var(--accent); background:var(--surface); box-shadow:0 10px 28px color-mix(in srgb,var(--ink) 5%,transparent); }
        .directory-search-field:focus-within { border-color:color-mix(in srgb,var(--accent) 60%,var(--line)); box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 12%,transparent); }
        .directory-search-field input { min-width:0; flex:1; padding:0; border:0; outline:0; color:var(--ink); background:transparent; font-size:15px; } .directory-search-field input:focus-visible { outline:3px solid var(--focus); outline-offset:3px; border-radius:4px; }
        .directory-search-field input::placeholder { color:var(--muted); }
        .directory-search-field kbd { padding:3px 7px; border:1px solid var(--line); border-radius:5px; color:var(--muted); background:var(--surface-soft); font-size:10px; }
        .directory-search-clear { display:grid; place-items:center; width:32px; height:32px; padding:0; border:0; border-radius:8px; color:var(--muted); background:transparent; cursor:pointer; }
        .directory-search-clear:hover { color:var(--ink); background:var(--surface-soft); }
        .directory-search-strip { display:grid; grid-template-columns:minmax(220px,260px) minmax(0,1fr); gap:22px; align-items:center; padding:14px 16px; border:1px solid var(--line); border-radius:14px; background:var(--surface-elevated); box-shadow:0 10px 28px color-mix(in srgb,var(--ink) 4%,transparent); }
        .directory-search-strip-copy { min-width:0; }
        .directory-search-strip-copy .directory-eyebrow { margin-bottom:5px; }
        .directory-search-strip-copy label { display:block; overflow:hidden; color:var(--ink); font-size:12px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
        .directory-search-strip .directory-search-field { min-height:46px; box-shadow:none; }
        .directory-layout { display:grid; grid-template-columns:minmax(220px,260px) minmax(0,1fr); gap:22px; align-items:start; margin-top:16px; }
        .directory-filter-rail { position:sticky; top:92px; min-width:0; }
        .directory-rail-intro { margin:0 0 14px; padding:0 4px; }
        .directory-rail-intro h2 { margin:0; color:var(--ink); font-family:var(--font-display); font-size:26px; font-weight:400; letter-spacing:-.06em; }
        .directory-rail-intro p:last-child { margin:9px 0 0; color:var(--muted); font-size:11px; line-height:1.5; }
        .directory-filter-panel { position:relative; padding:18px; border:1px solid var(--line); border-radius:18px; background:var(--surface-elevated); box-shadow:0 18px 42px color-mix(in srgb,var(--ink) 6%,transparent); }
        .directory-filter-panel-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding-bottom:15px; border-bottom:1px solid var(--line); }
        .directory-filter-panel-head h2 { margin:0; color:var(--ink); font-size:18px; font-weight:800; letter-spacing:-.03em; }
        .directory-filter-count { padding:4px 7px; border-radius:999px; color:var(--ink); background:color-mix(in srgb,var(--accent) 10%,transparent); font-size:9px; font-weight:900; white-space:nowrap; }
        .directory-filter-list { display:grid; gap:9px; margin-top:16px; }
        .directory-filter-control { position:relative; min-width:0; }
        .directory-filter-trigger { display:flex; align-items:center; justify-content:space-between; width:100%; min-height:58px; padding:9px 11px; border:1px solid var(--line); border-radius:11px; color:var(--ink); background:var(--surface); text-align:left; cursor:pointer; }
        .directory-filter-trigger:hover, .directory-filter-control.is-open .directory-filter-trigger { border-color:color-mix(in srgb,var(--accent) 52%,var(--line)); background:var(--surface-soft); }
        .directory-filter-trigger > span { display:grid; gap:4px; min-width:0; }
        .directory-filter-trigger small { color:var(--muted); font-size:9px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; }
        .directory-filter-trigger strong { overflow:hidden; color:var(--ink); font-size:12px; text-overflow:ellipsis; white-space:nowrap; }
        .directory-filter-trigger svg { flex:0 0 auto; color:var(--accent); }
        .directory-filter-menu { position:absolute; top:calc(100% + 7px); left:0; right:0; z-index:100; display:grid; gap:3px; max-height:340px; overflow:auto; padding:7px; border:1px solid var(--line); border-radius:12px; background:var(--surface-elevated); box-shadow:0 20px 45px color-mix(in srgb,var(--ink) 18%,transparent); }
        .directory-filter-menu button { display:flex; align-items:center; justify-content:space-between; gap:12px; width:100%; min-height:38px; padding:0 9px; border:0; border-radius:7px; color:var(--muted); background:transparent; font-size:11px; font-weight:700; text-align:left; cursor:pointer; }
        .directory-filter-menu button:hover, .directory-filter-menu button.is-selected { color:var(--ink); background:color-mix(in srgb,var(--accent) 10%,var(--surface-soft)); }
        .directory-filter-menu button small { color:var(--muted); font-size:9px; }
        .directory-filter-summary { display:flex; align-items:baseline; gap:7px; margin:18px 0; padding:12px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
        .directory-filter-summary strong { color:var(--ink); font-size:23px; letter-spacing:-.06em; }
        .directory-filter-summary span { color:var(--muted); font-size:10px; line-height:1.35; }
        .directory-filter-actions { display:flex; gap:7px; }
        .directory-reset-button, .directory-recent-button { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:40px; padding:0 9px; border:1px solid var(--line); border-radius:8px; color:var(--muted); background:var(--surface); font-size:10px; font-weight:900; cursor:pointer; }
        .directory-reset-button { flex:1; }
        .directory-recent-button { flex:0 0 auto; }
        .directory-reset-button:hover:not(:disabled), .directory-recent-button:hover { color:var(--ink); border-color:color-mix(in srgb,var(--accent) 45%,var(--line)); background:var(--surface-soft); }
        .directory-reset-button:disabled { cursor:default; opacity:.45; }
        .directory-recent-menu { position:absolute; right:18px; bottom:68px; left:18px; z-index:101; display:grid; gap:3px; padding:7px; border:1px solid var(--line); border-radius:12px; background:var(--surface-elevated); box-shadow:0 20px 45px color-mix(in srgb,var(--ink) 18%,transparent); }
        .directory-recent-menu a { display:flex; align-items:center; justify-content:space-between; min-height:38px; padding:0 9px; border-radius:7px; color:var(--ink); font-size:10px; font-weight:700; text-decoration:none; }
        .directory-recent-menu a:hover { background:var(--surface-soft); }
        .directory-recent-menu p { margin:8px; color:var(--muted); font-size:10px; }
        .directory-results { min-width:0; }
        .directory-results-head { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; padding-bottom:16px; border-bottom:1px solid var(--line); }
        .directory-results-head h2 { margin:0; color:var(--ink); font-family:var(--font-display); font-size:clamp(2rem,4vw,3.5rem); font-weight:400; line-height:.95; letter-spacing:-.07em; }
        .directory-results-head p:last-child { margin:9px 0 0; color:var(--muted); font-size:11px; }
        .directory-results-actions { display:flex; align-items:center; gap:12px; }
        .directory-result-count { color:var(--muted); font-size:10px; font-weight:900; white-space:nowrap; }
        .directory-view-toggle { display:flex; gap:3px; padding:3px; border:1px solid var(--line); border-radius:10px; background:var(--surface); }
        .directory-view-toggle button { display:inline-flex; align-items:center; gap:6px; min-height:34px; padding:0 9px; border:0; border-radius:7px; color:var(--muted); background:transparent; font-size:10px; font-weight:900; cursor:pointer; }
        .directory-view-toggle button.is-active { color:var(--accent-ink); background:var(--accent-fill); }
        .directory-active-filters { display:flex; flex-wrap:wrap; gap:6px; margin:14px 0 18px; }
        .directory-filter-chip { display:inline-flex; align-items:center; gap:7px; min-height:30px; padding:0 8px 0 11px; border:1px solid color-mix(in srgb,var(--accent) 25%,var(--line)); border-radius:999px; color:var(--ink); background:color-mix(in srgb,var(--accent) 7%,var(--surface)); font-size:10px; font-weight:800; }
        .directory-filter-chip button { display:grid; place-items:center; width:23px; height:23px; padding:0; border:0; border-radius:50%; color:var(--muted); background:transparent; cursor:pointer; }
        .directory-filter-chip button:hover { color:var(--ink); background:var(--surface-soft); }
        .directory-card-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
        .directory-card-grid.is-list { grid-template-columns:1fr; }
        .directory-resource-card { min-width:0; overflow:hidden; border:1px solid var(--line); border-radius:16px; background:var(--surface-elevated); box-shadow:0 14px 34px color-mix(in srgb,var(--ink) 5%,transparent); transition:transform .18s var(--ease),box-shadow .18s var(--ease),border-color .18s var(--ease); }
        .directory-resource-card:hover { transform:translateY(-3px); border-color:color-mix(in srgb,var(--card-accent) 38%,var(--line)); box-shadow:0 22px 48px color-mix(in srgb,var(--ink) 11%,transparent); }
        .directory-preview-frame { position:relative; aspect-ratio:16/10; overflow:hidden; border-bottom:1px solid var(--line); background:var(--surface-soft); }
        .directory-preview-link { position:absolute; inset:0; display:block; color:inherit; text-decoration:none; }
        .directory-preview-link img { display:block; width:100%; height:100%; object-fit:cover; transition:transform .35s var(--ease); }
        .directory-resource-card:hover .directory-preview-link img { transform:scale(1.025); }
        .directory-preview-toolbar { position:absolute; right:10px; bottom:10px; left:10px; display:flex; align-items:center; justify-content:space-between; gap:8px; pointer-events:none; }
        .directory-preview-toolbar > span { padding:5px 7px; border:1px solid color-mix(in srgb,#fff 30%,transparent); border-radius:5px; color:#fff; background:rgba(8,12,18,.62); font-size:8px; font-weight:900; letter-spacing:.11em; }
        .directory-copy-button { display:inline-flex; align-items:center; gap:6px; min-height:36px; padding:0 9px; border:1px solid rgba(255,255,255,.28); border-radius:7px; color:#fff; background:rgba(8,12,18,.72); font-size:9px; font-weight:900; cursor:pointer; pointer-events:auto; }
        .directory-copy-button:hover, .directory-copy-button.is-copied { color:var(--accent-ink); border-color:var(--accent-fill); background:var(--accent-fill); }
        .directory-preview-skeleton { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end; gap:7px; padding:22px; background:linear-gradient(135deg,var(--surface-soft),var(--surface)); }
        .directory-preview-skeleton span { display:block; width:42%; height:7px; border-radius:99px; background:color-mix(in srgb,var(--muted) 20%,transparent); }
        .directory-preview-skeleton span:nth-child(2) { width:28%; }
        .directory-preview-skeleton span:nth-child(3) { width:58%; }
        .directory-preview-error { position:absolute; inset:0; display:grid; place-items:center; align-content:center; gap:8px; color:var(--muted); background:linear-gradient(135deg,var(--surface-soft),var(--surface)); text-align:center; }
        .directory-preview-error span { display:grid; place-items:center; width:54px; height:54px; border-radius:14px; color:var(--ink); background:color-mix(in srgb,var(--accent) 12%,var(--surface)); font-size:16px; font-weight:900; }
        .directory-preview-error small { font-size:10px; }
        .directory-card-body { padding:14px 15px 13px; }
        .directory-card-meta { display:flex; align-items:center; flex-wrap:wrap; gap:7px; min-width:0; }
        .directory-card-category { color:var(--category-accent); font-size:9px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; } .theme-dark .directory-card-category { color:var(--category-accent-dark, color-mix(in srgb,var(--category-accent) 42%,#FFFFFF)); }
        .directory-new-badge { padding:3px 6px; border-radius:4px; color:var(--accent-ink); background:var(--accent-fill); font-size:8px; font-weight:900; text-transform:uppercase; }
        .directory-card-url { overflow:hidden; max-width:42%; margin-left:auto; color:var(--muted); font-size:9px; text-overflow:ellipsis; white-space:nowrap; }
        .directory-card-body h3 { margin:9px 0 6px; font-size:18px; line-height:1.05; letter-spacing:-.04em; }
        .directory-card-body h3 a { display:flex; align-items:center; justify-content:space-between; gap:10px; color:var(--ink); text-decoration:none; }
        .directory-card-body h3 svg { flex:0 0 auto; color:var(--card-accent); } .theme-dark .directory-card-body h3 svg, .theme-dark .directory-card-body h3 a:hover, .theme-dark .directory-visit-action { color:var(--card-accent-dark, color-mix(in srgb,var(--card-accent) 42%,#FFFFFF)); }
        .directory-card-body h3 a:hover { color:var(--card-accent); }
        .directory-card-body p { display:-webkit-box; min-height:43px; margin:0; overflow:hidden; color:var(--muted); font-size:11px; line-height:1.55; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
        .directory-card-tags { display:flex; flex-wrap:wrap; gap:5px; margin-top:10px; }
        .directory-card-tags span { padding:4px 6px; border:1px solid var(--line); border-radius:4px; color:var(--muted); background:var(--surface-soft); font-size:8px; font-weight:800; }
        .directory-card-actions { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:13px; padding-top:11px; border-top:1px solid var(--line); }
        .directory-visit-action { display:inline-flex; align-items:center; gap:7px; color:var(--card-accent); font-size:10px; font-weight:900; text-decoration:none; }
        .directory-visit-action:hover { color:var(--ink); }
        .directory-card-index { color:var(--muted); font-size:8px; font-weight:900; letter-spacing:.08em; }
        .directory-recent-strip { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:24px; padding:15px 17px; border:1px solid var(--line); border-radius:16px; background:var(--surface); }
        .directory-recent-strip strong { color:var(--ink); font-size:15px; }
        .directory-recent-links { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:7px; }
        .directory-recent-links a { display:inline-flex; align-items:center; gap:7px; min-height:34px; padding:0 10px; border:1px solid var(--line); border-radius:7px; color:var(--muted); background:var(--surface-soft); font-size:10px; font-weight:800; text-decoration:none; }
        .directory-recent-links a:hover { color:var(--accent); border-color:color-mix(in srgb,var(--accent) 38%,var(--line)); }
        .directory-recent-empty { margin:0; color:var(--muted); font-size:11px; }
        .directory-suggestion { margin-top:16px; border:1px solid var(--line); border-radius:16px; background:var(--surface); }
        .directory-suggestion-trigger { display:flex; align-items:center; justify-content:space-between; width:100%; min-height:74px; padding:0 20px; border:0; color:var(--ink); background:transparent; text-align:left; cursor:pointer; }
        .directory-suggestion-trigger > span { display:flex; align-items:center; gap:12px; }
        .directory-suggestion-icon { display:grid; place-items:center; width:36px; height:36px; border-radius:10px; color:var(--accent); background:color-mix(in srgb,var(--accent) 10%,transparent); }
        .directory-suggestion-trigger strong, .directory-suggestion-trigger small { display:block; }
        .directory-suggestion-trigger strong { font-size:13px; }
        .directory-suggestion-trigger small { margin-top:4px; color:var(--muted); font-size:10px; }
        .directory-suggestion-form { display:grid; gap:13px; padding:0 20px 20px; }
        .directory-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
        .directory-form-grid label, .directory-suggestion-form > label { display:grid; gap:7px; color:var(--muted); font-size:10px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
        .directory-suggestion-form input, .directory-suggestion-form textarea { width:100%; min-height:42px; padding:0 11px; border:1px solid var(--line); border-radius:8px; outline:0; color:var(--ink); background:var(--surface-elevated); font-size:12px; font-weight:500; letter-spacing:normal; text-transform:none; }
        .directory-suggestion-form textarea { min-height:82px; padding-top:10px; resize:vertical; }
        .directory-suggestion-form input:focus, .directory-suggestion-form textarea:focus { border-color:var(--accent); box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 12%,transparent); }
        .directory-form-footer { display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .directory-form-footer p { margin:0; color:var(--muted); font-size:10px; }
        .directory-primary-button, .directory-secondary-button { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:42px; padding:0 13px; border:1px solid transparent; border-radius:8px; color:var(--accent-ink); background:var(--accent-fill); font-size:10px; font-weight:900; cursor:pointer; }
        .directory-primary-button:hover, .directory-secondary-button:hover { color:var(--paper); background:var(--ink); }
        .directory-primary-button:disabled { cursor:default; opacity:.42; }
        .directory-success { display:flex; align-items:center; gap:10px; min-height:52px; padding:0 13px; border-radius:9px; color:var(--accent); background:color-mix(in srgb,var(--accent) 9%,var(--surface)); font-size:11px; font-weight:800; }
        .directory-footer { display:flex; justify-content:space-between; gap:12px; margin-top:18px; padding:0 4px; color:var(--muted); font-size:9px; }
        .directory-empty { display:grid; justify-items:center; gap:8px; padding:72px 24px; border:1px dashed var(--line); border-radius:16px; text-align:center; }
        .directory-empty-mark { display:grid; place-items:center; width:44px; height:44px; border-radius:12px; color:var(--accent); background:color-mix(in srgb,var(--accent) 10%,transparent); }
        .directory-empty .directory-eyebrow { margin:8px 0 0; }
        .directory-empty h3 { margin:0; color:var(--ink); font-size:20px; }
        .directory-empty > p:not(.directory-eyebrow) { max-width:360px; margin:0 0 8px; color:var(--muted); font-size:11px; line-height:1.5; }
        @media (max-width:1100px) { .directory-card-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .directory-card-url { max-width:36%; } }
        @media (max-width:900px) { .directory-main { padding:92px 18px 44px; } .directory-search-strip { grid-template-columns:1fr; gap:10px; padding:13px 14px; } .directory-search-strip .directory-search-field { min-height:50px; } .directory-layout { display:block; margin-top:16px; } .directory-filter-rail { position:static; margin-bottom:26px; } .directory-rail-intro { display:flex; align-items:end; justify-content:space-between; gap:16px; } .directory-rail-intro p:last-child { max-width:300px; margin:0; text-align:right; } .directory-filter-panel { padding:15px; } .directory-filter-list { grid-template-columns:repeat(3,minmax(0,1fr)); } .directory-filter-menu { position:fixed; top:94px; right:18px; left:18px; max-height:min(58vh,420px); } }
        @media (max-width:640px) { .directory-main { padding:84px 12px 34px; } .directory-search-strip { padding:12px; border-radius:12px; } .directory-search-strip-copy label { font-size:11px; white-space:normal; } .directory-masthead { grid-template-columns:1fr; gap:20px; padding:24px 18px; border-radius:18px; } .directory-masthead h1 { font-size:clamp(2.8rem,15vw,4.7rem); } .directory-lede { margin-top:15px; font-size:12px; } .directory-masthead-stat { justify-items:start; min-width:0; } .directory-masthead-stat strong { font-size:32px; } .directory-search-field { min-height:54px; } .directory-search-field kbd { display:none; } .directory-filter-rail { margin-bottom:18px; } .directory-rail-intro { display:block; } .directory-rail-intro p:last-child { margin-top:7px; text-align:left; } .directory-filter-list { grid-template-columns:1fr; gap:7px; } .directory-filter-trigger { min-height:54px; } .directory-filter-menu { top:84px; right:12px; left:12px; } .directory-results-head { align-items:flex-start; flex-direction:column; gap:13px; } .directory-results-actions { justify-content:space-between; width:100%; } .directory-card-grid, .directory-card-grid.is-list { grid-template-columns:1fr; gap:14px; } .directory-preview-frame { aspect-ratio:16/10; } .directory-card-body { padding:15px; } .directory-card-body h3 { font-size:18px; } .directory-card-url { max-width:48%; } .directory-recent-strip { align-items:flex-start; flex-direction:column; gap:12px; padding:16px; } .directory-recent-links { justify-content:flex-start; } .directory-suggestion-trigger { min-height:68px; padding:0 14px; } .directory-suggestion-form { padding:0 14px 14px; } .directory-form-grid { grid-template-columns:1fr; } .directory-form-footer { align-items:stretch; flex-direction:column; } .directory-primary-button { width:100%; } .directory-footer { align-items:flex-start; flex-direction:column; } }
        /* Site-wide Neubrutalist visual system: hard edges, visible borders, offset shadows, and flat arcade color blocks. */
        .site-header { background:var(--surface-elevated); box-shadow:0 3px 0 var(--neo-shadow-color); backdrop-filter:none; -webkit-backdrop-filter:none; }
        .brand-symbol { border:2px solid var(--ink); border-radius:8px; background:var(--accent-fill); box-shadow:3px 3px 0 var(--neo-shadow-color); }
        .brand-lockup:hover .brand-symbol { transform:translate(2px,2px); box-shadow:1px 1px 0 var(--neo-shadow-color); }
        .header-nav button, .github-link, .theme-switch, .mobile-menu-toggle { border:2px solid transparent; border-radius:8px; }
        .header-nav button:hover, .header-nav button[aria-current="page"], .github-link:hover, .mobile-menu-toggle:hover { border-color:var(--ink); color:var(--accent-ink); background:var(--accent-fill); box-shadow:3px 3px 0 var(--neo-shadow-color); }
        .theme-switch { border-color:var(--ink); background:var(--surface); box-shadow:3px 3px 0 var(--neo-shadow-color); transition:none; }
        .theme-switch:hover { color:var(--ink); background:var(--surface); box-shadow:3px 3px 0 var(--neo-shadow-color); transform:none; }
        .theme-switch:active { color:var(--ink); background:var(--surface); box-shadow:1px 1px 0 var(--neo-shadow-color); transform:translate(2px,2px); }
        .theme-switch-icon { color:currentColor; background:transparent; }
        .button, .button-primary, .button-secondary, .button-ghost, .directory-primary-button, .directory-secondary-button, .directory-reset-button, .directory-recent-button, .directory-copy-button { border:2px solid var(--ink); border-radius:8px; box-shadow:4px 4px 0 var(--neo-shadow-color); }
        .button:hover, .directory-primary-button:hover, .directory-secondary-button:hover, .directory-reset-button:hover:not(:disabled), .directory-recent-button:hover, .directory-copy-button:hover { transform:translate(2px,2px); box-shadow:2px 2px 0 var(--neo-shadow-color); }
        .button:active, .directory-primary-button:active, .directory-secondary-button:active, .directory-reset-button:active, .directory-recent-button:active, .directory-copy-button:active { transform:translate(4px,4px); box-shadow:none; }
        .directory-masthead, .directory-search-strip, .directory-filter-panel, .directory-recent-strip, .directory-suggestion, .directory-resource-card, .resource-card, .metric-card, .spotlight-card, .landing-topics, .quick-access-panel, .filter-popover-menu, .suggest-section { border:2px solid var(--ink); border-radius:8px; box-shadow:5px 5px 0 var(--neo-shadow-color); }
        .directory-masthead, .directory-search-strip, .directory-filter-panel, .directory-recent-strip, .directory-suggestion { background:var(--surface-elevated); }
        .directory-resource-card:hover, .resource-card:hover, .metric-card:hover, .spotlight-card:hover { transform:translate(3px,3px); border-color:var(--ink); box-shadow:2px 2px 0 var(--neo-shadow-color); }
        .directory-preview-frame { border-bottom:2px solid var(--ink); border-radius:8px; }
        .directory-search-field, .directory-filter-trigger, .directory-filter-menu, .directory-recent-menu, .directory-filter-chip, .directory-view-toggle, .directory-suggestion-form input, .directory-suggestion-form textarea, .field input, .field textarea, .hero-search, .filter-trigger, .filter-popover-menu, .filter-option-button, .quick-access-chip, .filter-pill { border:2px solid var(--ink); border-radius:8px; box-shadow:3px 3px 0 var(--neo-shadow-color); }
        .directory-search-field:focus-within, .directory-suggestion-form input:focus, .directory-suggestion-form textarea:focus, .field input:focus-visible, .field textarea:focus-visible, .directory-search-field input:focus-visible { border-color:var(--ink); box-shadow:3px 3px 0 var(--neo-shadow-color), 0 0 0 3px var(--focus); }
        .directory-filter-trigger:hover, .directory-filter-control.is-open .directory-filter-trigger, .filter-trigger:hover, .filter-popover.is-open .filter-trigger { border-color:var(--ink); background:var(--accent-fill); color:var(--accent-ink); box-shadow:3px 3px 0 var(--neo-shadow-color); }
        .directory-filter-menu button:hover, .directory-filter-menu button.is-selected, .filter-option-button:hover, .filter-option-button.is-selected, .quick-access-chip:hover, .quick-access-chip.selected, .filter-pill:hover, .filter-pill.selected { border-color:var(--ink); color:var(--accent-ink); background:var(--accent-fill); }
        .directory-card-tags span, .directory-new-badge, .directory-filter-chip, .directory-filter-count, .hero-search-kbd { border:2px solid var(--ink); border-radius:8px; }
        .directory-card-tags span { color:var(--ink); background:var(--surface-soft); }
        .directory-view-toggle button.is-active, .view-toggle button.active { border:2px solid var(--ink); color:var(--accent-ink); background:var(--accent-fill); box-shadow:2px 2px 0 var(--neo-shadow-color); }
        .directory-copy-button:hover, .directory-copy-button.is-copied { color:var(--accent-ink); border-color:var(--ink); background:var(--accent-fill); }
        .directory-suggestion-icon, .suggest-icon, .empty-symbol { border:2px solid var(--ink); border-radius:8px; color:var(--accent-ink); background:var(--accent-fill); box-shadow:3px 3px 0 var(--neo-shadow-color); }
        .directory-primary-button, .button-primary { color:var(--accent-ink); background:var(--accent-fill); }
        .directory-secondary-button, .button-secondary, .button-ghost { color:var(--ink); background:var(--surface); }
        .directory-visit-action:hover { color:var(--accent); text-decoration:underline; text-decoration-thickness:2px; text-underline-offset:3px; }
        .vengeance-cta { border:2px solid var(--landing-fg); border-radius:8px; box-shadow:5px 5px 0 var(--landing-fg); }
        .vengeance-cta:hover { transform:translate(3px,3px); box-shadow:2px 2px 0 var(--landing-fg); }
        .hero-search { border-color:var(--landing-fg); border-radius:8px; box-shadow:4px 4px 0 var(--landing-fg); backdrop-filter:none; }
        /* Reference-inspired finish: editorial labels, framed artifacts, tactile actions, and visible keyboard states. */
        .site-header { border-bottom:2px solid var(--ink); }
        .header-inner { min-height:68px; }
        .header-actions { margin-left:auto; }
        .header-nav button, .github-link, .theme-switch { min-height:40px; }
        .header-nav button:focus-visible, .github-link:focus-visible, .theme-switch:focus-visible, .button:focus-visible, .directory-primary-button:focus-visible, .directory-secondary-button:focus-visible, .directory-reset-button:focus-visible, .directory-recent-button:focus-visible, .directory-copy-button:focus-visible, .directory-suggestion-trigger:focus-visible, .directory-view-toggle button:focus-visible, .directory-filter-trigger:focus-visible, .directory-filter-menu button:focus-visible, .directory-recent-menu a:focus-visible, .directory-search-clear:focus-visible { outline:3px solid var(--focus); outline-offset:3px; }
        .vengeance-kicker, .directory-eyebrow { display:inline-flex; align-items:center; width:max-content; min-height:22px; margin-bottom:12px; padding:3px 8px; border:2px solid var(--ink); border-radius:5px; color:var(--accent-ink); background:var(--accent-fill); box-shadow:3px 3px 0 var(--neo-shadow-color); }
        .vengeance-kicker { color:var(--accent-ink); }
        .directory-eyebrow { color:var(--accent-ink); }
        .directory-masthead h1, .directory-results-head h2 { text-wrap:balance; }
        .directory-gallery-nav { display:flex; align-items:center; gap:14px; margin:16px 0 2px; padding:10px 12px; border:2px solid var(--ink); border-radius:8px; background:var(--surface-elevated); box-shadow:4px 4px 0 var(--neo-shadow-color); }
        .directory-gallery-nav > .directory-eyebrow { flex:0 0 auto; margin:0; box-shadow:none; }
        .directory-gallery-nav-list { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); flex:1; gap:6px; min-width:0; }
        .directory-gallery-nav-list button { display:flex; align-items:center; justify-content:space-between; min-width:0; min-height:38px; gap:7px; padding:0 9px; border:2px solid transparent; border-radius:6px; color:var(--muted); background:transparent; font-size:10px; font-weight:900; text-align:left; cursor:pointer; }
        .directory-gallery-nav-list button span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .directory-gallery-nav-list button:hover, .directory-gallery-nav-list button.is-active { border-color:var(--ink); color:var(--accent-ink); background:var(--accent-fill); box-shadow:2px 2px 0 var(--neo-shadow-color); }
        .directory-gallery-nav-list button:active { transform:translate(2px,2px); box-shadow:none; }
        .directory-card-grid { align-items:stretch; }
        .directory-resource-card { display:flex; flex-direction:column; }
        .directory-card-body { display:flex; flex:1; flex-direction:column; }
        .directory-card-actions { margin-top:auto; }
        .directory-preview-toolbar > span, .directory-copy-button { border-width:2px; border-radius:8px; box-shadow:3px 3px 0 rgba(0,0,0,.85); }
        .directory-preview-toolbar > span { background:rgba(8,12,18,.82); }
        .directory-copy-button:active { box-shadow:none; transform:translate(3px,3px); }
        .directory-filter-menu button:hover, .directory-filter-menu button.is-selected, .directory-recent-menu a:hover { box-shadow:2px 2px 0 var(--neo-shadow-color); }
        .directory-suggestion-trigger:hover { background:var(--surface-soft); }
        .directory-suggestion-trigger:hover .directory-suggestion-icon { transform:translate(2px,2px); box-shadow:1px 1px 0 var(--neo-shadow-color); }
        @media (max-width:1060px) { .header-nav { display:flex; flex:1 1 auto; min-width:0; margin-left:0; overflow-x:auto; scrollbar-width:none; } .header-nav::-webkit-scrollbar { display:none; } .header-nav button { flex:1 1 auto; min-width:0; min-height:40px; padding:0 8px; } .mobile-menu-toggle, .mobile-nav { display:none !important; } }
        @media (max-width:700px) { .header-inner { gap:8px; padding-left:12px; padding-right:12px; } .header-nav { gap:2px; } .header-nav button { flex:1 1 0; min-width:38px; min-height:40px; padding:0 4px; font-size:0; gap:0; } .header-nav button svg { width:16px; height:16px; } .header-actions { gap:4px; } .header-actions .button-primary { width:44px; min-width:44px; padding:0; gap:0; font-size:0; } .header-actions .button-primary svg { margin:0; } .directory-gallery-nav { align-items:flex-start; flex-direction:column; gap:6px; margin-top:12px; padding:10px; } .directory-gallery-nav-list { display:flex; width:100%; overflow-x:auto; scrollbar-width:none; } .directory-gallery-nav-list::-webkit-scrollbar { display:none; } .directory-gallery-nav-list button { flex:0 0 auto; min-width:150px; } }
        @media (prefers-reduced-motion:reduce) { *, *::before, *::after { scroll-behavior:auto !important; transition-duration:.01ms !important; animation-duration:.01ms !important; } }
      `}</style>

      <header className={`site-header ${isDirectory ? "directory-header" : ""}`}>
        <div className="header-inner">
          <button type="button" className="brand-lockup" onClick={() => navigateTo("/")} aria-label="Go to the Design Garage home page">
            <span className="brand-symbol"><Icon name="garage" size={18} strokeWidth={2.1} /></span>
            <span><span className="brand-name">DESIGN GARAGE</span><span className="brand-caption">Interface resources and frontend tools</span></span>
          </button>
          <div className="header-actions">
            <a className="github-link" href="https://github.com/sugumaran-nix" target="_blank" rel="noopener noreferrer" aria-label="Open the project on GitHub" title="Open project GitHub profile"><Icon name="github" size={17} /></a>
            <ThemeToggle theme={theme} onToggle={() => setTheme(current => current === "light" ? "dark" : "light")} />
            <button type="button" className="button button-primary" onClick={handleSuggest} aria-label="Suggest a resource"><Icon name="send" size={13} /> Suggest</button>
          </div>
        </div>
      </header>

      <main className={`app-main ${isDirectory ? "directory-main" : "vengeance-main"}`}>
        {!isDirectory && <VengeanceLanding onNavigate={navigateTo} />}

        {isDirectory && <DirectoryView categories={CATEGORIES} counts={counts} activeCategory={activeCategory} setActiveCategory={setActiveCategory} stacks={STACK_FILTERS} stackFilter={stackFilter} setStackFilter={setStackFilter} sortBy={sortBy} setSortBy={setSortBy} sortOptions={SORT_OPTIONS} clearFilters={clearFilters} hasActiveFilters={activeFilterCount > 0} activeFilterCount={activeFilterCount} resultCount={filteredResources.length} categoryLabel={categoryLabel} recent={recent} onVisit={handleVisit} viewMode={viewMode} setViewMode={setViewMode} query={query} setQuery={setQuery} searchRef={searchRef} filteredResources={filteredResources} libStacks={LIB_STACKS} newIds={NEW_IDS} categoryResolver={CAT_RESOLVE} categoryColors={CAT_COLOR} copiedId={copiedId} onCopy={copyUrl} setSuggestOpen={setSuggestOpen} suggestOpen={suggestOpen} suggested={suggested} suggestion={suggestion} setSuggestion={setSuggestion} sendSuggestion={sendSuggestion} verifiedDate={VERIFIED_DATE} />}
      </main>

    </div>
  );
}
