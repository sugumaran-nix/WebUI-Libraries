import { useState, useMemo } from "react";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "animated", label: "Animated & Motion" },
  { id: "shadcn", label: "shadcn Ecosystem" },
  { id: "tailwind", label: "Tailwind CSS" },
  { id: "css", label: "CSS / HTML / SVG" },
  { id: "react", label: "Full React" },
  { id: "headless", label: "Headless" },
  { id: "multi", label: "Vue / Svelte" },
  { id: "collections", label: "Collections" },
  { id: "tools", label: "Tools" },
];

const LIBS = [
  // Animated & Motion
  { id: 1, name: "Aceternity UI", url: "ui.aceternity.com", cat: "animated", desc: "Animated components built with Tailwind CSS and Framer Motion", gem: false },
  { id: 2, name: "Magic UI", url: "magicui.design", cat: "animated", desc: "50+ free, open-source animated components for React", gem: false },
  { id: 3, name: "Motion Primitives", url: "motion-primitives.com", cat: "animated", desc: "Copy-paste motion primitives for beautiful React interfaces", gem: false },
  { id: 4, name: "Eldora UI", url: "eldoraui.site", cat: "animated", desc: "Animated React components built with Framer Motion", gem: false },
  { id: 5, name: "Cult UI", url: "cult-ui.com", cat: "animated", desc: "Crafted React components with dark-mode-first aesthetics", gem: false },
  { id: 6, name: "Animata", url: "animata.design", cat: "animated", desc: "Hand-crafted interaction and animation components", gem: false },
  { id: 7, name: "UI Layout", url: "ui-layout.com", cat: "animated", desc: "Complex layout patterns with smooth animation support", gem: false },
  { id: 8, name: "Lukacho UI", url: "ui.lukacho.com", cat: "animated", desc: "Minimal animated UI kit for modern apps", gem: false },
  { id: 9, name: "ReactBits", url: "reactbits.dev", cat: "animated", desc: "Animated React bit-components for creative UIs", gem: true },
  { id: 10, name: "SmoothUI", url: "smoothui.dev", cat: "animated", desc: "Ultra-smooth micro-interaction components for React", gem: true },
  { id: 11, name: "Fancy Components", url: "fancycomponents.dev", cat: "animated", desc: "Distinctive, delightful animated component collection", gem: true },
  { id: 12, name: "CuiCui", url: "cuicui.day", cat: "animated", desc: "Daily component drops with polished motion design", gem: true },
  { id: 13, name: "SyntaxUI", url: "syntaxui.com", cat: "animated", desc: "Dev-focused animated component library with code previews", gem: true },
  { id: 14, name: "Inspira UI (Vue)", url: "inspira-ui.com", cat: "multi", desc: "Animated component library for Vue developers", gem: true },
  { id: 15, name: "UI Labs", url: "uilabs.dev", cat: "animated", desc: "Experimental UI components for the adventurous developer", gem: true },

  // shadcn ecosystem
  { id: 16, name: "shadcn/ui", url: "ui.shadcn.com", cat: "shadcn", desc: "The gold standard — re-usable components via CLI, your code to own", gem: false },
  { id: 17, name: "21st.dev", url: "21st.dev", cat: "shadcn", desc: "The npm for design engineers — ship components in seconds", gem: false },
  { id: 18, name: "Origin UI", url: "originui.com", cat: "shadcn", desc: "Beautiful shadcn components built with a design-first approach", gem: false },
  { id: 19, name: "Shadcnblocks", url: "shadcnblocks.com", cat: "shadcn", desc: "Full page sections and blocks for shadcn projects", gem: false },
  { id: 20, name: "HextaUI", url: "hextaui.com", cat: "shadcn", desc: "Modern shadcn extensions with refined aesthetics", gem: true },
  { id: 21, name: "KokonutUI", url: "kokonutui.com", cat: "shadcn", desc: "Accessible, production-ready shadcn component extensions", gem: true },
  { id: 22, name: "Bundui", url: "bundui.io", cat: "shadcn", desc: "Curated shadcn component bundles, ready to drop in", gem: true },
  { id: 23, name: "Skiper UI", url: "skiper-ui.com", cat: "shadcn", desc: "24 free animated components on top of shadcn", gem: true },
  { id: 24, name: "lndev/ui", url: "ui.lndev.me", cat: "shadcn", desc: "Indie-crafted shadcn extensions with unique personality", gem: true },
  { id: 25, name: "ReUI", url: "reui.io", cat: "shadcn", desc: "Enterprise-grade shadcn component extensions", gem: true },
  { id: 26, name: "MynaUI", url: "mynaui.com", cat: "shadcn", desc: "Elegant shadcn components with consistent visual language", gem: true },
  { id: 27, name: "BadtzUI", url: "badtz-ui.com", cat: "shadcn", desc: "Core-free shadcn extensions, updated every week", gem: true },
  { id: 28, name: "Nyxb UI", url: "nyxbui.design", cat: "shadcn", desc: "Dark-mode-first shadcn components with rich motion", gem: true },

  // Tailwind
  { id: 29, name: "DaisyUI", url: "daisyui.com", cat: "tailwind", desc: "The most popular Tailwind component library — 50+ components", gem: false },
  { id: 30, name: "Flowbite", url: "flowbite.com", cat: "tailwind", desc: "Open-source Tailwind component library with Figma kit", gem: false },
  { id: 31, name: "Preline UI", url: "preline.co", cat: "tailwind", desc: "Fully responsive Tailwind HTML components and templates", gem: false },
  { id: 32, name: "HyperUI", url: "hyperui.dev", cat: "tailwind", desc: "Free open-source Tailwind components for ecommerce and marketing", gem: false },
  { id: 33, name: "Meraki UI", url: "merakiui.com", cat: "tailwind", desc: "Beautiful Tailwind UI components for your next project", gem: false },
  { id: 34, name: "FlyonUI", url: "flyonui.com", cat: "tailwind", desc: "Semantic Tailwind components built on DaisyUI and Alpine.js", gem: true },
  { id: 35, name: "Penguin UI", url: "penguinui.com", cat: "tailwind", desc: "Simple and accessible Tailwind components", gem: true },
  { id: 36, name: "Tailkits", url: "tailkits.com", cat: "tailwind", desc: "Curated Tailwind component marketplace and collection", gem: true },
  { id: 37, name: "Tailus HTML", url: "html.tailus.io", cat: "tailwind", desc: "Tailwind components with refined visual design standards", gem: true },
  { id: 38, name: "DevUI", url: "devui.in", cat: "tailwind", desc: "Developer-centric Tailwind components with code-first DX", gem: true },
  { id: 39, name: "Tailblocks", url: "tailblocks.cc", cat: "tailwind", desc: "Ready-to-use Tailwind CSS blocks for rapid prototyping", gem: true },

  // CSS / HTML / SVG
  { id: 40, name: "Uiverse", url: "uiverse.io", cat: "css", desc: "Community-created CSS elements and components — thousands of them", gem: false },
  { id: 41, name: "Dot Matrix", url: "dotmatrix.zzzzshawn.cloud", cat: "css", desc: "Pixel-art dot matrix CSS backgrounds and effects", gem: false },
  { id: 42, name: "Shapes Gallery", url: "shapes.gallery", cat: "css", desc: "Pure CSS shape collection for creative backgrounds and flourishes", gem: false },
  { id: 43, name: "RareUI", url: "rareui.in", cat: "css", desc: "Unique CSS components you won't find on mainstream lists", gem: true },
  { id: 44, name: "Indie Starter UI", url: "ui.indie-starter.dev", cat: "css", desc: "Pure HTML/CSS starter components for indie hackers", gem: true },
  { id: 45, name: "FlashUI", url: "flashui.site", cat: "css", desc: "Zero-install, paste-and-go CSS UI elements", gem: true },
  { id: 46, name: "Ever UI", url: "ever-ui.com", cat: "css", desc: "Evergreen CSS components with long-term browser support", gem: true },
  { id: 47, name: "Chakra Framer", url: "chakraframer.com", cat: "css", desc: "CSS motion templates inspired by Framer's design system", gem: true },
  { id: 48, name: "Ground Bossadizenith", url: "ground.bossadizenith.me", cat: "css", desc: "Experimental CSS ground-level components and effects", gem: true },

  // Full React
  { id: 49, name: "HeroUI", url: "heroui.com", cat: "react", desc: "Beautiful React components (formerly NextUI) — 100+ components", gem: false },
  { id: 50, name: "Mantine", url: "mantine.dev", cat: "react", desc: "Feature-rich React component library with 100+ hooks", gem: false },
  { id: 51, name: "Chakra UI", url: "chakra-ui.com", cat: "react", desc: "Accessible, composable React components with dark mode out of the box", gem: false },
  { id: 52, name: "PrimeReact", url: "primereact.org", cat: "react", desc: "Ultimate React UI component suite — 90+ components", gem: false },
  { id: 53, name: "MUI", url: "mui.com", cat: "react", desc: "The most popular React UI framework — Material Design and beyond", gem: false },
  { id: 54, name: "Ant Design", url: "ant.design", cat: "react", desc: "Enterprise-grade React UI library from Alibaba", gem: false },
  { id: 55, name: "Gluestack", url: "gluestack.io", cat: "react", desc: "Fully free React + React Native component library", gem: true },
  { id: 56, name: "React Suite", url: "rsuitejs.com", cat: "react", desc: "Suite of React components for enterprise applications", gem: true },
  { id: 57, name: "Grommet", url: "v2.grommet.io", cat: "react", desc: "Accessibility-first React library, HPE-backed and battle-tested", gem: true },

  // Headless
  { id: 58, name: "Radix UI", url: "radix-ui.com", cat: "headless", desc: "Unstyled, accessible components for building high-quality design systems", gem: false },
  { id: 59, name: "Headless UI", url: "headlessui.com", cat: "headless", desc: "Completely unstyled, fully accessible UI components by Tailwind Labs", gem: false },
  { id: 60, name: "Base UI", url: "base-ui.com", cat: "headless", desc: "Unstyled React components from the MUI team — built for customization", gem: false },
  { id: 61, name: "React Aria", url: "react-spectrum.adobe.com/react-aria", cat: "headless", desc: "Adobe's collection of React Hooks for accessible UI primitives", gem: false },

  // Vue / Svelte / Multi
  { id: 62, name: "shadcn-svelte", url: "shadcn-svelte.com", cat: "multi", desc: "shadcn/ui ported to Svelte — all the power, native syntax", gem: true },
  { id: 63, name: "Flowbite Svelte", url: "flowbite-svelte.com", cat: "multi", desc: "Flowbite component library for Svelte projects", gem: true },
  { id: 64, name: "Vuetify", url: "vuetifyjs.com", cat: "multi", desc: "Material Design component framework for Vue — 80+ components", gem: false },
  { id: 65, name: "PrimeVue", url: "primevue.org", cat: "multi", desc: "The ultimate Vue UI component library — 90+ components", gem: true },

  // Collections
  { id: 66, name: "Untitled UI React", url: "untitledui.com/react", cat: "collections", desc: "React implementation of the Untitled UI Figma design system", gem: false },
  { id: 67, name: "Tailark", url: "tailark.com", cat: "collections", desc: "Curated Tailwind template marketplace with high-quality sections", gem: false },
  { id: 68, name: "React Keep Design", url: "react.keepdesign.io", cat: "collections", desc: "Design-driven React component collection with Figma support", gem: true },
  { id: 69, name: "awesome-shadcn-ui", url: "github.com/birobirobiro/awesome-shadcn-ui", cat: "collections", desc: "Curated list of shadcn/ui resources, plugins, and templates", gem: true },

  // Newly found — not in original list
  { id: 75, name: "Tremor", url: "tremor.so", cat: "react", desc: "35+ open-source React components for dashboards and data visualization — charts, KPIs, tables", gem: false },
  { id: 76, name: "Float UI", url: "floatui.com", cat: "multi", desc: "Free multi-framework UI components (React, Vue, Svelte, HTML) — hero sections, pricing, dashboards", gem: false },
  { id: 77, name: "Sailboat UI", url: "sailboatui.com", cat: "tailwind", desc: "150+ open-source Tailwind CSS components with Alpine.js interactivity", gem: false },
  { id: 78, name: "TailGrids", url: "tailgrids.com", cat: "tailwind", desc: "600+ free React + Tailwind components, blocks, and templates for real-world products", gem: false },
  { id: 79, name: "Kibo UI", url: "kibo-ui.com", cat: "shadcn", desc: "shadcn/ui registry with advanced niche components: color pickers, QR codes, drag-drop uploaders, mini calendar", gem: true },
  { id: 80, name: "Fluent UI", url: "react.fluentui.dev", cat: "react", desc: "Microsoft's open-source React library with 950+ cross-platform components — the backbone of Office", gem: false },
  { id: 81, name: "Blueprint", url: "blueprintjs.com", cat: "react", desc: "Palantir's React UI toolkit optimized for data-dense desktop applications", gem: false },
  { id: 82, name: "Semantic UI React", url: "react.semantic-ui.com", cat: "react", desc: "Human-friendly component APIs with 100+ declarative React components", gem: false },
  { id: 83, name: "CoreUI React", url: "coreui.io/react", cat: "react", desc: "Bootstrap-based enterprise React component library with admin dashboard templates", gem: false },
  { id: 84, name: "Ark UI", url: "ark-ui.com", cat: "headless", desc: "45+ headless, zero-style, framework-agnostic accessible UI primitives", gem: true },
  { id: 85, name: "React Bootstrap", url: "react-bootstrap.github.io", cat: "react", desc: "Bootstrap rebuilt from scratch as true React components — no jQuery", gem: false },

  // Tools
  { id: 70, name: "Pattern Craft", url: "patterncraft.dev", cat: "tools", desc: "100+ CSS and Tailwind background patterns, copy-paste ready", gem: true },
  { id: 71, name: "Gradienty", url: "gradienty.codes", cat: "tools", desc: "CSS gradient generator and library with one-click copy", gem: true },
  { id: 72, name: "Lordicon", url: "lordicon.com", cat: "tools", desc: "Animated Lottie icons with free tier — 1000+ icons", gem: true },
  { id: 73, name: "Lucide Icons", url: "lucide.dev", cat: "tools", desc: "1000+ open-source icons, consistent and MIT-licensed", gem: false },
  { id: 74, name: "public-apis", url: "github.com/public-apis/public-apis", cat: "tools", desc: "Massive list of free public APIs for prototyping and projects", gem: false },
];

const CAT_COLORS = {
  animated: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa", dot: "#8b5cf6" },
  shadcn:   { bg: "rgba(30,215,96,0.10)",  text: "#4ade80", dot: "#22c55e" },
  tailwind: { bg: "rgba(56,189,248,0.12)", text: "#7dd3fc", dot: "#38bdf8" },
  css:      { bg: "rgba(251,146,60,0.12)", text: "#fdba74", dot: "#f97316" },
  react:    { bg: "rgba(96,165,250,0.12)", text: "#93c5fd", dot: "#60a5fa" },
  headless: { bg: "rgba(248,113,113,0.10)",text: "#fca5a5", dot: "#ef4444" },
  multi:    { bg: "rgba(52,211,153,0.10)", text: "#6ee7b7", dot: "#34d399" },
  collections:{ bg: "rgba(253,224,71,0.10)", text: "#fde047", dot: "#eab308" },
  tools:    { bg: "rgba(232,121,249,0.12)", text: "#f0abfc", dot: "#d946ef" },
};

const CAT_LABELS = {
  animated: "Animated", shadcn: "shadcn", tailwind: "Tailwind",
  css: "CSS / SVG", react: "React Lib", headless: "Headless",
  multi: "Vue / Svelte", collections: "Collection", tools: "Tool",
};

export default function App() {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return LIBS.filter(l =>
      (active === "all" || l.cat === active) &&
      (!q || l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q) || l.cat.toLowerCase().includes(q))
    );
  }, [active, query]);

  const counts = useMemo(() => {
    const c = { all: LIBS.length };
    LIBS.forEach(l => { c[l.cat] = (c[l.cat] || 0) + 1; });
    return c;
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e2e8f0",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(139,92,246,0.12) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 2rem",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 0 2rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span style={{
                    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                    background: "#8b5cf6", boxShadow: "0 0 12px #8b5cf6",
                  }} />
                  <span style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b7280", fontWeight: 500 }}>
                    Open Source
                  </span>
                </div>
                <h1 style={{
                  fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, margin: 0,
                  letterSpacing: "-0.03em", lineHeight: 1.1,
                  background: "linear-gradient(135deg, #f1f5f9 30%, #94a3b8)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  UI Component Libraries
                </h1>
                <p style={{ marginTop: "0.75rem", color: "#64748b", fontSize: "1.05rem", maxWidth: 480, lineHeight: 1.6 }}>
                  {LIBS.length} free, open-source resources — from zero-install CSS to full React ecosystems.
                </p>
              </div>

              {/* Search */}
              <div style={{ position: "relative", minWidth: 260 }}>
                <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.35 }}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search libraries…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{
                    width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, color: "#e2e8f0", fontSize: 14, outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>
            </div>

            {/* Category tabs */}
            <div style={{
              display: "flex", gap: "0.35rem", marginTop: "2rem",
              flexWrap: "wrap",
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActive(cat.id)}
                  style={{
                    padding: "0.4rem 0.9rem", borderRadius: 8, border: "none",
                    cursor: "pointer", fontSize: 13, fontWeight: 500,
                    transition: "all 0.15s",
                    background: active === cat.id ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                    color: active === cat.id ? "#c4b5fd" : "#64748b",
                    outline: active === cat.id ? "1px solid rgba(139,92,246,0.35)" : "1px solid transparent",
                  }}
                >
                  {cat.label}
                  <span style={{
                    marginLeft: 6, fontSize: 11, opacity: 0.6,
                    color: active === cat.id ? "#c4b5fd" : "#475569",
                  }}>
                    {counts[cat.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Grid */}
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 2rem 4rem" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 0", color: "#334155" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>—</div>
              No libraries match your search.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: "1px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.05)",
            }}>
              {filtered.map(lib => {
                const c = CAT_COLORS[lib.cat] || CAT_COLORS.tools;
                const isHovered = hoveredId === lib.id;
                return (
                  <a
                    key={lib.id}
                    href={`https://${lib.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredId(lib.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: "block", textDecoration: "none",
                      padding: "1.5rem",
                      background: isHovered ? "rgba(255,255,255,0.035)" : "rgba(10,10,15,1)",
                      transition: "background 0.15s",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "0.35rem",
                            fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "0.2rem 0.55rem", borderRadius: 5,
                            background: c.bg, color: c.text,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
                            {CAT_LABELS[lib.cat]}
                          </span>
                          {lib.gem && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                              textTransform: "uppercase", padding: "0.2rem 0.5rem",
                              borderRadius: 5, background: "rgba(251,191,36,0.1)",
                              color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)",
                            }}>
                              ◆ Gem
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: "1rem", fontWeight: 600, color: isHovered ? "#f1f5f9" : "#cbd5e1",
                          marginBottom: "0.35rem", transition: "color 0.15s",
                          letterSpacing: "-0.01em",
                        }}>
                          {lib.name}
                        </div>
                        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                          {lib.desc}
                        </div>
                      </div>
                      <div style={{
                        flexShrink: 0, opacity: isHovered ? 1 : 0.3,
                        transition: "opacity 0.15s, transform 0.15s",
                        transform: isHovered ? "translate(1px, -1px)" : "translate(0,0)",
                        color: "#94a3b8",
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7v10"/>
                        </svg>
                      </div>
                    </div>
                    <div style={{
                      marginTop: "0.85rem", fontSize: 12, color: "#334155",
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                    }}>
                      {lib.url}
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Footer note */}
          <div style={{
            marginTop: "3rem", paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "0.75rem",
          }}>
            <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
              All {LIBS.length} libraries are free / open-source. ◆ marks hidden gems not on mainstream lists.
            </p>
            <span style={{ fontSize: 12, color: "#1e293b" }}>
              {filtered.length} of {LIBS.length} shown
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
