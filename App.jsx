import { useState, useMemo, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
// Ranked best-first within each category

const CATEGORIES = [
  { id: "all",         label: "All" },
  { id: "animated",   label: "Animated & Motion" },
  { id: "shadcn",     label: "shadcn Ecosystem" },
  { id: "tailwind",   label: "Tailwind CSS" },
  { id: "css",        label: "CSS / HTML / SVG" },
  { id: "react",      label: "Full React" },
  { id: "headless",   label: "Headless" },
  { id: "multi",      label: "Vue / Svelte" },
  { id: "collections",label: "Collections" },
  { id: "tools",      label: "Tools" },
];

const CAT_META = {
  animated:    { label: "Animated & Motion",  dot: "#8b5cf6", darkBg: "rgba(139,92,246,0.13)", darkText: "#c4b5fd", lightBg: "rgba(139,92,246,0.09)", lightText: "#7c3aed" },
  shadcn:      { label: "shadcn Ecosystem",   dot: "#22c55e", darkBg: "rgba(34,197,94,0.12)",  darkText: "#86efac", lightBg: "rgba(22,163,74,0.09)",  lightText: "#15803d" },
  tailwind:    { label: "Tailwind CSS",       dot: "#0ea5e9", darkBg: "rgba(14,165,233,0.12)", darkText: "#7dd3fc", lightBg: "rgba(2,132,199,0.09)",  lightText: "#0369a1" },
  css:         { label: "CSS / HTML / SVG",   dot: "#f97316", darkBg: "rgba(251,146,60,0.12)", darkText: "#fdba74", lightBg: "rgba(234,88,12,0.09)",  lightText: "#c2410c" },
  react:       { label: "Full React",         dot: "#60a5fa", darkBg: "rgba(96,165,250,0.12)", darkText: "#93c5fd", lightBg: "rgba(37,99,235,0.09)",  lightText: "#1d4ed8" },
  headless:    { label: "Headless",           dot: "#ef4444", darkBg: "rgba(248,113,113,0.12)",darkText: "#fca5a5", lightBg: "rgba(220,38,38,0.08)",  lightText: "#b91c1c" },
  multi:       { label: "Vue / Svelte",       dot: "#34d399", darkBg: "rgba(52,211,153,0.11)", darkText: "#6ee7b7", lightBg: "rgba(5,150,105,0.09)",  lightText: "#047857" },
  collections: { label: "Collections",        dot: "#eab308", darkBg: "rgba(250,204,21,0.11)", darkText: "#fde047", lightBg: "rgba(161,98,7,0.09)",   lightText: "#92400e" },
  tools:       { label: "Tools",              dot: "#d946ef", darkBg: "rgba(232,121,249,0.12)",darkText: "#f0abfc", lightBg: "rgba(147,51,234,0.09)", lightText: "#7e22ce" },
};

const LIBS = [
  // ── Animated & Motion — ranked best-first
  { id: 1,  name: "Aceternity UI",       url: "ui.aceternity.com",                  cat: "animated",     desc: "Production-grade animated components built with Tailwind + Framer Motion. Best for hero sections and landing pages." },
  { id: 2,  name: "Magic UI",            url: "magicui.design",                     cat: "animated",     desc: "50+ open-source animated React components. Pairs perfectly with shadcn/ui projects." },
  { id: 3,  name: "Motion Primitives",   url: "motion-primitives.com",              cat: "animated",     desc: "Fine-grained Framer Motion primitives — copy the motion logic, own the styling." },
  { id: 9,  name: "ReactBits",           url: "reactbits.dev",                      cat: "animated",     desc: "Animated bit-components for creative UIs. No install, pure copy-paste." },
  { id: 13, name: "SyntaxUI",            url: "syntaxui.com",                       cat: "animated",     desc: "Dev-focused animated library with live code previews and dark-mode-first aesthetics." },
  { id: 12, name: "CuiCui",             url: "cuicui.day",                         cat: "animated",     desc: "Daily animated component drops with polished motion design and clean code." },
  { id: 11, name: "Fancy Components",   url: "fancycomponents.dev",                cat: "animated",     desc: "Distinctive, delightful animated components. Unique effects you won't find elsewhere." },
  { id: 10, name: "SmoothUI",           url: "smoothui.dev",                       cat: "animated",     desc: "Ultra-smooth micro-interaction components. Subtle, production-ready animations." },
  { id: 5,  name: "Cult UI",            url: "cult-ui.com",                        cat: "animated",     desc: "Dark-mode-first React components with crafted interaction design." },
  { id: 4,  name: "Eldora UI",          url: "eldoraui.site",                      cat: "animated",     desc: "Animated React components built with Framer Motion, open-source." },
  { id: 6,  name: "Animata",            url: "animata.design",                     cat: "animated",     desc: "Hand-crafted interaction and animation components for expressive UIs." },
  { id: 7,  name: "UI Layout",          url: "ui-layout.com",                      cat: "animated",     desc: "Complex animated layout patterns — grids, masonry, carousels with smooth motion." },
  { id: 8,  name: "Lukacho UI",         url: "ui.lukacho.com",                     cat: "animated",     desc: "Minimal animated UI kit for modern apps. Small footprint, clean output." },
  { id: 15, name: "UI Labs",            url: "uilabs.dev",                         cat: "animated",     desc: "Experimental UI components for the adventurous developer." },

  // ── shadcn Ecosystem — ranked best-first
  { id: 16, name: "shadcn/ui",          url: "ui.shadcn.com",                      cat: "shadcn",       desc: "The foundation — re-usable components installed via CLI. You own the code. Non-negotiable in any modern Next.js stack." },
  { id: 17, name: "21st.dev",           url: "21st.dev",                           cat: "shadcn",       desc: "The npm for design engineers. Premium shadcn-compatible components — the best extension source." },
  { id: 18, name: "Origin UI",          url: "originui.com",                       cat: "shadcn",       desc: "Design-first shadcn component extensions. Exceptional quality, wide component range." },
  { id: 20, name: "HextaUI",            url: "hextaui.com",                        cat: "shadcn",       desc: "Modern, dark-first shadcn extensions with refined aesthetics and solid docs." },
  { id: 21, name: "KokonutUI",          url: "kokonutui.com",                      cat: "shadcn",       desc: "Accessible, production-ready shadcn extensions. Consistent visual language." },
  { id: 19, name: "Shadcnblocks",       url: "shadcnblocks.com",                   cat: "shadcn",       desc: "Full page sections and blocks — hero, pricing, FAQ, features — drop-in ready." },
  { id: 26, name: "MynaUI",             url: "mynaui.com",                         cat: "shadcn",       desc: "Elegant shadcn components with consistent visual language across all components." },
  { id: 27, name: "BadtzUI",            url: "badtz-ui.com",                       cat: "shadcn",       desc: "Core-free shadcn extensions, updated weekly with new components." },
  { id: 28, name: "Nyxb UI",            url: "nyxbui.design",                      cat: "shadcn",       desc: "Dark-mode-first shadcn components with rich motion and Framer integration." },
  { id: 22, name: "Bundui",             url: "bundui.io",                          cat: "shadcn",       desc: "Curated shadcn component bundles, ready to drop in." },
  { id: 23, name: "Skiper UI",          url: "skiper-ui.com",                      cat: "shadcn",       desc: "24 free animated components on top of shadcn. Niche but high quality." },
  { id: 25, name: "ReUI",               url: "reui.io",                            cat: "shadcn",       desc: "Enterprise-grade shadcn extensions with data-heavy component support." },
  { id: 24, name: "lndev/ui",           url: "ui.lndev.me",                        cat: "shadcn",       desc: "Indie-crafted shadcn extensions with unique personality." },
  { id: 79, name: "Kibo UI",            url: "kibo-ui.com",                        cat: "shadcn",       desc: "Advanced niche components: color pickers, QR codes, drag-drop uploaders — fills shadcn gaps." },

  // ── Tailwind CSS — ranked best-first
  { id: 29, name: "DaisyUI",            url: "daisyui.com",                        cat: "tailwind",     desc: "The most popular Tailwind component library — 50+ semantic components. Best for rapid prototyping." },
  { id: 30, name: "Flowbite",           url: "flowbite.com",                       cat: "tailwind",     desc: "Open-source Tailwind components with a solid Figma kit and 400+ components." },
  { id: 31, name: "Preline UI",         url: "preline.co",                         cat: "tailwind",     desc: "Fully responsive Tailwind HTML components and templates for SaaS-style layouts." },
  { id: 32, name: "HyperUI",            url: "hyperui.dev",                        cat: "tailwind",     desc: "Free open-source Tailwind components for ecommerce, marketing, and application UIs." },
  { id: 78, name: "TailGrids",          url: "tailgrids.com",                      cat: "tailwind",     desc: "600+ free React + Tailwind components, blocks and templates for real-world products." },
  { id: 77, name: "Sailboat UI",        url: "sailboatui.com",                     cat: "tailwind",     desc: "150+ open-source Tailwind components with Alpine.js interactivity." },
  { id: 33, name: "Meraki UI",          url: "merakiui.com",                       cat: "tailwind",     desc: "Beautiful Tailwind UI components, RTL-support, easy to copy-paste." },
  { id: 34, name: "FlyonUI",            url: "flyonui.com",                        cat: "tailwind",     desc: "Semantic Tailwind components built on DaisyUI and Alpine.js — best of both." },
  { id: 37, name: "Tailus HTML",        url: "html.tailus.io",                     cat: "tailwind",     desc: "Tailwind components with refined visual standards — great for premium-looking UIs." },
  { id: 36, name: "Tailkits",           url: "tailkits.com",                       cat: "tailwind",     desc: "Curated Tailwind component marketplace with high-quality sections and templates." },
  { id: 35, name: "Penguin UI",         url: "penguinui.com",                      cat: "tailwind",     desc: "Simple and accessible Tailwind components. Good for accessibility-first projects." },
  { id: 38, name: "DevUI",              url: "devui.in",                           cat: "tailwind",     desc: "Developer-centric Tailwind components with code-first DX." },
  { id: 39, name: "Tailblocks",         url: "tailblocks.cc",                      cat: "tailwind",     desc: "Ready-to-use Tailwind CSS blocks for rapid prototyping. Simple and effective." },

  // ── CSS / HTML / SVG — ranked best-first
  { id: 40, name: "Uiverse",            url: "uiverse.io",                         cat: "css",          desc: "Community-created CSS elements — thousands of buttons, cards, loaders, toggles. Best source for pure CSS effects." },
  { id: 42, name: "Shapes Gallery",     url: "shapes.gallery",                     cat: "css",          desc: "Pure CSS shape collection for creative backgrounds, dividers and flourishes." },
  { id: 41, name: "Dot Matrix",         url: "dotmatrix.zzzzshawn.cloud",          cat: "css",          desc: "Pixel-art dot matrix CSS backgrounds and effects. Distinctive retro aesthetic." },
  { id: 43, name: "RareUI",             url: "rareui.in",                          cat: "css",          desc: "Unique CSS components you won't find on mainstream lists. High originality." },
  { id: 45, name: "FlashUI",            url: "flashui.site",                       cat: "css",          desc: "Zero-install, paste-and-go CSS UI elements. Fast to use." },
  { id: 44, name: "Indie Starter UI",   url: "ui.indie-starter.dev",              cat: "css",          desc: "Pure HTML/CSS starter components for indie hackers and side projects." },
  { id: 46, name: "Ever UI",            url: "ever-ui.com",                        cat: "css",          desc: "Evergreen CSS components with long-term browser support." },
  { id: 47, name: "Chakra Framer",      url: "chakraframer.com",                   cat: "css",          desc: "CSS motion templates inspired by Framer's design system." },
  { id: 48, name: "Ground Bossadizenith", url: "ground.bossadizenith.me",         cat: "css",          desc: "Experimental CSS ground-level components and effects." },

  // ── Full React — ranked best-first
  { id: 53, name: "MUI",                url: "mui.com",                            cat: "react",        desc: "The most popular React UI framework — Material Design and beyond. Massive ecosystem." },
  { id: 54, name: "Ant Design",         url: "ant.design",                         cat: "react",        desc: "Enterprise-grade React UI from Alibaba. Best for data-heavy admin dashboards." },
  { id: 50, name: "Mantine",            url: "mantine.dev",                        cat: "react",        desc: "Feature-rich React library with 100+ components and 50+ hooks. Excellent DX." },
  { id: 49, name: "HeroUI",             url: "heroui.com",                         cat: "react",        desc: "Beautiful React components (formerly NextUI) — 100+ components with dark mode built in." },
  { id: 51, name: "Chakra UI",          url: "chakra-ui.com",                      cat: "react",        desc: "Accessible, composable React components. Excellent theming system." },
  { id: 52, name: "PrimeReact",         url: "primereact.org",                     cat: "react",        desc: "Ultimate React UI suite — 90+ components including complex data tables and charts." },
  { id: 80, name: "Fluent UI",          url: "react.fluentui.dev",                cat: "react",        desc: "Microsoft's open-source React library with 950+ cross-platform components." },
  { id: 81, name: "Blueprint",          url: "blueprintjs.com",                    cat: "react",        desc: "Palantir's React UI toolkit optimized for data-dense desktop applications." },
  { id: 75, name: "Tremor",             url: "tremor.so",                          cat: "react",        desc: "35+ open-source React components for dashboards and data visualization." },
  { id: 85, name: "React Bootstrap",    url: "react-bootstrap.github.io",         cat: "react",        desc: "Bootstrap rebuilt from scratch as true React components — no jQuery dependency." },
  { id: 82, name: "Semantic UI React",  url: "react.semantic-ui.com",             cat: "react",        desc: "Human-friendly component APIs with 100+ declarative React components." },
  { id: 83, name: "CoreUI React",       url: "coreui.io/react",                   cat: "react",        desc: "Bootstrap-based enterprise React library with admin dashboard templates." },
  { id: 55, name: "Gluestack",          url: "gluestack.io",                       cat: "react",        desc: "Fully free React + React Native component library — good for cross-platform." },
  { id: 56, name: "React Suite",        url: "rsuitejs.com",                       cat: "react",        desc: "Suite of React components for enterprise applications." },
  { id: 57, name: "Grommet",            url: "v2.grommet.io",                      cat: "react",        desc: "Accessibility-first React library, HPE-backed and battle-tested." },

  // ── Headless — ranked best-first
  { id: 58, name: "Radix UI",           url: "radix-ui.com",                       cat: "headless",     desc: "The standard — unstyled, fully accessible primitives. shadcn/ui is built on this." },
  { id: 59, name: "Headless UI",        url: "headlessui.com",                     cat: "headless",     desc: "Completely unstyled, fully accessible UI components by Tailwind Labs. Tight Tailwind integration." },
  { id: 61, name: "React Aria",         url: "react-spectrum.adobe.com/react-aria", cat: "headless",   desc: "Adobe's collection of React Hooks for accessible UI primitives. Best-in-class accessibility." },
  { id: 60, name: "Base UI",            url: "base-ui.com",                        cat: "headless",     desc: "Unstyled React components from the MUI team — actively maintained Radix alternative." },
  { id: 84, name: "Ark UI",             url: "ark-ui.com",                         cat: "headless",     desc: "45+ headless, zero-style, framework-agnostic accessible UI primitives." },

  // ── Vue / Svelte / Multi-framework — ranked best-first
  { id: 64, name: "Vuetify",            url: "vuetifyjs.com",                      cat: "multi",        desc: "The most popular Vue UI framework — 80+ Material Design components, massive community." },
  { id: 65, name: "PrimeVue",           url: "primevue.org",                       cat: "multi",        desc: "Ultimate Vue UI component library — 90+ components, excellent data grid support." },
  { id: 76, name: "Float UI",           url: "floatui.com",                        cat: "multi",        desc: "Free multi-framework UI — React, Vue, Svelte, and plain HTML. Best cross-framework option." },
  { id: 62, name: "shadcn-svelte",      url: "shadcn-svelte.com",                  cat: "multi",        desc: "shadcn/ui ported to Svelte — all the power with native Svelte syntax." },
  { id: 63, name: "Flowbite Svelte",    url: "flowbite-svelte.com",                cat: "multi",        desc: "Flowbite component library ported to Svelte, 60+ components." },
  { id: 14, name: "Inspira UI",         url: "inspira-ui.com",                     cat: "multi",        desc: "Animated component library for Vue — the Aceternity UI equivalent for Vue." },

  // ── Collections — ranked best-first
  { id: 66, name: "Untitled UI React",  url: "untitledui.com/react",               cat: "collections",  desc: "React implementation of the Untitled UI Figma design system — premium quality reference." },
  { id: 67, name: "Tailark",            url: "tailark.com",                        cat: "collections",  desc: "Curated Tailwind template marketplace with high-quality landing page sections." },
  { id: 68, name: "React Keep Design",  url: "react.keepdesign.io",                cat: "collections",  desc: "Design-driven React component collection with Figma file support." },

  // ── Tools — ranked best-first
  { id: 73, name: "Lucide Icons",       url: "lucide.dev",                         cat: "tools",        desc: "1000+ open-source icons, MIT licensed. The default for shadcn/ui projects — use this." },
  { id: 70, name: "Pattern Craft",      url: "patterncraft.dev",                   cat: "tools",        desc: "100+ CSS and Tailwind background patterns — dot grids, lines, noise. Copy-paste ready." },
  { id: 71, name: "Gradienty",          url: "gradienty.codes",                    cat: "tools",        desc: "CSS gradient generator and library with one-click copy. Fast and practical." },
  { id: 72, name: "Lordicon",           url: "lordicon.com",                       cat: "tools",        desc: "Animated Lottie icons — 1000+ icons with free tier. Best for interactive micro-animations." },
];

// ─── THEME ───────────────────────────────────────────────────────────────────
function getTheme(D) {
  return {
    bg:              D ? "#0d0d14"                  : "#f4f5f7",
    headerBg:        D ? "rgba(13,13,20,0.85)"      : "rgba(255,255,255,0.85)",
    headerBorder:    D ? "rgba(255,255,255,0.07)"   : "rgba(0,0,0,0.08)",
    cardBg:          D ? "#111118"                  : "#ffffff",
    cardBorder:      D ? "rgba(255,255,255,0.06)"   : "rgba(0,0,0,0.07)",
    cardHoverBg:     D ? "#16161f"                  : "#f5f3ff",
    cardHoverBorder: D ? "rgba(139,92,246,0.4)"     : "rgba(99,102,241,0.4)",
    titleColor:      D ? "#e2e8f0"                  : "#111827",
    titleHover:      D ? "#ffffff"                  : "#1e1b4b",
    descColor:       D ? "#4b5563"                  : "#6b7280",
    descHover:       D ? "#94a3b8"                  : "#374151",
    urlColor:        D ? "#2d3748"                  : "#9ca3af",
    eyebrow:         D ? "#6b7280"                  : "#6b7280",
    sectionLabel:    D ? "#3d3d56"                  : "#c4c9d4",
    sectionBorder:   D ? "rgba(255,255,255,0.05)"   : "rgba(0,0,0,0.07)",
    tabBg:           D ? "rgba(255,255,255,0.04)"   : "rgba(0,0,0,0.04)",
    tabActiveBg:     D ? "rgba(139,92,246,0.18)"    : "rgba(99,102,241,0.1)",
    tabColor:        D ? "#52526b"                  : "#9ca3af",
    tabActiveColor:  D ? "#c4b5fd"                  : "#4f46e5",
    tabActiveBorder: D ? "rgba(139,92,246,0.45)"    : "rgba(99,102,241,0.45)",
    searchBg:        D ? "rgba(255,255,255,0.04)"   : "rgba(0,0,0,0.04)",
    searchBorder:    D ? "rgba(255,255,255,0.08)"   : "rgba(0,0,0,0.1)",
    searchColor:     D ? "#e2e8f0"                  : "#111827",
    arrowColor:      D ? "#2d3748"                  : "#d1d5db",
    arrowHover:      D ? "#a78bfa"                  : "#6366f1",
    footerText:      D ? "#252535"                  : "#d1d5db",
    toggleBg:        D ? "rgba(255,255,255,0.06)"   : "rgba(0,0,0,0.05)",
    toggleBorder:    D ? "rgba(255,255,255,0.09)"   : "rgba(0,0,0,0.1)",
    toggleColor:     D ? "#6b7280"                  : "#6b7280",
    h1Grad:          D ? "linear-gradient(135deg,#f1f5f9 0%,#94a3b8 100%)" : "linear-gradient(135deg,#1e1b4b 0%,#4338ca 100%)",
    emptyIcon:       D ? "#1e1e2e"                  : "#e5e7eb",
    emptyText:       D ? "#2d3748"                  : "#d1d5db",
    glow:            D ? "radial-gradient(ellipse 80% 30% at 50% -2%, rgba(139,92,246,0.12) 0%, transparent 70%)" : "none",
    rankColor:       D ? "#1e1e2e"                  : "#e5e7eb",
    faviconBg:       D ? "rgba(255,255,255,0.04)"   : "rgba(0,0,0,0.04)",
  };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function FaviconAvatar({ url, name, dark }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]  = useState(false);
  const domain = url.replace(/^https?:\/\//, "").split("/")[0];
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    }}>
      {!error ? (
        <img
          src={faviconUrl}
          alt=""
          width={18} height={18}
          style={{ display: loaded ? "block" : "none", imageRendering: "crisp-edges" }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : null}
      {(!loaded || error) && (
        <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "#4b5563" : "#9ca3af", letterSpacing: "-0.02em" }}>
          {initials}
        </span>
      )}
    </div>
  );
}

function LibCard({ lib, dark, hovered, onHover }) {
  const t = getTheme(dark);
  const m = CAT_META[lib.cat];
  const catBg   = dark ? m.darkBg   : m.lightBg;
  const catText = dark ? m.darkText  : m.lightText;

  return (
    <a
      href={`https://${lib.url}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => onHover(lib.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        display: "flex", alignItems: "flex-start", gap: "0.85rem",
        padding: "0.95rem 1rem",
        background: hovered ? t.cardHoverBg : t.cardBg,
        border: `1px solid ${hovered ? t.cardHoverBorder : t.cardBorder}`,
        borderRadius: 12,
        textDecoration: "none",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s, transform 0.12s",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      {/* favicon */}
      <FaviconAvatar url={lib.url} name={lib.name} dark={dark} />

      {/* content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
          <span style={{
            fontSize: "0.9rem", fontWeight: 650,
            color: hovered ? t.titleHover : t.titleColor,
            transition: "color 0.15s", letterSpacing: "-0.015em",
          }}>
            {lib.name}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
            textTransform: "uppercase", padding: "0.12rem 0.45rem",
            borderRadius: 4, background: catBg, color: catText, flexShrink: 0,
          }}>
            {m.label}
          </span>
        </div>
        <div style={{
          fontSize: 12.5, color: hovered ? t.descHover : t.descColor,
          lineHeight: 1.6, transition: "color 0.15s",
        }}>
          {lib.desc}
        </div>
        <div style={{ marginTop: "0.3rem", fontSize: 11, color: t.urlColor, fontFamily: "'SF Mono','Fira Code',monospace", letterSpacing: "0.01em" }}>
          {lib.url}
        </div>
      </div>

      {/* arrow */}
      <div style={{
        flexShrink: 0, marginTop: "0.15rem",
        color: hovered ? t.arrowHover : t.arrowColor,
        opacity: hovered ? 1 : 0.35,
        transform: hovered ? "translate(2px,-2px)" : "translate(0,0)",
        transition: "all 0.15s",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M7 17L17 7M17 7H7M17 7v10"/>
        </svg>
      </div>
    </a>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [active,    setActive]    = useState("all");
  const [query,     setQuery]     = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [dark,      setDark]      = useState(true);
  const searchRef = useRef(null);
  const t = getTheme(dark);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return LIBS.filter(l =>
      (active === "all" || l.cat === active) &&
      (!q || l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q) || l.url.toLowerCase().includes(q))
    );
  }, [active, query]);

  // Group by category when viewing "all"
  const grouped = useMemo(() => {
    if (active !== "all") return null;
    const map = {};
    CATEGORIES.filter(c => c.id !== "all").forEach(c => { map[c.id] = []; });
    filtered.forEach(l => { if (map[l.cat]) map[l.cat].push(l); });
    return CATEGORIES.filter(c => c.id !== "all" && map[c.id]?.length > 0).map(c => ({
      cat: c.id, meta: CAT_META[c.id], libs: map[c.id],
    }));
  }, [active, filtered]);

  return (
    <div style={{
      minHeight: "100vh",
      background: t.bg,
      color: t.titleColor,
      fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      transition: "background 0.25s, color 0.25s",
    }}>

      {/* ambient glow */}
      {dark && <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: t.glow }} />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HEADER (sticky + blur) ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: t.headerBg,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${t.headerBorder}`,
          padding: "0 1.5rem",
          transition: "background 0.25s, border-color 0.25s",
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.75rem 0 0" }}>

            {/* top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>

              {/* title block */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", boxShadow: dark ? "0 0 8px #8b5cf6" : "none", flexShrink: 0 }} />
                  <span style={{ fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: t.eyebrow, fontWeight: 600 }}>
                    Free & Open Source
                  </span>
                </div>
                <h1 style={{
                  fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 800,
                  margin: 0, letterSpacing: "-0.035em", lineHeight: 1.1,
                  background: t.h1Grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  UI Component Libraries
                </h1>
                <p style={{ marginTop: "0.4rem", color: t.descColor, fontSize: "0.875rem", lineHeight: 1.6 }}>
                  {LIBS.length} curated resources — ranked by quality within each category.
                </p>
              </div>

              {/* theme toggle */}
              <button
                onClick={() => setDark(d => !d)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.4rem 0.8rem", borderRadius: 999,
                  border: `1px solid ${t.toggleBorder}`,
                  background: t.toggleBg, color: t.toggleColor,
                  fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.2s", flexShrink: 0,
                }}
              >
                {dark ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
                {dark ? "Light" : "Dark"}
              </button>
            </div>

            {/* search — full width, prominent */}
            <div style={{ position: "relative", margin: "1.25rem 0 0" }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: dark ? "#3d3d56" : "#c4c9d4", pointerEvents: "none" }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search libraries, categories, frameworks…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: "100%", padding: "0.7rem 1rem 0.7rem 2.5rem",
                  background: t.searchBg,
                  border: `1px solid ${t.searchBorder}`,
                  borderRadius: 10, color: t.searchColor,
                  fontSize: 13.5, outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  fontFamily: "inherit",
                }}
                onFocus={e => e.target.style.borderColor = dark ? "rgba(139,92,246,0.5)" : "rgba(99,102,241,0.45)"}
                onBlur={e => e.target.style.borderColor = t.searchBorder}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: dark ? "#3d3d56" : "#c4c9d4", padding: "2px", display: "flex",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            {/* category tabs */}
            <div style={{
              display: "flex", gap: "0.25rem", margin: "1rem 0 0",
              overflowX: "auto", paddingBottom: "1px",
              msOverflowStyle: "none", scrollbarWidth: "none",
            }}>
              {CATEGORIES.map(cat => {
                const isActive = active === cat.id;
                const meta = CAT_META[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActive(cat.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.35rem",
                      padding: "0.35rem 0.8rem", borderRadius: 7,
                      border: isActive ? `1px solid ${t.tabActiveBorder}` : "1px solid transparent",
                      cursor: "pointer", fontSize: 12.5, fontWeight: 500,
                      transition: "all 0.15s", whiteSpace: "nowrap",
                      background: isActive ? t.tabActiveBg : t.tabBg,
                      color: isActive ? t.tabActiveColor : t.tabColor,
                      flexShrink: 0,
                    }}
                  >
                    {meta && (
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: isActive ? meta.dot : (dark ? "#2d2d3d" : "#d1d5db"),
                        flexShrink: 0, transition: "background 0.15s",
                        boxShadow: isActive && dark ? `0 0 6px ${meta.dot}` : "none",
                      }} />
                    )}
                    {cat.label}
                  </button>
                );
              })}
            </div>

          </div>
        </header>

        {/* ── MAIN ── */}
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 6rem" }}>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "7rem 0", color: t.emptyText }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: t.emptyIcon,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dark ? "#2d3748" : "#c4c9d4"} strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: "0.35rem", color: dark ? "#3d3d56" : "#c4c9d4" }}>
                No results for "{query}"
              </div>
              <div style={{ fontSize: 12.5, color: dark ? "#252535" : "#d1d5db" }}>
                Try a category name, framework, or library keyword
              </div>
            </div>
          ) : active === "all" && !query ? (
            /* Grouped view — section headers per category */
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              {grouped.map(({ cat, meta, libs: catLibs }) => (
                <section key={cat}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    marginBottom: "0.85rem", paddingBottom: "0.6rem",
                    borderBottom: `1px solid ${t.sectionBorder}`,
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: meta.dot,
                      boxShadow: dark ? `0 0 8px ${meta.dot}66` : "none",
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: t.sectionLabel }}>
                      {meta.label}
                    </span>
                    <span style={{ fontSize: 11, color: t.sectionLabel, opacity: 0.6, marginLeft: "auto" }}>
                      {catLibs.length}
                    </span>
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                    gap: "0.5rem",
                  }}>
                    {catLibs.map(lib => (
                      <LibCard
                        key={lib.id} lib={lib} dark={dark}
                        hovered={hoveredId === lib.id}
                        onHover={setHoveredId}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* Filtered / single-category view */
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: "0.5rem",
            }}>
              {filtered.map(lib => (
                <LibCard
                  key={lib.id} lib={lib} dark={dark}
                  hovered={hoveredId === lib.id}
                  onHover={setHoveredId}
                />
              ))}
            </div>
          )}

          {/* footer */}
          <div style={{
            marginTop: "3rem", paddingTop: "1.5rem",
            borderTop: `1px solid ${t.sectionBorder}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "0.5rem",
          }}>
            <p style={{ margin: 0, fontSize: 12, color: t.footerText }}>
              {LIBS.length} libraries — all free / open-source. Ranked best-first within each category.
            </p>
            {filtered.length !== LIBS.length && (
              <span style={{ fontSize: 12, color: t.sectionLabel }}>
                {filtered.length} shown
              </span>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
