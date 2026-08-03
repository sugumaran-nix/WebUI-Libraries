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
  { id: 1,  name: "Aceternity UI",      url: "ui.aceternity.com",                  cat: "animated",     desc: "Animated components built with Tailwind CSS and Framer Motion",                                          gem: false },
  { id: 2,  name: "Magic UI",           url: "magicui.design",                     cat: "animated",     desc: "50+ free, open-source animated components for React",                                                   gem: false },
  { id: 3,  name: "Motion Primitives",  url: "motion-primitives.com",              cat: "animated",     desc: "Copy-paste motion primitives for beautiful React interfaces",                                            gem: false },
  { id: 4,  name: "Eldora UI",          url: "eldoraui.site",                      cat: "animated",     desc: "Animated React components built with Framer Motion",                                                    gem: false },
  { id: 5,  name: "Cult UI",            url: "cult-ui.com",                        cat: "animated",     desc: "Crafted React components with dark-mode-first aesthetics",                                              gem: false },
  { id: 6,  name: "Animata",            url: "animata.design",                     cat: "animated",     desc: "Hand-crafted interaction and animation components",                                                      gem: false },
  { id: 7,  name: "UI Layout",          url: "ui-layout.com",                      cat: "animated",     desc: "Complex layout patterns with smooth animation support",                                                  gem: false },
  { id: 8,  name: "Lukacho UI",         url: "ui.lukacho.com",                     cat: "animated",     desc: "Minimal animated UI kit for modern apps",                                                               gem: false },
  { id: 9,  name: "ReactBits",          url: "reactbits.dev",                      cat: "animated",     desc: "Animated React bit-components for creative UIs",                                                        gem: true  },
  { id: 10, name: "SmoothUI",           url: "smoothui.dev",                       cat: "animated",     desc: "Ultra-smooth micro-interaction components for React",                                                    gem: true  },
  { id: 11, name: "Fancy Components",   url: "fancycomponents.dev",                cat: "animated",     desc: "Distinctive, delightful animated component collection",                                                  gem: true  },
  { id: 12, name: "CuiCui",             url: "cuicui.day",                         cat: "animated",     desc: "Daily component drops with polished motion design",                                                      gem: true  },
  { id: 13, name: "SyntaxUI",           url: "syntaxui.com",                       cat: "animated",     desc: "Dev-focused animated component library with code previews",                                              gem: true  },
  { id: 15, name: "UI Labs",            url: "uilabs.dev",                         cat: "animated",     desc: "Experimental UI components for the adventurous developer",                                               gem: true  },
  { id: 16, name: "shadcn/ui",          url: "ui.shadcn.com",                      cat: "shadcn",       desc: "The gold standard — re-usable components via CLI, your code to own",                                    gem: false },
  { id: 17, name: "21st.dev",           url: "21st.dev",                           cat: "shadcn",       desc: "The npm for design engineers — ship components in seconds",                                              gem: false },
  { id: 18, name: "Origin UI",          url: "originui.com",                       cat: "shadcn",       desc: "Beautiful shadcn components built with a design-first approach",                                         gem: false },
  { id: 19, name: "Shadcnblocks",       url: "shadcnblocks.com",                   cat: "shadcn",       desc: "Full page sections and blocks for shadcn projects",                                                     gem: false },
  { id: 20, name: "HextaUI",            url: "hextaui.com",                        cat: "shadcn",       desc: "Modern shadcn extensions with refined aesthetics",                                                       gem: true  },
  { id: 21, name: "KokonutUI",          url: "kokonutui.com",                      cat: "shadcn",       desc: "Accessible, production-ready shadcn component extensions",                                               gem: true  },
  { id: 22, name: "Bundui",             url: "bundui.io",                          cat: "shadcn",       desc: "Curated shadcn component bundles, ready to drop in",                                                    gem: true  },
  { id: 23, name: "Skiper UI",          url: "skiper-ui.com",                      cat: "shadcn",       desc: "24 free animated components on top of shadcn",                                                          gem: true  },
  { id: 24, name: "lndev/ui",           url: "ui.lndev.me",                        cat: "shadcn",       desc: "Indie-crafted shadcn extensions with unique personality",                                                gem: true  },
  { id: 25, name: "ReUI",               url: "reui.io",                            cat: "shadcn",       desc: "Enterprise-grade shadcn component extensions",                                                           gem: true  },
  { id: 26, name: "MynaUI",             url: "mynaui.com",                         cat: "shadcn",       desc: "Elegant shadcn components with consistent visual language",                                               gem: true  },
  { id: 27, name: "BadtzUI",            url: "badtz-ui.com",                       cat: "shadcn",       desc: "Core-free shadcn extensions, updated every week",                                                        gem: true  },
  { id: 28, name: "Nyxb UI",            url: "nyxbui.design",                      cat: "shadcn",       desc: "Dark-mode-first shadcn components with rich motion",                                                     gem: true  },
  { id: 79, name: "Kibo UI",            url: "kibo-ui.com",                        cat: "shadcn",       desc: "shadcn/ui registry with advanced niche components: color pickers, QR codes, drag-drop uploaders",        gem: true  },
  { id: 29, name: "DaisyUI",            url: "daisyui.com",                        cat: "tailwind",     desc: "The most popular Tailwind component library — 50+ components",                                           gem: false },
  { id: 30, name: "Flowbite",           url: "flowbite.com",                       cat: "tailwind",     desc: "Open-source Tailwind component library with Figma kit",                                                  gem: false },
  { id: 31, name: "Preline UI",         url: "preline.co",                         cat: "tailwind",     desc: "Fully responsive Tailwind HTML components and templates",                                                gem: false },
  { id: 32, name: "HyperUI",            url: "hyperui.dev",                        cat: "tailwind",     desc: "Free open-source Tailwind components for ecommerce and marketing",                                       gem: false },
  { id: 33, name: "Meraki UI",          url: "merakiui.com",                       cat: "tailwind",     desc: "Beautiful Tailwind UI components for your next project",                                                 gem: false },
  { id: 77, name: "Sailboat UI",        url: "sailboatui.com",                     cat: "tailwind",     desc: "150+ open-source Tailwind CSS components with Alpine.js interactivity",                                  gem: false },
  { id: 78, name: "TailGrids",          url: "tailgrids.com",                      cat: "tailwind",     desc: "600+ free React + Tailwind components, blocks, and templates for real-world products",                   gem: false },
  { id: 34, name: "FlyonUI",            url: "flyonui.com",                        cat: "tailwind",     desc: "Semantic Tailwind components built on DaisyUI and Alpine.js",                                            gem: true  },
  { id: 35, name: "Penguin UI",         url: "penguinui.com",                      cat: "tailwind",     desc: "Simple and accessible Tailwind components",                                                              gem: true  },
  { id: 36, name: "Tailkits",           url: "tailkits.com",                       cat: "tailwind",     desc: "Curated Tailwind component marketplace and collection",                                                  gem: true  },
  { id: 37, name: "Tailus HTML",        url: "html.tailus.io",                     cat: "tailwind",     desc: "Tailwind components with refined visual design standards",                                                gem: true  },
  { id: 38, name: "DevUI",              url: "devui.in",                           cat: "tailwind",     desc: "Developer-centric Tailwind components with code-first DX",                                               gem: true  },
  { id: 39, name: "Tailblocks",         url: "tailblocks.cc",                      cat: "tailwind",     desc: "Ready-to-use Tailwind CSS blocks for rapid prototyping",                                                 gem: true  },
  { id: 40, name: "Uiverse",            url: "uiverse.io",                         cat: "css",          desc: "Community-created CSS elements and components — thousands of them",                                       gem: false },
  { id: 41, name: "Dot Matrix",         url: "dotmatrix.zzzzshawn.cloud",          cat: "css",          desc: "Pixel-art dot matrix CSS backgrounds and effects",                                                       gem: false },
  { id: 42, name: "Shapes Gallery",     url: "shapes.gallery",                     cat: "css",          desc: "Pure CSS shape collection for creative backgrounds and flourishes",                                       gem: false },
  { id: 43, name: "RareUI",             url: "rareui.in",                          cat: "css",          desc: "Unique CSS components you won't find on mainstream lists",                                                gem: true  },
  { id: 44, name: "Indie Starter UI",   url: "ui.indie-starter.dev",              cat: "css",          desc: "Pure HTML/CSS starter components for indie hackers",                                                     gem: true  },
  { id: 45, name: "FlashUI",            url: "flashui.site",                       cat: "css",          desc: "Zero-install, paste-and-go CSS UI elements",                                                             gem: true  },
  { id: 46, name: "Ever UI",            url: "ever-ui.com",                        cat: "css",          desc: "Evergreen CSS components with long-term browser support",                                                 gem: true  },
  { id: 47, name: "Chakra Framer",      url: "chakraframer.com",                   cat: "css",          desc: "CSS motion templates inspired by Framer's design system",                                                gem: true  },
  { id: 48, name: "Ground Bossadizenith", url: "ground.bossadizenith.me",         cat: "css",          desc: "Experimental CSS ground-level components and effects",                                                    gem: true  },
  { id: 49, name: "HeroUI",             url: "heroui.com",                         cat: "react",        desc: "Beautiful React components (formerly NextUI) — 100+ components",                                         gem: false },
  { id: 50, name: "Mantine",            url: "mantine.dev",                        cat: "react",        desc: "Feature-rich React component library with 100+ hooks",                                                   gem: false },
  { id: 51, name: "Chakra UI",          url: "chakra-ui.com",                      cat: "react",        desc: "Accessible, composable React components with dark mode out of the box",                                  gem: false },
  { id: 52, name: "PrimeReact",         url: "primereact.org",                     cat: "react",        desc: "Ultimate React UI component suite — 90+ components",                                                     gem: false },
  { id: 53, name: "MUI",                url: "mui.com",                            cat: "react",        desc: "The most popular React UI framework — Material Design and beyond",                                        gem: false },
  { id: 54, name: "Ant Design",         url: "ant.design",                         cat: "react",        desc: "Enterprise-grade React UI library from Alibaba",                                                         gem: false },
  { id: 75, name: "Tremor",             url: "tremor.so",                          cat: "react",        desc: "35+ open-source React components for dashboards and data visualization",                                  gem: false },
  { id: 80, name: "Fluent UI",          url: "react.fluentui.dev",                cat: "react",        desc: "Microsoft's open-source React library with 950+ cross-platform components",                               gem: false },
  { id: 81, name: "Blueprint",          url: "blueprintjs.com",                    cat: "react",        desc: "Palantir's React UI toolkit optimized for data-dense desktop applications",                               gem: false },
  { id: 82, name: "Semantic UI React",  url: "react.semantic-ui.com",             cat: "react",        desc: "Human-friendly component APIs with 100+ declarative React components",                                    gem: false },
  { id: 83, name: "CoreUI React",       url: "coreui.io/react",                   cat: "react",        desc: "Bootstrap-based enterprise React library with admin dashboard templates",                                  gem: false },
  { id: 85, name: "React Bootstrap",    url: "react-bootstrap.github.io",         cat: "react",        desc: "Bootstrap rebuilt from scratch as true React components — no jQuery",                                     gem: false },
  { id: 55, name: "Gluestack",          url: "gluestack.io",                       cat: "react",        desc: "Fully free React + React Native component library",                                                       gem: true  },
  { id: 56, name: "React Suite",        url: "rsuitejs.com",                       cat: "react",        desc: "Suite of React components for enterprise applications",                                                   gem: true  },
  { id: 57, name: "Grommet",            url: "v2.grommet.io",                      cat: "react",        desc: "Accessibility-first React library, HPE-backed and battle-tested",                                         gem: true  },
  { id: 58, name: "Radix UI",           url: "radix-ui.com",                       cat: "headless",     desc: "Unstyled, accessible components for building high-quality design systems",                                gem: false },
  { id: 59, name: "Headless UI",        url: "headlessui.com",                     cat: "headless",     desc: "Completely unstyled, fully accessible UI components by Tailwind Labs",                                   gem: false },
  { id: 60, name: "Base UI",            url: "base-ui.com",                        cat: "headless",     desc: "Unstyled React components from the MUI team — actively maintained Radix alternative",                    gem: false },
  { id: 61, name: "React Aria",         url: "react-spectrum.adobe.com/react-aria", cat: "headless",   desc: "Adobe's collection of React Hooks for accessible UI primitives",                                          gem: false },
  { id: 84, name: "Ark UI",             url: "ark-ui.com",                         cat: "headless",     desc: "45+ headless, zero-style, framework-agnostic accessible UI primitives",                                   gem: true  },
  { id: 14, name: "Inspira UI",         url: "inspira-ui.com",                     cat: "multi",        desc: "Animated component library for Vue developers",                                                           gem: true  },
  { id: 62, name: "shadcn-svelte",      url: "shadcn-svelte.com",                  cat: "multi",        desc: "shadcn/ui ported to Svelte — all the power, native syntax",                                              gem: true  },
  { id: 63, name: "Flowbite Svelte",    url: "flowbite-svelte.com",                cat: "multi",        desc: "Flowbite component library for Svelte projects",                                                         gem: true  },
  { id: 76, name: "Float UI",           url: "floatui.com",                        cat: "multi",        desc: "Free multi-framework UI components — React, Vue, Svelte, and plain HTML",                                gem: false },
  { id: 64, name: "Vuetify",            url: "vuetifyjs.com",                      cat: "multi",        desc: "Material Design component framework for Vue — 80+ components",                                            gem: false },
  { id: 65, name: "PrimeVue",           url: "primevue.org",                       cat: "multi",        desc: "The ultimate Vue UI component library — 90+ components",                                                  gem: true  },
  { id: 66, name: "Untitled UI React",  url: "untitledui.com/react",               cat: "collections",  desc: "React implementation of the Untitled UI Figma design system",                                             gem: false },
  { id: 67, name: "Tailark",            url: "tailark.com",                        cat: "collections",  desc: "Curated Tailwind template marketplace with high-quality sections",                                        gem: false },
  { id: 68, name: "React Keep Design",  url: "react.keepdesign.io",                cat: "collections",  desc: "Design-driven React component collection with Figma support",                                             gem: true  },
  { id: 70, name: "Pattern Craft",      url: "patterncraft.dev",                   cat: "tools",        desc: "100+ CSS and Tailwind background patterns, copy-paste ready",                                             gem: true  },
  { id: 71, name: "Gradienty",          url: "gradienty.codes",                    cat: "tools",        desc: "CSS gradient generator and library with one-click copy",                                                  gem: true  },
  { id: 72, name: "Lordicon",           url: "lordicon.com",                       cat: "tools",        desc: "Animated Lottie icons with free tier — 1000+ icons",                                                     gem: true  },
  { id: 73, name: "Lucide Icons",       url: "lucide.dev",                         cat: "tools",        desc: "1000+ open-source icons, consistent and MIT-licensed",                                                   gem: false },
];

const CAT_META = {
  animated:    { label: "Animated",    darkBg: "rgba(139,92,246,0.15)",  darkText: "#c4b5fd", darkDot: "#8b5cf6",  lightBg: "rgba(139,92,246,0.1)",  lightText: "#7c3aed", lightDot: "#7c3aed"  },
  shadcn:      { label: "shadcn",      darkBg: "rgba(34,197,94,0.12)",   darkText: "#86efac", darkDot: "#22c55e",  lightBg: "rgba(22,163,74,0.1)",   lightText: "#15803d", lightDot: "#16a34a"  },
  tailwind:    { label: "Tailwind",    darkBg: "rgba(14,165,233,0.13)",  darkText: "#7dd3fc", darkDot: "#0ea5e9",  lightBg: "rgba(2,132,199,0.1)",   lightText: "#0369a1", lightDot: "#0284c7"  },
  css:         { label: "CSS / SVG",   darkBg: "rgba(251,146,60,0.13)",  darkText: "#fdba74", darkDot: "#f97316",  lightBg: "rgba(234,88,12,0.1)",   lightText: "#c2410c", lightDot: "#ea580c"  },
  react:       { label: "React",       darkBg: "rgba(96,165,250,0.13)",  darkText: "#93c5fd", darkDot: "#60a5fa",  lightBg: "rgba(37,99,235,0.1)",   lightText: "#1d4ed8", lightDot: "#2563eb"  },
  headless:    { label: "Headless",    darkBg: "rgba(248,113,113,0.13)", darkText: "#fca5a5", darkDot: "#ef4444",  lightBg: "rgba(220,38,38,0.09)",  lightText: "#b91c1c", lightDot: "#dc2626"  },
  multi:       { label: "Vue / Svelte",darkBg: "rgba(52,211,153,0.12)",  darkText: "#6ee7b7", darkDot: "#34d399",  lightBg: "rgba(5,150,105,0.1)",   lightText: "#047857", lightDot: "#059669"  },
  collections: { label: "Collection",  darkBg: "rgba(250,204,21,0.12)",  darkText: "#fde047", darkDot: "#eab308",  lightBg: "rgba(161,98,7,0.1)",    lightText: "#92400e", lightDot: "#b45309"  },
  tools:       { label: "Tool",        darkBg: "rgba(232,121,249,0.13)", darkText: "#f0abfc", darkDot: "#d946ef",  lightBg: "rgba(147,51,234,0.1)",  lightText: "#7e22ce", lightDot: "#9333ea"  },
};

export default function App() {
  const [active, setActive]     = useState("all");
  const [query, setQuery]       = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [dark, setDark]         = useState(true);

  const D = dark;

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

  // theme tokens
  const t = {
    bg:           D ? "#0d0d14"             : "#f8f9fb",
    headerBg:     D ? "#0d0d14"             : "#ffffff",
    headerBorder: D ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    cardBg:       D ? "#13131e"             : "#ffffff",
    cardBorder:   D ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)",
    cardHoverBg:  D ? "#1a1a2e"             : "#f1f5ff",
    cardHoverBorder: D ? "rgba(139,92,246,0.35)" : "rgba(99,102,241,0.35)",
    titleColor:   D ? "#f1f5f9"             : "#0f172a",
    titleHover:   D ? "#ffffff"             : "#1e1b4b",
    descColor:    D ? "#64748b"             : "#4b5563",
    descHover:    D ? "#94a3b8"             : "#374151",
    urlColor:     D ? "#334155"             : "#9ca3af",
    eyebrow:      D ? "#6b7280"             : "#6b7280",
    tabBg:        D ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    tabActiveBg:  D ? "rgba(139,92,246,0.2)"   : "rgba(99,102,241,0.12)",
    tabColor:     D ? "#64748b"             : "#6b7280",
    tabActiveColor: D ? "#c4b5fd"           : "#4f46e5",
    tabActiveBorder: D ? "rgba(139,92,246,0.4)" : "rgba(99,102,241,0.4)",
    searchBg:     D ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    searchBorder: D ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.12)",
    searchColor:  D ? "#e2e8f0"             : "#111827",
    searchPlaceholder: D ? "#4b5563"        : "#9ca3af",
    arrowColor:   D ? "#94a3b8"             : "#9ca3af",
    arrowHover:   D ? "#c4b5fd"             : "#6366f1",
    footerText:   D ? "#334155"             : "#9ca3af",
    countColor:   D ? "#1e293b"             : "#d1d5db",
    glow:         D ? "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(139,92,246,0.14) 0%, transparent 70%)" : "none",
    gemBg:        D ? "rgba(251,191,36,0.1)"  : "rgba(217,119,6,0.08)",
    gemText:      D ? "#fbbf24"             : "#b45309",
    gemBorder:    D ? "rgba(251,191,36,0.25)" : "rgba(217,119,6,0.25)",
    toggleBg:     D ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    toggleBorder: D ? "rgba(255,255,255,0.1)"  : "rgba(0,0,0,0.1)",
    h1Grad:       D ? "linear-gradient(135deg,#f1f5f9 20%,#94a3b8 100%)" : "linear-gradient(135deg,#1e1b4b 0%,#4338ca 100%)",
    emptyColor:   D ? "#334155"             : "#d1d5db",
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.titleColor, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", transition: "background 0.25s, color 0.25s" }}>

      {/* ambient glow */}
      {D && <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: t.glow }} />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HEADER ── */}
        <header style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, padding: "0 2rem", transition: "background 0.25s, border-color 0.25s" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 0 2rem" }}>

            {/* top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1.25rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.55rem" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#8b5cf6", boxShadow: D ? "0 0 10px #8b5cf6" : "none", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: t.eyebrow, fontWeight: 600 }}>Free & Open Source</span>
                </div>
                <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.75rem)", fontWeight: 800, margin: 0, letterSpacing: "-0.035em", lineHeight: 1.1, background: t.h1Grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  UI Component Libraries
                </h1>
                <p style={{ marginTop: "0.65rem", color: t.descColor, fontSize: "0.95rem", lineHeight: 1.65, maxWidth: 460 }}>
                  {LIBS.length} curated resources — animated kits, shadcn extensions, Tailwind blocks, headless primitives and more.
                </p>
              </div>

              {/* right controls */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", alignItems: "flex-end" }}>
                {/* theme toggle */}
                <button
                  onClick={() => setDark(d => !d)}
                  style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.4rem 0.85rem", borderRadius: 999, border: `1px solid ${t.toggleBorder}`, background: t.toggleBg, color: t.eyebrow, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
                >
                  {D ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  )}
                  {D ? "Light" : "Dark"}
                </button>

                {/* search */}
                <div style={{ position: "relative", width: 240 }}>
                  <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.searchPlaceholder }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ width: "100%", padding: "0.55rem 1rem 0.55rem 2.25rem", background: t.searchBg, border: `1px solid ${t.searchBorder}`, borderRadius: 10, color: t.searchColor, fontSize: 13.5, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, background 0.25s" }}
                    onFocus={e => e.target.style.borderColor = D ? "rgba(139,92,246,0.5)" : "rgba(99,102,241,0.5)"}
                    onBlur={e => e.target.style.borderColor = t.searchBorder}
                  />
                </div>
              </div>
            </div>

            {/* category tabs */}
            <div style={{ display: "flex", gap: "0.3rem", marginTop: "2rem", flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => {
                const isActive = active === cat.id;
                return (
                  <button key={cat.id} onClick={() => setActive(cat.id)} style={{ padding: "0.38rem 0.85rem", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.15s", background: isActive ? t.tabActiveBg : t.tabBg, color: isActive ? t.tabActiveColor : t.tabColor, outline: isActive ? `1px solid ${t.tabActiveBorder}` : "1px solid transparent" }}>
                    {cat.label}
                    <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.55 }}>{counts[cat.id] || 0}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </header>

        {/* ── LIST ── */}
        <main style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 2rem 5rem" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "6rem 0", color: t.emptyColor }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>—</div>
              No libraries match your search.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {filtered.map(lib => {
                const m = CAT_META[lib.cat] || CAT_META.tools;
                const catBg   = D ? m.darkBg   : m.lightBg;
                const catText = D ? m.darkText  : m.lightText;
                const catDot  = D ? m.darkDot   : m.lightDot;
                const isHov   = hoveredId === lib.id;

                return (
                  <a
                    key={lib.id}
                    href={`https://${lib.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredId(lib.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: "1.25rem",
                      padding: "1rem 1.25rem",
                      background: isHov ? t.cardHoverBg : t.cardBg,
                      border: `1px solid ${isHov ? t.cardHoverBorder : t.cardBorder}`,
                      borderRadius: 14,
                      textDecoration: "none",
                      cursor: "pointer",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    {/* category dot */}
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: catDot, flexShrink: 0, boxShadow: isHov ? `0 0 8px ${catDot}` : "none", transition: "box-shadow 0.15s" }} />

                    {/* main content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.95rem", fontWeight: 650, color: isHov ? t.titleHover : t.titleColor, transition: "color 0.15s", letterSpacing: "-0.01em" }}>
                          {lib.name}
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: 5, background: catBg, color: catText }}>
                          {m.label}
                        </span>
                        {lib.gem && (
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: 5, background: t.gemBg, color: t.gemText, border: `1px solid ${t.gemBorder}` }}>
                            ◆ Gem
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: isHov ? t.descHover : t.descColor, lineHeight: 1.55, transition: "color 0.15s" }}>
                        {lib.desc}
                      </div>
                      <div style={{ marginTop: "0.3rem", fontSize: 11.5, color: t.urlColor, fontFamily: "'SF Mono','Fira Code',monospace" }}>
                        {lib.url}
                      </div>
                    </div>

                    {/* arrow */}
                    <div style={{ flexShrink: 0, color: isHov ? t.arrowHover : t.arrowColor, opacity: isHov ? 1 : 0.4, transform: isHov ? "translate(2px,-2px)" : "translate(0,0)", transition: "all 0.15s" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M17 7H7M17 7v10"/>
                      </svg>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* footer */}
          <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: `1px solid ${t.headerBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ margin: 0, fontSize: 12.5, color: t.footerText }}>
              All {LIBS.length} libraries are free / open-source. ◆ marks hidden gems.
            </p>
            <span style={{ fontSize: 12, color: t.countColor }}>
              {filtered.length} of {LIBS.length} shown
            </span>
          </div>
        </main>

      </div>
    </div>
  );
}
