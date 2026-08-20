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
  RECIPIENT,
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
      <span className="theme-switch-icon"><Icon name={theme === "light" ? "moon" : "sun"} size={15} /></span>
      <span className="theme-switch-label">{theme === "light" ? "Dark mode" : "Light mode"}</span>
    </button>
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
  const [copiedShare, setCopiedShare] = useState(false);
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
    document.body.style.background = theme === "dark" ? "#101126" : "#FFF8F0";
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
      document.title = "UI / FOLIO — Curated Interface Intelligence";
      return;
    }
    const titleParts = [];
    if (activeCategory !== "all") titleParts.push(CATEGORIES.find(item => item.id === activeCategory)?.label || activeCategory);
    if (stackFilter !== "all") titleParts.push(stackFilter);
    if (query) titleParts.push(`“${query}”`);
    document.title = titleParts.length ? `${titleParts.join(" · ")} — UI / FOLIO` : "Directory — UI / FOLIO";
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
      if (sortBy === "newest") return (right.added || "").localeCompare(left.added || "") || left.name.localeCompare(right.name);
      if (sortBy === "popular") return (POPULAR_RANK.get(left.id) ?? 999) - (POPULAR_RANK.get(right.id) ?? 999) || left.name.localeCompare(right.name);
      return 0;
    });
  }, [activeCategory, debouncedQuery, sortBy, stackFilter]);

  const categoryLabel = CATEGORIES.find(item => item.id === activeCategory)?.label || "All resources";
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
  const shareFilters = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 1800);
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
    const subject = encodeURIComponent(`UI / FOLIO suggestion: ${suggestion.name.trim()}`);
    const body = encodeURIComponent(`Name: ${suggestion.name.trim()}\nURL: ${cleanUrl}\n${suggestion.note.trim() ? `\nWhy it belongs: ${suggestion.note.trim()}` : ""}`);
    window.open(`mailto:${RECIPIENT}?subject=${subject}&body=${body}`, "_blank");
    setSuggested(true);
    setSuggestion({ name: "", url: "", note: "" });
    setTimeout(() => setSuggested(false), 2800);
  };

  return (
    <div className={`app-shell theme-${theme}`}>
      <style>{`
        :root { --paper:#E2E2E0; --surface:#F7F7F5; --surface-soft:#D7E5E3; --ink:#0E2931; --muted:#4E686B; --line:rgba(14,41,49,.16); --violet:#2B7574; --pink:#861211; --lime:#B9D8D5; --cyan:#12484C; --shadow:0 22px 55px rgba(14,41,49,.15); --radius:20px; --ease:cubic-bezier(.23,1,.32,1); --font-display:"DM Serif Display", Georgia, serif; --font-sans:"DM Sans", Inter, ui-sans-serif, system-ui, sans-serif; }
        .theme-dark { --paper:#0E2931; --surface:#12484C; --surface-soft:#18575A; --ink:#E2E2E0; --muted:#AFC8C6; --line:rgba(226,226,224,.17); --violet:#2B7574; --pink:#D85A51; --lime:#E2E2E0; --cyan:#6AA8A5; --shadow:0 24px 70px rgba(0,0,0,.3); }
        * { box-sizing:border-box; }
        body { margin:0; overflow-x:hidden; background:var(--paper); font-family:var(--font-sans); font-size:15px; text-rendering:optimizeLegibility; -webkit-font-smoothing:antialiased; }
        button, input, select, textarea { font:inherit; }
        button, a { -webkit-tap-highlight-color:transparent; }
        button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline:3px solid var(--lime); outline-offset:3px; }
        .app-shell { min-height:100vh; overflow:visible; color:var(--ink); background:var(--paper); transition:background .28s var(--ease), color .28s var(--ease); }
        .app-shell::before { content:""; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.2; background-image:linear-gradient(rgba(115,87,255,.04) 1px, transparent 1px),linear-gradient(90deg,rgba(115,87,255,.04) 1px,transparent 1px); background-size:36px 36px; }
        .theme-dark::before { opacity:.11; background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px); }
        .app-shell > * { position:relative; z-index:1; }
        .site-header { position:relative; z-index:40; border-bottom:1px solid var(--line); background:color-mix(in srgb, var(--paper) 84%, transparent); backdrop-filter:blur(18px); }
        .directory-header { position:fixed; inset:0 0 auto; z-index:80; }
        .header-inner { display:flex; align-items:center; gap:1rem; width:min(1440px,100%); min-height:72px; margin:0 auto; padding:0 28px; }
        .brand-lockup { display:flex; align-items:center; gap:.7rem; min-width:220px; }
        .brand-symbol { display:grid; place-items:center; width:36px; height:36px; border-radius:12px; color:var(--ink); background:linear-gradient(135deg,var(--lime),var(--cyan)); box-shadow:0 8px 22px rgba(67,217,232,.2); }
        .brand-name { font-size:12px; font-weight:900; letter-spacing:.15em; line-height:1; }
        .brand-caption { margin-top:5px; color:var(--muted); font-size:10px; font-weight:600; }
        .header-nav { display:flex; align-items:center; gap:.2rem; margin-left:auto; }
        .header-nav button, .theme-switch { border:0; background:transparent; color:var(--muted); cursor:pointer; transition:all .18s var(--ease); }
        .header-nav button { padding:.55rem .7rem; border-radius:9px; font-size:11px; font-weight:800; }
        .header-nav button:hover { color:var(--ink); background:var(--surface-soft); }
        .header-actions { display:flex; align-items:center; gap:.45rem; }
        .theme-switch { display:inline-flex; align-items:center; gap:.45rem; padding:.48rem .65rem; border:1px solid var(--line); border-radius:999px; background:var(--surface); font-size:10px; font-weight:800; }
        .theme-switch:hover { color:var(--ink); border-color:var(--violet); transform:translateY(-1px); }
        .theme-switch-icon { display:grid; place-items:center; width:22px; height:22px; border-radius:50%; color:var(--ink); background:var(--lime); }
        .button { display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:38px; border:1px solid transparent; border-radius:10px; padding:0 .8rem; cursor:pointer; font-size:11px; font-weight:800; transition:all .18s var(--ease); }
        .button:hover { transform:translateY(-2px); }
        .button-primary { color:#151126; background:var(--lime); box-shadow:0 9px 25px rgba(217,255,94,.18); }
        .button-secondary { color:var(--ink); border-color:var(--line); background:var(--surface); }
        .button-ghost { color:var(--muted); background:transparent; }
        .icon-button { display:grid; place-items:center; width:34px; height:34px; padding:0; border:1px solid var(--line); border-radius:10px; color:var(--muted); background:var(--surface); cursor:pointer; transition:all .18s var(--ease); }
        .icon-button:hover { color:var(--ink); border-color:var(--violet); transform:translateY(-2px); }
        .icon-button.is-copied { color:#173B19; border-color:var(--lime); background:var(--lime); }
        .app-main { width:min(1440px,100%); margin:0 auto; padding:30px 28px 80px; }
        .welcome-grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr); gap:24px; min-height:390px; padding:clamp(26px,5vw,62px); overflow:hidden; border-radius:32px; color:#FFF; background:linear-gradient(125deg,#6346F6 0%,#8C54F1 48%,#FF4D93 100%); box-shadow:0 30px 80px rgba(115,87,255,.28); }
        .welcome-copy { align-self:center; max-width:680px; }
        .eyebrow { color:var(--lime); font-size:10px; font-weight:900; letter-spacing:.17em; text-transform:uppercase; }
        .welcome-title { max-width:680px; margin:18px 0 16px; font-family:Georgia,'Times New Roman',serif; font-size:clamp(3.3rem,8vw,7.2rem); font-weight:400; letter-spacing:-.075em; line-height:.86; }
        .welcome-title em { color:var(--lime); font-style:normal; }
        .welcome-copy p { max-width:600px; margin:0; color:rgba(255,255,255,.78); font-size:15px; line-height:1.65; }
        .hero-search { display:flex; align-items:center; gap:.65rem; max-width:620px; margin-top:28px; padding:.5rem .55rem .5rem .85rem; border:1px solid rgba(255,255,255,.22); border-radius:14px; background:rgba(255,255,255,.12); box-shadow:0 12px 30px rgba(44,22,106,.12); backdrop-filter:blur(14px); }
        .hero-search svg { flex-shrink:0; color:var(--lime); }
        .hero-search input { flex:1; min-width:0; border:0; outline:0; color:#FFF; background:transparent; font-size:13px; }
        .hero-search input::placeholder { color:rgba(255,255,255,.62); }
        .hero-search-kbd { color:rgba(255,255,255,.66); font-size:10px; font-weight:800; white-space:nowrap; }
        .hero-orbit { position:relative; min-height:260px; align-self:stretch; }
        .hero-orbit::before, .hero-orbit::after { content:""; position:absolute; border:1px solid rgba(255,255,255,.22); border-radius:50%; transform:rotate(-18deg); }
        .hero-orbit::before { inset:6% -4% 5% 3%; }
        .hero-orbit::after { inset:18% 13% 16% 18%; border-color:rgba(217,255,94,.4); transform:rotate(22deg); }
        .hero-orbit-card { position:absolute; display:flex; align-items:center; gap:.65rem; padding:.8rem; border:1px solid rgba(255,255,255,.22); border-radius:16px; background:rgba(17,10,48,.18); box-shadow:0 18px 40px rgba(45,19,114,.17); backdrop-filter:blur(12px); }
        .hero-orbit-card strong, .hero-orbit-card span { display:block; }
        .hero-orbit-card strong { color:#FFF; font-size:12px; }
        .hero-orbit-card span { margin-top:4px; color:rgba(255,255,255,.62); font-size:9px; }
        .hero-orbit-card.one { top:13%; left:7%; transform:rotate(-8deg); }
        .hero-orbit-card.two { top:45%; right:0; transform:rotate(8deg); }
        .hero-orbit-card.three { bottom:6%; left:18%; transform:rotate(-4deg); }
        .mini-avatar { display:grid; place-items:center; width:30px; height:30px; border-radius:10px; color:#1C173B; background:var(--lime); font-size:11px; font-weight:900; }
        .metric-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:18px 0 34px; }
        .metric-card { padding:16px; border:1px solid var(--line); border-radius:16px; background:var(--surface); box-shadow:0 10px 25px rgba(65,41,130,.045); }
        .metric-card-label { color:var(--muted); font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .metric-card strong { display:block; margin-top:8px; color:var(--ink); font-family:var(--font-display); font-size:30px; font-weight:400; letter-spacing:-.05em; }
        .metric-card small { display:block; margin-top:4px; color:var(--muted); font-size:10px; }
        .section-header { display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; margin-bottom:14px; }
        .section-header h2 { margin:3px 0 0; color:var(--ink); font-family:var(--font-display); font-size:clamp(1.8rem,3vw,2.5rem); font-weight:400; line-height:1.03; letter-spacing:-.055em; }
        .section-header p { margin:0; color:var(--muted); font-size:11px; }
        .spotlight-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-bottom:38px; }
        .spotlight-card { position:relative; min-height:158px; padding:18px; overflow:hidden; border:1px solid var(--line); border-radius:18px; color:var(--ink); background:var(--surface); text-decoration:none; box-shadow:0 12px 30px rgba(65,41,130,.05); transition:transform .22s var(--ease), box-shadow .22s var(--ease), border-color .22s var(--ease); }
        .spotlight-card::before { content:""; position:absolute; width:160px; height:160px; right:-48px; bottom:-74px; border-radius:50%; background:var(--spotlight-color,#FF4D93); opacity:.18; }
        .spotlight-card:hover { transform:translateY(-5px); border-color:var(--spotlight-color,#7C5CFC); box-shadow:0 20px 36px rgba(65,41,130,.12); }
        .spotlight-card-top { display:flex; justify-content:space-between; color:var(--spotlight-color,#7C5CFC); font-size:10px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
        .spotlight-card h3 { max-width:220px; margin:25px 0 7px; font-size:17px; letter-spacing:-.04em; }
        .spotlight-card p { max-width:270px; margin:0; color:var(--muted); font-size:11px; line-height:1.45; }
        .workspace { display:block; }
        .directory-main { padding-top:calc(72px + 28px + 60px); }
        .quick-access-panel { position:fixed; top:100px; left:28px; z-index:70; width:min(1384px,calc(100% - 56px)); margin:0; padding:8px 10px; overflow:visible; border:1px solid var(--line); border-radius:12px; background:color-mix(in srgb,var(--paper) 96%,transparent); box-shadow:0 10px 24px rgba(14,41,49,.12); backdrop-filter:blur(18px); }
        .quick-access-row { display:flex; align-items:center; gap:8px; min-width:max-content; overflow:visible; }
        .quick-access-heading { display:flex; align-items:center; gap:6px; flex:0 0 auto; height:28px; }
        .quick-access-heading h2 { margin:0; color:var(--ink); font-family:var(--font-display); font-size:17px; font-weight:400; line-height:1; letter-spacing:-.05em; }
        .quick-access-status { display:inline-flex; align-items:center; gap:3px; color:var(--muted); font-size:8px; font-weight:800; }
        .quick-access-status svg { color:#2E9D91; }
        .filter-popover { position:relative; flex:0 0 auto; }
        .filter-trigger { display:inline-flex; align-items:center; gap:5px; min-height:28px; padding:0 9px; border:1px solid var(--line); border-radius:7px; color:var(--muted); background:var(--surface); font-size:9px; font-weight:900; cursor:pointer; white-space:nowrap; transition:all .18s var(--ease); }
        .filter-trigger:hover, .filter-popover.is-open .filter-trigger { color:var(--ink); border-color:var(--pink); background:var(--surface-soft); }
        .filter-trigger svg { color:var(--pink); }
        .filter-popover-menu { position:absolute; top:calc(100% + 8px); left:0; z-index:100; display:grid; gap:4px; min-width:190px; max-height:340px; overflow:auto; padding:8px; border:1px solid var(--line); border-radius:12px; background:color-mix(in srgb,var(--paper) 98%,transparent); box-shadow:0 16px 35px rgba(14,41,49,.2); backdrop-filter:blur(18px); }
        .filter-option-button { display:flex; align-items:center; justify-content:space-between; gap:18px; width:100%; padding:7px 8px; border:1px solid transparent; border-radius:7px; color:var(--muted); background:transparent; font-size:10px; font-weight:700; text-align:left; cursor:pointer; }
        .filter-option-button:hover, .filter-option-button.selected { color:var(--ink); border-color:var(--line); background:var(--surface-soft); }
        .filter-option-button span { color:var(--muted); font-size:9px; }
        .framework-menu { display:flex; flex-wrap:wrap; width:230px; min-width:230px; }
        .sort-menu { min-width:150px; }
        .quick-access-chip { flex:0 0 auto; min-height:28px; padding:0 8px; border:1px solid var(--line); border-radius:999px; color:var(--muted); background:var(--surface); font-size:9px; font-weight:800; cursor:pointer; transition:all .18s var(--ease); }
        .quick-access-chip:hover, .quick-access-chip.selected { color:#181329; border-color:var(--lime); background:var(--lime); }
        .recent-trigger { color:var(--violet); }
        .recent-menu { width:270px; min-width:270px; }
        .recent-menu-heading { display:flex; align-items:baseline; justify-content:space-between; gap:10px; padding:3px 5px 7px; border-bottom:1px solid var(--line); }
        .recent-menu-heading strong { color:var(--ink); font-size:11px; }
        .recent-menu-heading span { color:var(--muted); font-size:9px; }
        .recent-popover-card { display:flex; align-items:center; gap:8px; padding:7px 5px; border-radius:8px; color:var(--ink); text-decoration:none; }
        .recent-popover-card:hover { background:var(--surface-soft); }
        .recent-popover-card > span:nth-child(2) { display:grid; min-width:0; flex:1; }
        .recent-popover-card strong { overflow:hidden; font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
        .recent-popover-card small { overflow:hidden; margin-top:2px; color:var(--muted); font-size:8px; text-overflow:ellipsis; white-space:nowrap; }
        .recent-popover-card > svg { flex:0 0 auto; color:var(--muted); }
        .recent-popover-orbit { display:grid; place-items:center; flex:0 0 auto; width:24px; height:24px; border:1px solid var(--violet); border-radius:8px; color:var(--violet); font-size:10px; font-weight:900; }
        .recent-empty { margin:5px; color:var(--muted); font-size:10px; line-height:1.45; }
        .quick-access-clear { flex:0 0 auto; min-height:28px; padding:0 8px; border:1px solid transparent; border-radius:7px; color:var(--pink); background:transparent; font-size:9px; font-weight:900; cursor:pointer; }
        .quick-access-clear:hover:not(:disabled) { border-color:var(--pink); background:color-mix(in srgb,var(--pink) 8%,transparent); }
        .quick-access-clear:disabled { cursor:default; opacity:.35; }
        .filter-panel-heading h2 { margin:3px 0 0; font-family:var(--font-display); font-size:24px; font-weight:400; line-height:1.05; letter-spacing:-.05em; }
        .panel-eyebrow, .filter-label { color:var(--pink); font-size:9px; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
        .filter-block { padding:17px 0; border-bottom:1px solid var(--line); }
        .filter-options { display:flex; flex-direction:column; gap:3px; margin-top:10px; }
        .filter-option { display:flex; justify-content:space-between; width:100%; padding:8px 9px; border:1px solid transparent; border-radius:9px; color:var(--muted); background:transparent; font-size:11px; font-weight:700; text-align:left; cursor:pointer; transition:all .17s var(--ease); }
        .filter-option:hover { color:var(--ink); background:var(--surface-soft); }
        .filter-option.selected { color:var(--ink); border-color:rgba(115,87,255,.22); background:linear-gradient(90deg,rgba(115,87,255,.15),rgba(255,77,147,.08)); }
        .filter-option span:last-child { color:var(--muted); font-size:10px; }
        .filter-pills { display:flex; flex-wrap:wrap; gap:5px; margin-top:10px; }
        .filter-pill { padding:6px 8px; border:1px solid var(--line); border-radius:999px; color:var(--muted); background:transparent; font-size:10px; font-weight:800; cursor:pointer; }
        .filter-pill:hover, .filter-pill.selected { color:#181329; border-color:var(--lime); background:var(--lime); }
        .filter-select { width:100%; min-height:36px; margin-top:9px; padding:0 9px; border:1px solid var(--line); border-radius:9px; color:var(--ink); background:var(--surface); font-size:11px; outline:none; }
        .filter-panel-tip { display:flex; gap:.5rem; margin-top:17px; padding:10px; border-radius:10px; color:var(--muted); background:var(--surface-soft); font-size:10px; line-height:1.4; }
        .filter-panel-tip svg { flex-shrink:0; color:var(--pink); }
        .filter-done { display:inline-flex; align-items:center; justify-content:center; gap:.45rem; width:100%; min-height:38px; margin-top:14px; border:0; border-radius:10px; color:#16112B; background:var(--lime); font-size:11px; font-weight:900; cursor:pointer; }
        .results-area { min-width:0; }
        .results-header { display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; padding-bottom:14px; border-bottom:1px solid var(--line); }
        .results-header h2 { margin:4px 0 0; font-family:var(--font-display); font-size:clamp(2rem,4vw,3rem); font-weight:400; line-height:1; letter-spacing:-.06em; }
        .results-subtitle { margin:6px 0 0; color:var(--muted); font-size:11px; }
        .results-actions { display:flex; align-items:center; gap:7px; }
        .filter-state-note { display:inline-flex; align-items:center; gap:5px; color:var(--muted); font-size:10px; font-weight:800; }
        .filter-state-note svg { color:#2E9D91; }
        .view-toggle { display:flex; gap:2px; padding:3px; border:1px solid var(--line); border-radius:10px; background:var(--surface); }
        .view-toggle button { display:grid; place-items:center; width:30px; height:30px; border:0; border-radius:7px; color:var(--muted); background:transparent; cursor:pointer; }
        .view-toggle button.active { color:#181329; background:var(--lime); }
        .active-filters { display:flex; flex-wrap:wrap; gap:6px; margin:14px 0; }
        .active-filter { display:inline-flex; align-items:center; gap:5px; padding:6px 9px; border-radius:999px; color:var(--ink); background:var(--surface-soft); font-size:10px; font-weight:800; }
        .active-filter button { display:grid; place-items:center; padding:0; border:0; color:var(--muted); background:transparent; cursor:pointer; }
        .recent-strip { display:flex; align-items:center; gap:8px; margin:0 0 17px; padding:10px 12px; overflow:auto; border:1px solid var(--line); border-radius:12px; background:var(--surface); }
        .recent-label { flex-shrink:0; color:var(--pink); font-size:9px; font-weight:900; letter-spacing:.11em; text-transform:uppercase; }
        .recent-link { display:inline-flex; align-items:center; gap:4px; flex-shrink:0; padding:5px 8px; border-radius:7px; color:var(--muted); background:var(--surface-soft); font-size:10px; font-weight:700; text-decoration:none; }
        .recent-link:hover { color:var(--ink); }
        .resource-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        .resource-grid.list-view { grid-template-columns:1fr; }
        .resource-card { position:relative; display:flex; flex-direction:column; min-height:255px; padding:17px; overflow:hidden; border:1px solid var(--line); border-radius:18px; background:var(--surface); box-shadow:0 10px 27px rgba(65,41,130,.05); transition:transform .22s var(--ease), box-shadow .22s var(--ease), border-color .22s var(--ease); }
        .resource-card::before { content:""; position:absolute; inset:0 0 auto; height:4px; background:linear-gradient(90deg,var(--card-accent),var(--lime)); }
        .resource-card:hover { transform:translateY(-5px); border-color:var(--card-accent); box-shadow:var(--shadow); }
        .resource-card-top { display:flex; align-items:center; justify-content:space-between; min-height:35px; }
        .resource-preview { position:relative; aspect-ratio:16/9; margin:0 -17px 16px; overflow:hidden; border-bottom:1px solid var(--line); background:linear-gradient(135deg,var(--surface-soft),color-mix(in srgb,var(--card-accent) 18%,var(--surface))); }
        .resource-preview img { display:block; width:100%; height:100%; object-fit:cover; transition:transform .5s var(--ease), opacity .35s var(--ease); }
        .resource-card:hover .resource-preview img { transform:scale(1.045); }
        .preview-skeleton { position:absolute; inset:0; display:grid; align-content:end; gap:7px; padding:16px; overflow:hidden; background:linear-gradient(135deg,color-mix(in srgb,var(--card-accent) 14%,var(--surface)),var(--surface-soft)); }
        .preview-skeleton::before { content:""; position:absolute; inset:0; background:linear-gradient(105deg,transparent 25%,rgba(255,255,255,.32) 45%,transparent 65%); transform:translateX(-100%); animation:preview-shimmer 1.35s infinite; }
        .preview-skeleton-line { position:relative; width:46%; height:7px; border-radius:999px; background:color-mix(in srgb,var(--ink) 16%,transparent); }
        .preview-skeleton-line.short { width:28%; }
        @keyframes preview-shimmer { to { transform:translateX(100%); } }
        .preview-placeholder { position:absolute; inset:0; display:grid; place-items:center; align-content:center; gap:8px; color:var(--muted); background:linear-gradient(135deg,color-mix(in srgb,var(--card-accent) 15%,var(--surface)),var(--surface-soft)); }
        .preview-placeholder small { font-size:9px; font-weight:800; letter-spacing:.04em; }
        .preview-fallback-link { color:var(--ink); font-size:9px; font-weight:900; text-decoration:underline; text-underline-offset:3px; }
        .preview-initials { display:grid; place-items:center; width:42px; height:42px; border:1px solid color-mix(in srgb,var(--card-accent) 45%,transparent); border-radius:14px; color:var(--card-accent); background:color-mix(in srgb,var(--card-accent) 12%,transparent); font-size:12px; font-weight:900; }
        .preview-overlay { position:absolute; inset:auto 10px 10px; display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border:1px solid rgba(255,255,255,.25); border-radius:9px; color:#FFF; background:rgba(12,9,35,.72); opacity:0; font-size:9px; font-weight:900; backdrop-filter:blur(8px); transform:translateY(5px); transition:opacity .22s var(--ease), transform .22s var(--ease); }
        .resource-card:hover .preview-overlay, .resource-card:focus-within .preview-overlay { opacity:1; transform:translateY(0); }
        .resource-orbit { display:grid; place-items:center; width:31px; height:31px; border:1px solid var(--card-accent); border-radius:50%; }
        .resource-orbit span { width:10px; height:10px; border-radius:50%; background:var(--card-accent); box-shadow:0 0 0 5px color-mix(in srgb,var(--card-accent) 15%,transparent); }
        .resource-card-actions { display:flex; align-items:center; gap:6px; }
        .resource-card-link { display:block; margin-top:18px; color:var(--ink); text-decoration:none; }
        .resource-card-link:has(.resource-preview) { margin-top:0; }
        .resource-category { color:var(--card-accent); font-size:9px; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
        .resource-card h3 { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:8px 0 8px; font-size:18px; letter-spacing:-.05em; }
        .resource-card h3 svg { flex-shrink:0; opacity:.5; transition:transform .18s var(--ease); }
        .resource-card:hover h3 svg { transform:translate(3px,-3px); opacity:1; }
        .resource-card p { min-height:51px; margin:0; color:var(--muted); font-size:11px; line-height:1.55; }
        .resource-card mark { padding:0 2px; border-radius:3px; color:var(--ink); background:var(--lime); }
        .resource-card-footer { display:flex; align-items:flex-end; justify-content:space-between; gap:8px; margin-top:auto; padding-top:16px; border-top:1px solid var(--line); }
        .resource-domain { min-width:0; overflow:hidden; color:var(--muted); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:9px; text-overflow:ellipsis; white-space:nowrap; }
        .resource-stacks { display:flex; gap:4px; flex-wrap:wrap; justify-content:flex-end; }
        .resource-stacks span { padding:4px 6px; border-radius:5px; color:var(--muted); background:var(--surface-soft); font-size:8px; font-weight:800; }
        .new-badge { padding:4px 6px; border-radius:5px; color:#20162C; background:var(--lime); font-size:8px; font-weight:900; letter-spacing:.05em; text-transform:uppercase; }
        .empty-state { display:grid; place-items:center; min-height:300px; padding:30px; border:1px dashed var(--line); border-radius:18px; text-align:center; }
        .empty-symbol { display:grid; place-items:center; width:54px; height:54px; margin-bottom:13px; border-radius:18px; color:#181329; background:var(--lime); }
        .empty-state h3 { margin:0; font-family:var(--font-display); font-size:22px; font-weight:400; line-height:1.05; }
        .empty-state p { max-width:300px; margin:7px 0 16px; color:var(--muted); font-size:11px; line-height:1.5; }
        .suggest-section { margin-top:42px; border:1px solid var(--line); border-radius:20px; overflow:hidden; background:linear-gradient(135deg,var(--surface),var(--surface-soft)); }
        .suggest-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:22px; cursor:pointer; }
        .suggest-title { display:flex; gap:.8rem; align-items:center; }
        .suggest-icon { display:grid; place-items:center; width:38px; height:38px; border-radius:13px; color:#181329; background:var(--lime); }
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
        @media (max-width:1060px) { .header-nav { display:none; } .directory-main { padding-top:calc(64px + 28px + 60px); } .quick-access-panel { top:92px; left:18px; width:calc(100% - 36px); } .results-area { width:100%; } }
        @media (max-width:820px) { .header-inner, .app-main { padding-left:18px; padding-right:18px; } .header-inner { min-height:64px; } .brand-lockup { min-width:auto; } .brand-caption { display:none; } .header-actions { margin-left:auto; } .theme-switch-label { display:none; } .welcome-grid { grid-template-columns:1fr; min-height:auto; padding:28px 22px 18px; } .hero-orbit { min-height:185px; } .hero-orbit-card.one { left:3%; } .hero-orbit-card.two { right:4%; } .metric-grid { grid-template-columns:repeat(2,1fr); } .spotlight-grid { grid-template-columns:1fr; } }
        @media (max-width:560px) { .app-main { padding-top:16px; } .directory-main { padding-top:calc(64px + 24px + 60px); } .welcome-title { font-size:clamp(3.15rem,16vw,5rem); } .hero-search { margin-top:22px; } .hero-search-kbd { display:none; } .hero-search .button { min-width:38px; padding:0; } .metric-grid { gap:8px; margin-bottom:28px; } .metric-card { padding:12px; } .metric-card strong { font-size:24px; } .section-header { align-items:flex-start; flex-direction:column; gap:5px; } .spotlight-card { min-height:140px; } .landing-topics { padding:18px; } .landing-topic-grid { grid-template-columns:1fr; } .quick-access-panel { top:88px; left:18px; } .quick-access-heading .quick-access-status { display:none; } .filter-trigger { padding:0 7px; } .filter-popover-menu { position:fixed; top:132px; left:18px; max-width:calc(100vw - 36px); } .framework-menu { width:230px; } .recent-menu { width:270px; } .resource-grid { grid-template-columns:1fr; } .results-header { align-items:flex-start; flex-direction:column; } .results-actions { width:100%; justify-content:space-between; } .suggest-form-grid { grid-template-columns:1fr; } .app-footer { align-items:flex-start; flex-direction:column; } }
        @media (prefers-reduced-motion:reduce) { *, *::before, *::after { scroll-behavior:auto !important; transition-duration:.01ms !important; animation-duration:.01ms !important; } }
      `}</style>

      <header className={`site-header ${isDirectory ? "directory-header" : ""}`}>
        <div className="header-inner">
          <div className="brand-lockup">
            <span className="brand-symbol"><Icon name="spark" size={17} /></span>
            <div><div className="brand-name">UI / FOLIO</div><div className="brand-caption">Curated interface intelligence</div></div>
          </div>
          <nav className="header-nav" aria-label="Primary navigation">
            <button type="button" aria-current={isDirectory ? "page" : undefined} onClick={() => navigateTo("/directory")}>Explore</button>
            <button type="button" aria-current={isDirectory && activeCategory === "inspiration" ? "page" : undefined} onClick={() => { setActiveCategory("inspiration"); navigateTo("/directory"); }}>Inspiration</button>
            <button type="button" aria-current={isDirectory && activeCategory === "react" ? "page" : undefined} onClick={() => { setActiveCategory("react"); navigateTo("/directory"); }}>Libraries</button>
          </nav>
          <div className="header-actions">
            <ThemeToggle theme={theme} onToggle={() => setTheme(current => current === "light" ? "dark" : "light")} />
            <button type="button" className="icon-button" onClick={shareFilters} aria-label="Copy shareable filter link" title={copiedShare ? "Link copied" : "Copy shareable link"}><Icon name={copiedShare ? "check" : "share"} size={15} /></button>
            <button type="button" className="button button-primary" onClick={() => setSuggestOpen(true)}><Icon name="plus" size={13} /> Suggest</button>
          </div>
        </div>
      </header>

      <main className={`app-main ${isDirectory ? "directory-main" : ""}`}>
        {!isDirectory && <>
        <section className="welcome-grid" aria-labelledby="welcome-title">
          <div className="welcome-copy">
            <div className="eyebrow">The independent design index · 2026 edition</div>
            <h1 className="welcome-title" id="welcome-title">Find your next <em>favorite</em> interface.</h1>
            <p>{LIBS.length} hand-picked UI libraries, design systems, inspiration galleries, and frontend resources for people who care about the details.</p>
            <div className="hero-search">
              <Icon name="search" size={17} />
              <input ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} aria-label="Search resources" placeholder="Search components, inspiration, tools..." />
              <span className="hero-search-kbd">Press /</span>
              <button type="button" className="button button-primary" onClick={() => navigateTo("/directory")}>Explore the index <Icon name="arrowRight" size={14} /></button>
            </div>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="hero-orbit-card one"><span className="mini-avatar">UI</span><div><strong>{LIBS.length} resources</strong><span>one focused index</span></div></div>
            <div className="hero-orbit-card two"><span className="mini-avatar">✦</span><div><strong>{NEW_IDS.size} fresh finds</strong><span>new in {VERIFIED_DATE}</span></div></div>
            <div className="hero-orbit-card three"><span className="mini-avatar">↗</span><div><strong>7 ways to browse</strong><span>search, filter, sort, save</span></div></div>
          </div>
        </section>

        <section className="metric-grid" aria-label="Directory overview">
          <div className="metric-card"><span className="metric-card-label">Resources</span><strong>{LIBS.length}</strong><small>hand-picked entries</small></div>
          <div className="metric-card"><span className="metric-card-label">Fresh finds</span><strong>{NEW_IDS.size}</strong><small>added this issue</small></div>
          <div className="metric-card"><span className="metric-card-label">Browse lanes</span><strong>{CATEGORIES.length - 1}</strong><small>from motion to UX</small></div>
          <div className="metric-card"><span className="metric-card-label">Open signal</span><strong>100%</strong><small>independent links</small></div>
        </section>

        <section aria-labelledby="spotlight-title">
          <div className="section-header"><div><div className="eyebrow" style={{ color: "var(--pink)" }}>Trending now</div><h2 id="spotlight-title">Worth a closer look</h2></div><p>Fresh additions from the latest issue</p></div>
          <div className="spotlight-grid">
            {trendResources.map(resource => <a key={resource.id} className="spotlight-card" style={{ "--spotlight-color": CAT_COLOR[resource.cat] || "#7C5CFC" }} href={`https://${resource.url}`} target="_blank" rel="noopener noreferrer" onClick={() => handleVisit(resource)}>
              <div className="spotlight-card-top"><span>{CATEGORIES.find(item => item.id === CAT_RESOLVE(resource.cat))?.label || resource.cat}</span><Icon name="arrow" size={14} /></div>
              <h3>{resource.name}</h3><p>{resource.desc}</p>
            </a>)}
          </div>
        </section>
        </>}

        {isDirectory && <>
        <FilterPanel categories={CATEGORIES} counts={counts} activeCategory={activeCategory} setActiveCategory={setActiveCategory} stacks={STACK_FILTERS} stackFilter={stackFilter} setStackFilter={setStackFilter} sortBy={sortBy} setSortBy={setSortBy} sortOptions={SORT_OPTIONS} clearFilters={clearFilters} hasActiveFilters={activeFilterCount > 0} recent={recent} onVisit={handleVisit} />
        <section className="workspace" id="results" aria-label="Resource discovery workspace">
          <div className="results-area">
            <div className="results-header">
              <div><div className="eyebrow" style={{ color: "var(--pink)" }}>The index</div><h2>{categoryLabel}</h2><p className="results-subtitle" aria-live="polite">{filteredResources.length} resources ready to explore{stackFilter !== "all" ? ` · built with ${stackFilter}` : ""}</p>
</div>
              <div className="results-actions">
                {activeFilterCount > 0 && <span className="filter-state-note" role="status"><Icon name="check" size={12} /> Filters saved</span>}
                <div className="view-toggle" aria-label="Choose resource view"><button type="button" className={viewMode === "list" ? "active" : ""} aria-label="List view" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}><Icon name="list" size={14} /></button><button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Grid view" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><Icon name="grid" size={14} /></button></div>
              </div>
            </div>

            {activeFilterCount > 0 && <div className="active-filters" aria-label="Active filters">
              {query && <span className="active-filter">“{query}” <button type="button" onClick={() => setQuery("")} aria-label="Remove search filter"><Icon name="close" size={11} /></button></span>}
              {activeCategory !== "all" && <span className="active-filter">{categoryLabel} <button type="button" onClick={() => setActiveCategory("all")} aria-label="Remove category filter"><Icon name="close" size={11} /></button></span>}
              {stackFilter !== "all" && <span className="active-filter">{stackFilter} <button type="button" onClick={() => setStackFilter("all")} aria-label="Remove framework filter"><Icon name="close" size={11} /></button></span>}
              {sortBy !== "featured" && <span className="active-filter">{SORT_OPTIONS.find(option => option.id === sortBy)?.label} <button type="button" onClick={() => setSortBy("featured")} aria-label="Remove sort filter"><Icon name="close" size={11} /></button></span>}
            </div>}


            {filteredResources.length === 0 ? <EmptyState onClear={clearFilters} /> : <div className={`resource-grid ${viewMode === "list" ? "list-view" : ""}`}>{filteredResources.map(resource => <ResourceCard key={resource.id} lib={resource} categoryLabel={CATEGORIES.find(item => item.id === CAT_RESOLVE(resource.cat))?.label || resource.cat} stacks={LIB_STACKS[resource.id] || []} isNew={NEW_IDS.has(resource.id)} isCopied={copiedId === resource.id} query={query} onCopy={copyUrl} onVisit={handleVisit} />)}</div>}
          </div>
        </section>

        <section className="suggest-section" aria-labelledby="suggest-title">
          <div className="suggest-head" onClick={() => setSuggestOpen(open => !open)} role="button" tabIndex={0} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") setSuggestOpen(open => !open); }}>
            <div className="suggest-title"><span className="suggest-icon"><Icon name="spark" size={17} /></span><div><strong id="suggest-title">Know something that belongs here?</strong><span>Send a link. I review and add the best resources.</span></div></div><Icon name={suggestOpen ? "close" : "plus"} size={16} />
          </div>
          {suggestOpen && <div className="suggest-form">
            {suggested ? <div className="empty-state" style={{ minHeight: 150 }}><div className="empty-symbol"><Icon name="check" size={22} /></div><h3>Opening your email client.</h3><p>Thanks for helping keep the index sharp.</p></div> : <>
              <div className="suggest-form-grid"><div className="field"><label htmlFor="suggest-name">Resource name</label><input id="suggest-name" value={suggestion.name} onChange={event => setSuggestion({ ...suggestion, name: event.target.value })} placeholder="e.g. Acme UI" /></div><div className="field"><label htmlFor="suggest-url">URL</label><input id="suggest-url" value={suggestion.url} onChange={event => setSuggestion({ ...suggestion, url: event.target.value })} placeholder="acme-ui.com" /></div></div>
              <div className="field"><label htmlFor="suggest-note">Why it belongs</label><textarea id="suggest-note" value={suggestion.note} onChange={event => setSuggestion({ ...suggestion, note: event.target.value })} placeholder="What makes this resource useful or distinctive?" /></div>
              <div className="suggest-form-footer"><p>Opens an email with the details pre-filled.</p><button type="button" className="button button-primary" disabled={!suggestion.name.trim() || !suggestion.url.trim()} onClick={sendSuggestion}>Send suggestion <Icon name="arrowRight" size={14} /></button></div>
            </>}
          </div>}
        </section>

        <footer className="app-footer"><span>Hand-picked · Verified {VERIFIED_DATE}</span><span>{filteredResources.length} of {LIBS.length} resources shown</span></footer>
        </>}
      </main>

    </div>
  );
}
