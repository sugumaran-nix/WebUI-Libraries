import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./components/Icon";
import ResourceCard from "./components/ResourceCard";
import FilterPanel from "./components/FilterPanel";
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
  return window.location.pathname === "/directory" ? "/directory" : "/";
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
    { name: "shadcn/ui", url: "https://ui.shadcn.com", image: "https://image.thum.io/get/width/900/crop/560/noanimate/https://ui.shadcn.com" },
    { name: "Godly", url: "https://godly.design", image: "https://image.thum.io/get/width/900/crop/560/noanimate/https://godly.design" },
    { name: "Refero", url: "https://refero.design", image: "https://image.thum.io/get/width/900/crop/560/noanimate/https://refero.design" },
    { name: "Mobbin", url: "https://mobbin.com", image: "https://image.thum.io/get/width/900/crop/560/noanimate/https://mobbin.com" },
    { name: "SaaSFrame", url: "https://www.saasframe.io", image: "https://image.thum.io/get/width/900/crop/560/noanimate/https://www.saasframe.io" },
    { name: "Linear", url: "https://linear.app", image: "https://image.thum.io/get/width/900/crop/560/noanimate/https://linear.app" },
    { name: "Tailwind CSS", url: "https://tailwindcss.com", image: "https://image.thum.io/get/width/900/crop/560/noanimate/https://tailwindcss.com" },
    { name: "Awwwards", url: "https://www.awwwards.com", image: "https://image.thum.io/get/width/900/crop/560/noanimate/https://www.awwwards.com" },
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
        <span className="landing-status"><Icon name="compass" size={12} /> Open-source design resource directory</span>
        <div className="vengeance-toplinks"><button type="button" onClick={() => onNavigate("/directory")}><Icon name="library" size={12} /> Directory</button><button type="button" onClick={() => { onNavigate("/directory"); }}><Icon name="compass" size={12} /> Inspiration</button><a href="https://github.com/sugumaran-nix/WebUI-Libraries" target="_blank" rel="noopener noreferrer"><Icon name="github" size={12} /> GitHub</a></div>
      </div>
      <div className="vengeance-marquee"><div className="vengeance-marquee-track">{marqueeTiles.map((tile, index) => <a className="vengeance-tile" key={`${tile.url}-${index}`} href={tile.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${tile.name} website`}><img src={tile.image} alt={`${tile.name} website preview`} loading="lazy" /></a>)}</div></div>
      <div className="vengeance-content">
        <div className="vengeance-kicker">DESIGN SYSTEMS · INTERFACE PATTERNS · UI TOOLS</div>
        <h1 id="vengeance-title">UI Resource Library</h1>
        <div className="vengeance-intro">
          <div className="vengeance-subtitle"><span>RESEARCH WITH PRECISION</span><span>BUILD WITH CONFIDENCE</span></div>
          <div className="vengeance-copy"><p>A practical reference for design systems, interface patterns, and frontend tools.</p><p>Compare {LIBS.length} live resources, filter by category or technology, and select the right tools for your next project.</p></div>
        </div>
        <button type="button" className="vengeance-cta" onClick={() => onNavigate("/directory")}>Browse the directory <Icon name="arrowRight" size={15} /></button>
      </div>
      <p className="vengeance-footer">A clear reference for selecting reliable UI resources, design references, and development tools.</p>
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
      document.title = "UI Resource Library — Web Design and Development Resources";
      return;
    }
    const titleParts = [];
    if (activeCategory !== "all") titleParts.push(CATEGORIES.find(item => item.id === activeCategory)?.label || activeCategory);
    if (stackFilter !== "all") titleParts.push(stackFilter);
    if (query) titleParts.push(`“${query}”`);
    document.title = titleParts.length ? `${titleParts.join(" · ")} — UI Resource Library` : "Resource Directory — UI Resource Library";
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
    navigator.clipboard?.writeText(`https://${resource.url}`).then(() => {
      setCopiedId(resource.id);
      setTimeout(() => setCopiedId(null), 1600);
    });
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
        :root { --paper:#F5F6F7; --surface:rgba(255,255,255,.96); --surface-soft:rgba(235,239,244,.82); --surface-elevated:#FFFFFF; --ink:#1A1A1A; --muted:#4A4A4A; --line:rgba(26,26,26,.15); --accent:#1C69D4; --violet:#0E55B7; --pink:#1C69D4; --lime:#DDEBFA; --cyan:#8FB6E6; --on-accent:#FFFFFF; --on-soft:#1A1A1A; --shadow:0 20px 55px rgba(26,26,26,.14); --radius:12px; --ease:cubic-bezier(.23,1,.32,1); --font-display:"DM Serif Display", Georgia, serif; --font-sans:"DM Sans", Inter, ui-sans-serif, system-ui, sans-serif; }
        .theme-dark { --paper:#0A0B0D; --surface:rgba(20,22,25,.94); --surface-soft:rgba(255,255,255,.08); --surface-elevated:rgba(25,28,33,.98); --ink:#FFFFFF; --muted:#B8BEC7; --line:rgba(255,255,255,.18); --accent:#4C91E8; --violet:#1C69D4; --pink:#4C91E8; --lime:#16304F; --cyan:#9BC7F5; --on-accent:#FFFFFF; --on-soft:#FFFFFF; --shadow:0 24px 70px rgba(0,0,0,.5); }
        * { box-sizing:border-box; }
        body { margin:0; overflow-x:hidden; background:var(--paper); font-family:var(--font-sans); font-size:15px; text-rendering:optimizeLegibility; -webkit-font-smoothing:antialiased; }
        button, input, select, textarea { font:inherit; }
        button, a { -webkit-tap-highlight-color:transparent; }
        button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline:3px solid var(--lime); outline-offset:3px; }
        .app-shell { min-height:100vh; overflow:visible; color:var(--ink); background:var(--paper); transition:background .28s var(--ease), color .28s var(--ease); }
        .app-shell::before { content:""; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.16; background-image:radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--cyan) 18%,transparent),transparent 25%),radial-gradient(circle at 88% 15%,color-mix(in srgb,var(--pink) 12%,transparent),transparent 24%),linear-gradient(color-mix(in srgb,var(--ink) 4%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--ink) 4%,transparent) 1px,transparent 1px); background-size:auto,auto,44px 44px,44px 44px; }
        .theme-dark::before { opacity:.2; background-image:radial-gradient(circle at 15% 10%,rgba(61,139,255,.18),transparent 28%),radial-gradient(circle at 86% 15%,rgba(255,59,48,.13),transparent 26%),linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px); background-size:auto,auto,44px 44px,44px 44px; }
        .app-shell > * { position:relative; z-index:1; }
        .site-header { position:fixed; inset:0 0 auto; z-index:80; border-bottom:1px solid var(--line); background:color-mix(in srgb,var(--surface-elevated) 82%,transparent); box-shadow:0 10px 30px color-mix(in srgb,var(--ink) 7%,transparent); backdrop-filter:saturate(150%) blur(22px); -webkit-backdrop-filter:saturate(150%) blur(22px); }
        .directory-header { position:fixed; inset:0 0 auto; z-index:80; }
        .header-inner { display:flex; align-items:center; gap:1rem; width:min(1440px,100%); min-height:72px; margin:0 auto; padding:0 28px; }
        .brand-lockup { display:flex; align-items:center; gap:.7rem; min-width:220px; padding:0; border:0; color:var(--ink); background:transparent; text-align:left; cursor:pointer; }
        .brand-symbol { display:grid; place-items:center; width:36px; height:36px; border:1px solid color-mix(in srgb,var(--accent) 22%,transparent); border-radius:11px; color:var(--ink); background:linear-gradient(135deg,var(--lime),color-mix(in srgb,var(--cyan) 40%,var(--surface))); box-shadow:0 8px 18px color-mix(in srgb,var(--accent) 14%,transparent); }
        .brand-name { font-size:12px; font-weight:900; letter-spacing:.15em; line-height:1; }
        .brand-caption { display:block; margin-top:5px; color:var(--muted); font-size:10px; font-weight:600; } .brand-lockup:hover { transform:none; }
        .header-nav { display:flex; align-items:center; gap:.2rem; margin-left:auto; }
        .header-nav button, .theme-switch { border:0; background:transparent; color:var(--muted); cursor:pointer; transition:all .18s var(--ease); } .header-nav button, .github-link { display:inline-flex; align-items:center; gap:6px; }
        .header-nav button { padding:.55rem .7rem; border-radius:9px; font-size:11px; font-weight:800; }
        .header-nav button:hover, .github-link:hover { color:var(--ink); background:var(--surface-soft); }
        .header-actions { display:flex; align-items:center; gap:.35rem; }
        .theme-switch { display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; padding:0; border:1px solid var(--line); border-radius:10px; background:var(--surface); font-size:10px; font-weight:800; backdrop-filter:blur(14px); }
        .theme-switch:hover { color:var(--ink); background:var(--surface-soft); transform:translateY(-1px); }
        .theme-switch-icon { display:grid; place-items:center; width:22px; height:22px; border-radius:7px; color:var(--accent); background:var(--lime); }
        .button { display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:44px; border:1px solid transparent; border-radius:10px; padding:0 .8rem; cursor:pointer; font-size:11px; font-weight:800; transition:all .18s var(--ease); }
        .button:hover { transform:translateY(-2px); }
        .button-primary { color:var(--on-accent); background:var(--accent); box-shadow:0 10px 24px color-mix(in srgb,var(--accent) 24%,transparent); }
        .button-secondary { color:var(--ink); border-color:var(--line); background:var(--surface); backdrop-filter:blur(14px); }
        .button-ghost { color:var(--muted); background:transparent; }
        .icon-button { display:grid; place-items:center; width:40px; height:40px; padding:0; border:1px solid var(--line); border-radius:10px; color:var(--muted); background:var(--surface); cursor:pointer; transition:all .18s var(--ease); backdrop-filter:blur(14px); }
        .icon-button:hover { color:var(--ink); background:var(--surface-soft); transform:translateY(-2px); }
        .icon-button.is-copied { color:var(--on-soft); border-color:var(--lime); background:var(--lime); }
        .app-main { width:min(1440px,100%); margin:0 auto; padding:30px 28px 80px; } .github-link { display:grid; place-items:center; width:34px; height:34px; padding:0; color:var(--muted); text-decoration:none; } .github-link svg { flex:0 0 auto; } .github-link:hover { color:var(--ink); background:var(--surface-soft); transform:translateY(-1px); }
        .vengeance-main { width:100%; max-width:none; margin:0; padding:72px 0 0; }
        .vengeance-landing { position:relative; min-height:calc(100vh - 72px); overflow:hidden; isolation:isolate; color:var(--landing-fg); background:var(--landing-bg); --landing-bg:#FFFFFF; --landing-fg:#1A1A1A; --landing-accent:#1C69D4; --landing-cool:#1C69D4; --pointer-x:50%; --pointer-y:50%; } .theme-dark .vengeance-landing { --landing-bg:#0A0B0D; --landing-fg:#FFFFFF; --landing-accent:#4C91E8; --landing-cool:#4C91E8; }
        .vengeance-landing::before { content:""; position:absolute; inset:0; z-index:-2; opacity:.6; background-image:linear-gradient(color-mix(in srgb,var(--landing-fg) 8%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--landing-fg) 8%,transparent) 1px,transparent 1px); background-size:44px 44px; mask-image:linear-gradient(180deg,rgba(0,0,0,.8),transparent 85%); }
        .vengeance-glow { position:absolute; inset:0; z-index:-1; pointer-events:none; background:radial-gradient(circle at var(--pointer-x) var(--pointer-y),color-mix(in srgb,var(--landing-cool) 25%,transparent),transparent 29%),radial-gradient(circle at 72% 18%,color-mix(in srgb,var(--landing-accent) 18%,transparent),transparent 34%),linear-gradient(120deg,transparent 45%,color-mix(in srgb,var(--landing-cool) 5%,transparent)); transition:background .25s var(--ease); }
        .vengeance-topline { position:absolute; top:24px; left:clamp(22px,5vw,72px); right:clamp(22px,5vw,72px); z-index:5; display:flex; align-items:center; justify-content:space-between; gap:18px; color:color-mix(in srgb,var(--landing-fg) 68%,transparent); font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .vengeance-topline a, .vengeance-toplinks button, .vengeance-toplinks a { display:inline-flex; align-items:center; gap:6px; color:inherit; text-decoration:none; transition:color .18s var(--ease); } .landing-status { display:inline-flex; align-items:center; gap:6px; }
        .vengeance-topline a:hover, .vengeance-toplinks button:hover, .vengeance-toplinks a:hover { color:var(--landing-fg); }
        .vengeance-toplinks { display:flex; align-items:center; gap:18px; }
        .vengeance-toplinks button { padding:0; border:0; background:transparent; font-size:inherit; font-weight:inherit; letter-spacing:inherit; text-transform:inherit; cursor:pointer; }
        .vengeance-marquee { position:absolute; top:0; left:0; right:0; z-index:2; height:min(48vh,420px); overflow:hidden; opacity:.42; pointer-events:none; mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,.88) 48%,transparent 100%); }
        .vengeance-marquee-track { display:flex; align-items:flex-start; gap:16px; width:max-content; height:100%; padding:34px 0 28px; animation:vengeance-marquee 34s linear infinite; }
        .vengeance-tile { display:block; width:clamp(280px,34vw,520px); height:auto; align-self:flex-start; aspect-ratio:16/9; flex:0 0 auto; overflow:hidden; pointer-events:auto; border:1px solid color-mix(in srgb,var(--landing-fg) 18%,transparent); border-radius:10px; background:color-mix(in srgb,var(--landing-fg) 8%,var(--landing-bg)); box-shadow:0 18px 38px color-mix(in srgb,var(--landing-fg) 16%,transparent); filter:saturate(.82) contrast(1.04); }
        .vengeance-tile img { display:block; width:100%; height:100%; object-fit:cover; }
        @keyframes vengeance-marquee { from { transform:translateX(0); } to { transform:translateX(calc(-50% - 8px)); } }
        @media (prefers-reduced-motion: reduce) { .vengeance-marquee-track { animation:none; } .app-shell, .app-shell * { scroll-behavior:auto !important; transition-duration:0.01ms !important; animation-duration:0.01ms !important; animation-iteration-count:1 !important; } .button:hover, .icon-button:hover, .theme-switch:hover { transform:none; } }
        .vengeance-content { position:relative; z-index:3; display:flex; pointer-events:none; flex-direction:column; justify-content:center; width:min(1280px,100%); min-height:calc(100vh - 72px); margin:0 auto; padding:clamp(100px,14vh,160px) clamp(22px,6vw,92px) 130px; }
        .vengeance-content > * { pointer-events:auto; }
        .vengeance-kicker { align-self:flex-start; margin-bottom:18px; color:var(--landing-cool); font-size:10px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; }
        .vengeance-content h1 { margin:0; font-family:Georgia,'Times New Roman',serif; font-size:clamp(5rem,17vw,14rem); font-weight:400; line-height:.78; letter-spacing:-.1em; color:var(--landing-fg); }
        .vengeance-intro { display:grid; grid-template-columns:minmax(170px,.35fr) minmax(0,1fr); gap:clamp(28px,7vw,105px); max-width:820px; margin-top:clamp(58px,9vh,100px); padding-left:clamp(0px,8vw,125px); }
        .vengeance-subtitle { display:flex; flex-direction:column; gap:2px; color:var(--landing-accent); font-size:clamp(18px,2.7vw,31px); font-weight:700; line-height:1.03; letter-spacing:-.05em; }
        .vengeance-copy { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:clamp(18px,4vw,58px); color:color-mix(in srgb,var(--landing-fg) 70%,transparent); font-size:11px; line-height:1.7; }
        .vengeance-copy p { margin:0; }
        .vengeance-cta { display:inline-flex; align-items:center; gap:8px; align-self:flex-start; margin-top:34px; padding:11px 15px; border:1px solid color-mix(in srgb,var(--landing-cool) 60%,transparent); border-radius:10px; color:var(--on-accent); background:var(--landing-cool); box-shadow:0 12px 28px color-mix(in srgb,var(--landing-cool) 22%,transparent); font-size:10px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; transition:transform .18s var(--ease),background .18s var(--ease); }
        .vengeance-cta:hover { transform:translateY(-2px); background:var(--landing-fg); }
        .vengeance-footer { position:absolute; right:clamp(22px,5vw,72px); bottom:22px; left:clamp(22px,5vw,72px); max-width:620px; margin:0 auto; color:color-mix(in srgb,var(--landing-fg) 48%,transparent); font-size:9px; line-height:1.65; text-align:center; }
        @media (max-width:820px) { .vengeance-topline { align-items:flex-start; flex-direction:column; gap:10px; } .vengeance-toplinks { gap:12px; } .vengeance-content { padding-top:150px; } .vengeance-intro { grid-template-columns:1fr; gap:22px; padding-left:0; } .vengeance-subtitle { flex-direction:row; gap:10px; font-size:21px; } .vengeance-copy { grid-template-columns:1fr; gap:12px; } .vengeance-footer { position:relative; right:auto; bottom:auto; left:auto; padding:0 22px 24px; } }
        @media (max-width:560px) { .vengeance-landing { min-height:calc(100vh - 64px); } .vengeance-content { min-height:calc(100vh - 64px); padding-top:142px; } .vengeance-content h1 { font-size:clamp(4.5rem,22vw,8rem); } .vengeance-marquee { height:36vh; } .vengeance-tile { width:calc(100vw - 32px); max-width:520px; aspect-ratio:16/9; } .vengeance-topline { top:16px; font-size:8px; } .vengeance-kicker { font-size:8px; } }
        .welcome-grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr); gap:24px; min-height:390px; padding:clamp(26px,5vw,62px); overflow:hidden; border-radius:32px; color:#FFF; background:linear-gradient(125deg,#0B3D91 0%,#0066B3 48%,#5CA8E6 100%); box-shadow:0 30px 80px rgba(0,43,84,.28); }
        .welcome-copy { align-self:center; max-width:680px; }
        .eyebrow { color:var(--lime); font-size:10px; font-weight:900; letter-spacing:.17em; text-transform:uppercase; }
        .welcome-title { max-width:680px; margin:18px 0 16px; font-family:Georgia,'Times New Roman',serif; font-size:clamp(3.3rem,8vw,7.2rem); font-weight:400; letter-spacing:-.075em; line-height:.86; }
        .welcome-title em { color:var(--lime); font-style:normal; }
        .welcome-copy p { max-width:600px; margin:0; color:rgba(255,255,255,.78); font-size:15px; line-height:1.65; }
        .hero-search { display:flex; align-items:center; gap:.65rem; max-width:620px; margin-top:28px; padding:.5rem .55rem .5rem .85rem; border:1px solid rgba(255,255,255,.22); border-radius:14px; background:rgba(255,255,255,.12); box-shadow:0 12px 30px rgba(0,0,0,.12); backdrop-filter:blur(14px); }
        .hero-search svg { flex-shrink:0; color:var(--lime); }
        .hero-search input { flex:1; min-width:0; border:0; outline:0; color:#FFF; background:transparent; font-size:13px; }
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
        .quick-access-chip { display:flex; align-items:center; width:100%; min-height:28px; padding:0 8px; border:0; border-radius:0; color:var(--ink); background:var(--surface); font-size:10px; font-weight:800; text-align:left; cursor:pointer; transition:all .18s var(--ease); }
        .quick-access-chip:hover, .quick-access-chip.selected { color:var(--on-soft); background:var(--lime); }
        .recent-trigger { color:var(--ink); }
        .recent-menu { width:270px; min-width:270px; }
        .recent-menu-heading { display:flex; align-items:baseline; justify-content:space-between; gap:10px; padding:3px 5px 7px; border-bottom:0; }
        .recent-menu-heading strong { color:var(--ink); font-size:11px; }
        .recent-menu-heading span { color:var(--muted); font-size:9px; }
        .recent-popover-card { display:flex; align-items:center; gap:8px; padding:7px 5px; border-radius:0; color:var(--ink); text-decoration:none; }
        .recent-popover-card:hover { background:var(--surface-soft); }
        .recent-popover-card > span:nth-child(2) { display:grid; min-width:0; flex:1; }
        .recent-popover-card strong { overflow:hidden; font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
        .recent-popover-card small { overflow:hidden; margin-top:2px; color:var(--muted); font-size:8px; text-overflow:ellipsis; white-space:nowrap; }
        .recent-popover-card > svg { flex:0 0 auto; color:var(--muted); }
        .recent-popover-orbit { display:grid; place-items:center; flex:0 0 auto; width:24px; height:24px; border:0; border-radius:0; color:var(--violet); background:var(--surface-soft); font-size:10px; font-weight:900; }
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
        .view-toggle { display:flex; gap:2px; padding:0; border:0; border-radius:0; background:var(--surface); }
        .view-toggle button { display:grid; place-items:center; width:30px; height:30px; border:0; border-radius:0; color:var(--muted); background:transparent; cursor:pointer; }
        .view-toggle button.active { color:var(--on-soft); background:var(--lime); }
        .active-filters { display:flex; flex-wrap:wrap; gap:6px; margin:14px 0; }
        .active-filter { display:inline-flex; align-items:center; gap:5px; padding:6px 9px; border-radius:0; color:var(--ink); background:var(--surface-soft); font-size:10px; font-weight:800; }
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
        .preview-initials { display:grid; place-items:center; width:42px; height:42px; border:1px solid color-mix(in srgb,var(--accent) 45%,transparent); border-radius:0; color:var(--accent); background:var(--lime); font-size:12px; font-weight:900; }
        .resource-card-link { display:flex; flex:1; flex-direction:column; color:var(--ink); text-decoration:none; }
        .resource-card-link:focus-visible { outline:3px solid color-mix(in srgb,var(--accent) 55%,transparent); outline-offset:-3px; }
        .resource-card-copy { display:flex; flex:1; flex-direction:column; padding:11px 14px 12px; }
        .resource-category-line { display:flex; align-items:center; gap:7px; min-height:15px; }
        .resource-category { color:var(--card-accent); font-size:8px; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
        .resource-card h3 { display:flex; align-items:center; justify-content:space-between; gap:10px; margin:5px 0 5px; font-size:17px; line-height:1.08; letter-spacing:-.05em; }
        .resource-card h3 svg { flex-shrink:0; opacity:.48; transition:transform .18s var(--ease); }
        .resource-card:hover h3 svg { transform:translate(3px,-3px); opacity:1; }
        .resource-card p { min-height:34px; margin:0; color:var(--muted); font-size:10px; line-height:1.45; }
        .resource-card mark { padding:0 2px; border-radius:3px; color:var(--ink); background:var(--lime); }
        .new-badge { padding:2px 5px; border-radius:0; color:var(--ink); background:var(--lime); font-size:7px; font-weight:900; letter-spacing:.05em; text-transform:uppercase; }
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
        .field input, .field textarea { width:100%; border:1px solid var(--line); border-radius:10px; padding:10px; outline:0; color:var(--ink); background:var(--surface); font-size:11px; }
        .field textarea { min-height:80px; resize:vertical; }
        .suggest-form-footer { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
        .suggest-form-footer p { margin:0; color:var(--muted); font-size:10px; }
        .app-footer { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:24px 0 0; color:var(--muted); font-size:10px; }
        @media (max-width:1060px) { .header-nav { display:none; } .directory-main { padding-top:calc(64px + 16px + 60px); } .quick-access-panel { top:80px; left:18px; width:calc(100% - 36px); } .results-area { width:100%; } }
        @media (max-width:820px) { .header-inner, .app-main { padding-left:18px; padding-right:18px; } .header-inner { min-height:64px; } .brand-lockup { min-width:auto; } .brand-caption { display:none; } .header-actions { margin-left:auto; } .theme-switch-label { display:none; } .welcome-grid { grid-template-columns:1fr; min-height:auto; padding:28px 22px 18px; } .hero-orbit { min-height:185px; } .hero-orbit-card.one { left:3%; } .hero-orbit-card.two { right:4%; } .metric-grid { grid-template-columns:repeat(2,1fr); } .spotlight-grid { grid-template-columns:1fr; } .resource-grid, .resource-grid.list-view { grid-template-columns:1fr; gap:16px; } }
        @media (max-width:700px) { .view-toggle { display:none; } .resource-grid, .resource-grid.list-view { grid-template-columns:1fr; } }
        @media (max-width:560px) { .app-main { padding-top:16px; } .header-nav button, .github-link { min-height:44px; min-width:44px; } .resource-card p { font-size:12px; line-height:1.55; } .resource-card-copy { padding:14px 16px 16px; } .vengeance-main { padding-top:64px; } .directory-main { padding-top:calc(64px + 12px + 60px); } .welcome-title { font-size:clamp(3.15rem,16vw,5rem); } .hero-search { margin-top:22px; } .hero-search-kbd { display:none; } .hero-search .button { min-width:38px; padding:0; } .metric-grid { gap:8px; margin-bottom:28px; } .metric-card { padding:12px; } .metric-card strong { font-size:24px; } .section-header { align-items:flex-start; flex-direction:column; gap:5px; } .spotlight-card { min-height:140px; } .landing-topics { padding:18px; } .landing-topic-grid { grid-template-columns:1fr; } .quick-access-panel { top:76px; left:18px; overflow-x:auto; overflow-y:visible; scrollbar-width:none; } .quick-access-panel::-webkit-scrollbar { display:none; } .quick-access-row { width:max-content; min-width:100%; } .quick-access-heading .quick-access-status { display:none; } .filter-row-summary { min-width:40px; } .filter-summary-rule { display:none; } .filter-summary-copy small { display:none; } .filter-actions .quick-access-status { display:none; } .filter-trigger { padding:0 7px; } .filter-popover-menu { position:fixed; top:132px; left:18px; max-width:calc(100vw - 36px); } .github-link span { display:none; } .brand-name { font-size:10px; letter-spacing:.09em; } .framework-menu { width:230px; } .recent-menu { width:270px; } .resource-grid { grid-template-columns:1fr; } .results-header { align-items:flex-start; flex-direction:column; } .results-actions { width:100%; justify-content:space-between; } .suggest-form-grid { grid-template-columns:1fr; } .app-footer { align-items:flex-start; flex-direction:column; } }
        @media (min-width:821px) { .resource-grid:not(.list-view) { grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); } }
        @media (max-width:700px) { .resource-grid, .resource-grid.list-view { gap:12px; } .resource-card { border-radius:14px; } .resource-preview { aspect-ratio:16/10; } .resource-card-copy { padding:12px; } .resource-card h3 { font-size:16px; line-height:1.12; } .resource-card p { min-height:0; font-size:11px; line-height:1.5; } .resource-preview-tools .icon-button { width:40px; height:40px; } .filter-trigger { min-height:40px; } }
        @media (max-width:560px) { .quick-access-panel { left:12px; width:calc(100% - 24px); padding:8px; } .quick-access-row { gap:8px; } .filter-control-group { gap:6px; } .filter-popover-menu { max-height:min(60vh,340px); } .filter-option-button, .quick-access-chip { min-height:40px; } .active-filter button { min-width:32px; min-height:32px; } }
        @media (prefers-reduced-motion:reduce) { *, *::before, *::after { scroll-behavior:auto !important; transition-duration:.01ms !important; animation-duration:.01ms !important; } }
      `}</style>

      <header className={`site-header ${isDirectory ? "directory-header" : ""}`}>
        <div className="header-inner">
          <button type="button" className="brand-lockup" onClick={() => navigateTo("/")} aria-label="Go to the UI Resource Library home page">
            <span className="brand-symbol"><Icon name="library" size={17} /></span>
            <span><span className="brand-name">UI / FOLIO</span><span className="brand-caption">Web design and development resources</span></span>
          </button>
          <nav className="header-nav" aria-label="Main navigation">
            <button type="button" aria-current={isDirectory ? "page" : undefined} onClick={() => navigateTo("/directory")}><Icon name="compass" size={13} /> Discover</button>
            <button type="button" aria-current={isDirectory && activeCategory === "inspiration" ? "page" : undefined} onClick={() => { setActiveCategory("inspiration"); navigateTo("/directory"); }}><Icon name="spark" size={13} /> Inspiration</button>
            <button type="button" aria-current={isDirectory && activeCategory === "react" ? "page" : undefined} onClick={() => { setActiveCategory("react"); navigateTo("/directory"); }}><Icon name="library" size={13} /> Libraries</button>
          </nav>
          <div className="header-actions">
            <a className="github-link" href="https://github.com/sugumaran-nix" target="_blank" rel="noopener noreferrer" aria-label="Open the project on GitHub" title="Open project GitHub profile"><Icon name="github" size={17} /></a>
            <ThemeToggle theme={theme} onToggle={() => setTheme(current => current === "light" ? "dark" : "light")} />
            <button type="button" className="button button-primary" onClick={() => setSuggestOpen(true)}><Icon name="send" size={13} /> Suggest</button>
          </div>
        </div>
      </header>

      <main className={`app-main ${isDirectory ? "directory-main" : "vengeance-main"}`}>
        {!isDirectory && <VengeanceLanding onNavigate={navigateTo} />}

        {isDirectory && <>
        <FilterPanel categories={CATEGORIES} counts={counts} activeCategory={activeCategory} setActiveCategory={setActiveCategory} stacks={STACK_FILTERS} stackFilter={stackFilter} setStackFilter={setStackFilter} sortBy={sortBy} setSortBy={setSortBy} sortOptions={SORT_OPTIONS} clearFilters={clearFilters} hasActiveFilters={activeFilterCount > 0} activeFilterCount={activeFilterCount} resultCount={filteredResources.length} categoryLabel={categoryLabel} recent={recent} onVisit={handleVisit} viewMode={viewMode} setViewMode={setViewMode} />
        <section className="workspace" id="results" aria-label="Resource directory">
          <div className="results-area">
            {activeFilterCount > 0 && <div className="active-filters" aria-label="Active filters">
              {query && <span className="active-filter">“{query}” <button type="button" onClick={() => setQuery("")} aria-label="Remove search filter"><Icon name="close" size={11} /></button></span>}
              {activeCategory !== "all" && <span className="active-filter">{categoryLabel} <button type="button" onClick={() => setActiveCategory("all")} aria-label="Remove category filter"><Icon name="close" size={11} /></button></span>}
              {stackFilter !== "all" && <span className="active-filter">{stackFilter} <button type="button" onClick={() => setStackFilter("all")} aria-label="Remove technology filter"><Icon name="close" size={11} /></button></span>}
              {sortBy !== "featured" && <span className="active-filter">{SORT_OPTIONS.find(option => option.id === sortBy)?.label} <button type="button" onClick={() => setSortBy("featured")} aria-label="Remove sort filter"><Icon name="close" size={11} /></button></span>}
            </div>}


            {filteredResources.length === 0 ? <EmptyState onClear={clearFilters} /> : <div className={`resource-grid ${viewMode === "list" ? "list-view" : ""}`}>{filteredResources.map(resource => <ResourceCard key={resource.id} lib={resource} categoryLabel={CATEGORIES.find(item => item.id === CAT_RESOLVE(resource.cat))?.label || resource.cat} stacks={LIB_STACKS[resource.id] || []} accent={CAT_COLOR[CAT_RESOLVE(resource.cat)] || "#0066B3"} isNew={NEW_IDS.has(resource.id)} isCopied={copiedId === resource.id} query={query} onCopy={copyUrl} onVisit={handleVisit} />)}</div>}
          </div>
        </section>

        <section className="suggest-section" aria-labelledby="suggest-title">
          <div className="suggest-head" onClick={() => setSuggestOpen(open => !open)} role="button" tabIndex={0} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") setSuggestOpen(open => !open); }}>
            <div className="suggest-title"><span className="suggest-icon"><Icon name="spark" size={17} /></span><div><strong id="suggest-title">Suggest a resource</strong><span>Send a resource link for review.</span></div></div><Icon name={suggestOpen ? "close" : "plus"} size={16} />
          </div>
          {suggestOpen && <div className="suggest-form">
            {suggested ? <div className="empty-state" style={{ minHeight: 150 }}><div className="empty-symbol"><Icon name="check" size={22} /></div><h3>Opening your email app.</h3><p>Thanks for helping improve the directory.</p></div> : <>
              <div className="suggest-form-grid"><div className="field"><label htmlFor="suggest-name">Resource name</label><input id="suggest-name" value={suggestion.name} onChange={event => setSuggestion({ ...suggestion, name: event.target.value })} placeholder="e.g. Acme UI" /></div><div className="field"><label htmlFor="suggest-url">URL</label><input id="suggest-url" value={suggestion.url} onChange={event => setSuggestion({ ...suggestion, url: event.target.value })} placeholder="acme-ui.com" /></div></div>
              <div className="field"><label htmlFor="suggest-note">Why is this resource useful?</label><textarea id="suggest-note" value={suggestion.note} onChange={event => setSuggestion({ ...suggestion, note: event.target.value })} placeholder="What makes this resource useful or distinctive?" /></div>
              <div className="suggest-form-footer"><p>Opens an email with your resource details pre-filled.</p><button type="button" className="button button-primary" disabled={!suggestion.name.trim() || !suggestion.url.trim()} onClick={sendSuggestion}>Submit resource <Icon name="arrowRight" size={14} /></button></div>
            </>}
          </div>}
        </section>

        <footer className="app-footer"><span>Reviewed · Updated {VERIFIED_DATE}</span><span>{filteredResources.length} of {LIBS.length} resources displayed</span></footer>
        </>}
      </main>

    </div>
  );
}
