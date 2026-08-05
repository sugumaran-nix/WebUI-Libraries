import { useState, useMemo, useEffect, useCallback, useRef } from "react";

// ── URL state helpers ──────────────────────────────────────────────
function getUrlParams() {
  if (typeof window === "undefined") return { cat: "all", q: "" };
  const p = new URLSearchParams(window.location.search);
  return { cat: p.get("cat") || "all", q: p.get("q") || "" };
}
function setUrlParams(cat, q) {
  const p = new URLSearchParams();
  if (cat && cat !== "all") p.set("cat", cat);
  if (q) p.set("q", q);
  const str = p.toString();
  window.history.replaceState(null, "", str ? `?${str}` : window.location.pathname);
}

// ── Data ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",          label: "All" },
  { id: "animated",     label: "Animated & Motion" },
  { id: "shadcn",       label: "shadcn Ecosystem" },
  { id: "tailwind",     label: "Tailwind CSS" },
  { id: "css",          label: "CSS / HTML / SVG" },
  { id: "react",        label: "Full React" },
  { id: "headless",     label: "Headless" },
  { id: "multi",        label: "Vue / Svelte" },
  { id: "collections",  label: "Collections" },
  { id: "design-tools", label: "Design Tools" },
  { id: "dev-tools",    label: "Dev Tools" },
];

// stack tags for each entry
const STACKS = {
  react: ["React"],
  css: ["CSS", "HTML"],
  tailwind: ["Tailwind", "HTML"],
  shadcn: ["React", "shadcn"],
  animated: ["React", "Framer Motion"],
  headless: ["React"],
  multi: ["Vue", "Svelte", "Multi"],
  collections: ["React", "Tailwind"],
  "design-tools": ["Design"],
  "dev-tools": ["Browser"],
};

const LIBS = [
  // ── Animated ──
  { id: 1,  name: "Aceternity UI",       url: "ui.aceternity.com",                    cat: "animated",      desc: "Stunning animated components built with Tailwind CSS and Framer Motion — perfect for landing pages", added: "2024-01", maintained: true },
  { id: 2,  name: "Magic UI",            url: "magicui.design",                       cat: "animated",      desc: "150+ free, open-source animated React components for marketing sites and SaaS products", added: "2024-02", maintained: true },
  { id: 3,  name: "Motion Primitives",   url: "motion-primitives.com",                cat: "animated",      desc: "Copy-paste motion primitives for building beautiful, animated React interfaces", added: "2024-03", maintained: true },
  { id: 4,  name: "Eldora UI",           url: "eldoraui.site",                        cat: "animated",      desc: "Animated React components inspired by shadcn/ui, Aceternity UI, and Magic UI", added: "2024-04", maintained: true },
  { id: 5,  name: "Cult UI",             url: "cult-ui.com",                          cat: "animated",      desc: "Polished animated React components built on shadcn/ui with a refined dark-mode-first aesthetic", added: "2024-05", maintained: true },
  { id: 6,  name: "Animata",             url: "animata.design",                       cat: "animated",      desc: "Hand-crafted interaction and animation components for creative interfaces", added: "2024-06", maintained: true },
  { id: 7,  name: "UI Layout",           url: "ui-layout.com",                        cat: "animated",      desc: "Complex layout patterns with smooth animation support for modern React apps", added: "2024-07", maintained: true },
  { id: 8,  name: "Lukacho UI",          url: "ui.lukacho.com",                       cat: "animated",      desc: "Minimal animated UI kit for modern React apps", added: "2024-08", maintained: true },
  { id: 9,  name: "ReactBits",           url: "reactbits.dev",                        cat: "animated",      desc: "Animated React bit-components for creative, expressive UIs", added: "2024-09", maintained: true },
  { id: 10, name: "SmoothUI",            url: "smoothui.dev",                         cat: "animated",      desc: "130+ ultra-smooth micro-interaction components built on Motion, compatible with shadcn/ui", added: "2024-10", maintained: true },
  { id: 11, name: "Fancy Components",    url: "fancycomponents.dev",                  cat: "animated",      desc: "Distinctive, delightful animated component collection for creative developers", added: "2024-11", maintained: true },
  { id: 12, name: "CuiCui",              url: "cuicui.day",                           cat: "animated",      desc: "Daily component drops with polished motion design and copy-paste simplicity", added: "2024-12", maintained: true },
  { id: 13, name: "SyntaxUI",            url: "syntaxui.com",                         cat: "animated",      desc: "Dev-focused animated component library with live code previews and Tailwind integration", added: "2024-13", maintained: true },
  { id: 15, name: "UI Labs",             url: "uilabs.dev",                           cat: "animated",      desc: "Experimental laboratory of fine UI — carefully crafted React components and interactions", added: "2024-15", maintained: true },
  // ── shadcn ──
  { id: 16, name: "shadcn/ui",           url: "ui.shadcn.com",                        cat: "shadcn",        desc: "The gold standard — accessible, re-usable components installed via CLI into your own codebase", added: "2023-01", maintained: true },
  { id: 17, name: "21st.dev",            url: "21st.dev",                             cat: "shadcn",        desc: "The npm for design engineers — community-driven component registry with thousands of components", added: "2024-01", maintained: true },
  { id: 18, name: "Origin UI",           url: "originui.com",                         cat: "shadcn",        desc: "Beautiful, SaaS-focused shadcn/ui components built with a design-first approach", added: "2024-02", maintained: true },
  { id: 19, name: "Shadcnblocks",        url: "shadcnblocks.com",                     cat: "shadcn",        desc: "1,700+ full page sections and blocks for shadcn/ui projects — the largest block marketplace", added: "2024-03", maintained: true },
  { id: 20, name: "HextaUI",             url: "hextaui.com",                          cat: "shadcn",        desc: "Modern shadcn/ui extensions with refined aesthetics and smooth animations", added: "2024-04", maintained: true },
  { id: 21, name: "KokonutUI",           url: "kokonutui.com",                        cat: "shadcn",        desc: "Accessible, production-ready shadcn/ui component extensions with strong defaults", added: "2024-05", maintained: true },
  { id: 22, name: "Bundui",              url: "bundui.io",                            cat: "shadcn",        desc: "Curated shadcn/ui component bundles, ready to drop into your project", added: "2024-06", maintained: true },
  { id: 23, name: "Skiper UI",           url: "skiper-ui.com",                        cat: "shadcn",        desc: "24 free animated components built on top of shadcn/ui with polished motion", added: "2024-07", maintained: true },
  { id: 24, name: "lndev/ui",            url: "ui.lndev.me",                          cat: "shadcn",        desc: "Indie-crafted shadcn/ui extensions with a unique visual personality", added: "2024-08", maintained: true },
  { id: 25, name: "ReUI",                url: "reui.io",                              cat: "shadcn",        desc: "Enterprise-grade shadcn/ui component extensions with Radix and Base UI support", added: "2024-09", maintained: true },
  { id: 26, name: "MynaUI",              url: "mynaui.com",                           cat: "shadcn",        desc: "Elegant shadcn/ui components with a consistent visual language and design-system parity", added: "2024-10", maintained: true },
  { id: 27, name: "BadtzUI",             url: "badtz-ui.com",                         cat: "shadcn",        desc: "Core-free shadcn/ui extensions updated every week — fresh components on a regular schedule", added: "2024-11", maintained: true },
  { id: 28, name: "Nyxb UI",             url: "nyxbui.design",                        cat: "shadcn",        desc: "Dark-mode-first shadcn/ui components with rich motion and expressive visual design", added: "2024-12", maintained: true },
  { id: 79, name: "Kibo UI",             url: "kibo-ui.com",                          cat: "shadcn",        desc: "Advanced shadcn/ui registry: color pickers, QR codes, drag-drop uploaders, AI chatbot UI and more", added: "2024-13", maintained: true },
  // ── Tailwind ──
  { id: 29, name: "DaisyUI",             url: "daisyui.com",                          cat: "tailwind",      desc: "The most popular Tailwind CSS component library — 65 components, 35 themes, zero JS dependencies", added: "2021-01", maintained: true },
  { id: 30, name: "Flowbite",            url: "flowbite.com",                         cat: "tailwind",      desc: "Open-source Tailwind component library with React, Vue, and Svelte adapters plus a Figma kit", added: "2021-02", maintained: true },
  { id: 31, name: "Preline UI",          url: "preline.co",                           cat: "tailwind",      desc: "Fully responsive Tailwind HTML components and templates with Alpine.js interactivity", added: "2022-01", maintained: true },
  { id: 32, name: "HyperUI",             url: "hyperui.dev",                          cat: "tailwind",      desc: "Free open-source Tailwind components for ecommerce, marketing, and application UIs", added: "2022-02", maintained: true },
  { id: 33, name: "Meraki UI",           url: "merakiui.com",                         cat: "tailwind",      desc: "Beautiful, RTL-supported Tailwind CSS UI components for your next project", added: "2022-03", maintained: true },
  { id: 77, name: "Sailboat UI",         url: "sailboatui.com",                       cat: "tailwind",      desc: "150+ open-source Tailwind CSS components with Alpine.js interactivity built in", added: "2023-01", maintained: true },
  { id: 78, name: "TailGrids",           url: "tailgrids.com",                        cat: "tailwind",      desc: "600+ free React + Tailwind components, blocks, and templates for real-world production use", added: "2023-02", maintained: true },
  { id: 34, name: "FlyonUI",             url: "flyonui.com",                          cat: "tailwind",      desc: "Semantic Tailwind components built on DaisyUI and Alpine.js with extra utility", added: "2023-03", maintained: true },
  { id: 35, name: "Penguin UI",          url: "penguinui.com",                        cat: "tailwind",      desc: "Simple, clean, and accessible Tailwind CSS components", added: "2023-04", maintained: true },
  { id: 36, name: "Tailkits",            url: "tailkits.com",                         cat: "tailwind",      desc: "Curated Tailwind CSS component marketplace and collection", added: "2023-05", maintained: true },
  { id: 37, name: "Tailus HTML",         url: "html.tailus.io",                       cat: "tailwind",      desc: "Tailwind CSS components with refined visual design standards and P3 color support", added: "2023-06", maintained: true },
  { id: 38, name: "DevUI",               url: "devui.in",                             cat: "tailwind",      desc: "Developer-centric Tailwind components with a code-first developer experience", added: "2023-07", maintained: true },
  { id: 39, name: "Tailblocks",          url: "tailblocks.cc",                        cat: "tailwind",      desc: "Ready-to-use Tailwind CSS blocks for rapid prototyping and layout building", added: "2021-03", maintained: true },
  // ── CSS / SVG ──
  { id: 40, name: "Uiverse",             url: "uiverse.io",                           cat: "css",           desc: "Community-created CSS elements and components — thousands of unique, copy-paste-ready designs", added: "2022-01", maintained: true },
  { id: 41, name: "Dot Matrix",          url: "dotmatrix.zzzzshawn.cloud",            cat: "css",           desc: "55+ free dot-matrix loaders built with React, TypeScript, Tailwind, and shadcn", added: "2026-01", maintained: true },
  { id: 42, name: "Shapes Gallery",      url: "shapes.gallery",                       cat: "css",           desc: "Pure CSS shape collection for creative backgrounds, decorations, and visual flourishes", added: "2023-01", maintained: true },
  { id: 43, name: "RareUI",              url: "rareui.com",                           cat: "css",           desc: "Unique, rare animated React components built with Tailwind and Motion — genuinely uncommon designs", added: "2024-01", maintained: true },
  { id: 44, name: "Indie Starter UI",    url: "ui.indie-starter.dev",                cat: "css",           desc: "Minimal React + shadcn components for indie hackers who want to ship fast", added: "2024-02", maintained: true },
  { id: 45, name: "FlashUI",             url: "flashui.site",                         cat: "css",           desc: "Zero-install, paste-and-go CSS UI elements for quick wins", added: "2024-03", maintained: true },
  { id: 46, name: "Ever UI",             url: "ever-ui.com",                          cat: "css",           desc: "Evergreen CSS components built for long-term browser support and stability", added: "2024-04", maintained: true },
  { id: 47, name: "Chakra Framer",       url: "chakraframer.com",                     cat: "css",           desc: "CSS motion templates inspired by Framer's design system and interaction patterns", added: "2024-05", maintained: true },
  { id: 48, name: "Ground Bossadizenith",url: "ground.bossadizenith.me",             cat: "css",           desc: "Experimental CSS components and ground-level visual effects for creative projects", added: "2024-06", maintained: true },
  // ── Full React ──
  { id: 49, name: "HeroUI",              url: "heroui.com",                           cat: "react",         desc: "Beautiful React components (formerly NextUI) — 100+ accessible, themeable components", added: "2022-01", maintained: true },
  { id: 50, name: "Mantine",             url: "mantine.dev",                          cat: "react",         desc: "Feature-rich React component library with 100+ components and 50+ hooks", added: "2021-01", maintained: true },
  { id: 51, name: "Chakra UI",           url: "chakra-ui.com",                        cat: "react",         desc: "Accessible, composable React components with dark mode and theming out of the box", added: "2020-01", maintained: true },
  { id: 52, name: "PrimeReact",          url: "primereact.org",                       cat: "react",         desc: "The ultimate React UI component suite — 90+ components with rich theming support", added: "2019-01", maintained: true },
  { id: 53, name: "MUI",                 url: "mui.com",                              cat: "react",         desc: "The most widely used React UI framework — Material Design and Joy UI component systems", added: "2016-01", maintained: true },
  { id: 54, name: "Ant Design",          url: "ant.design",                           cat: "react",         desc: "Enterprise-grade React UI library from Alibaba — the standard for large-scale business apps", added: "2016-02", maintained: true },
  { id: 75, name: "Tremor",              url: "tremor.so",                            cat: "react",         desc: "35+ open-source React components for dashboards — charts, KPI cards, data tables and trackers", added: "2023-01", maintained: true },
  { id: 80, name: "Fluent UI",           url: "react.fluentui.dev",                  cat: "react",         desc: "Microsoft's open-source React library with 950+ cross-platform components powering Office and Teams", added: "2020-01", maintained: true },
  { id: 81, name: "Blueprint",           url: "blueprintjs.com",                      cat: "react",         desc: "Palantir's React UI toolkit optimized for data-dense, complex desktop applications", added: "2017-01", maintained: true },
  { id: 82, name: "Semantic UI React",   url: "react.semantic-ui.com",               cat: "react",         desc: "Human-friendly declarative React APIs — 100+ components with a natural language approach", added: "2016-01", maintained: true },
  { id: 83, name: "CoreUI React",        url: "coreui.io/react",                     cat: "react",         desc: "Bootstrap-based enterprise React library with admin dashboard templates and components", added: "2018-01", maintained: true },
  { id: 85, name: "React Bootstrap",     url: "react-bootstrap.github.io",           cat: "react",         desc: "Bootstrap rebuilt from scratch as true React components — no jQuery, full React lifecycle", added: "2019-01", maintained: true },
  { id: 55, name: "Gluestack",           url: "gluestack.io",                         cat: "react",         desc: "Fully free React + React Native component library — one codebase, two platforms", added: "2023-01", maintained: true },
  { id: 56, name: "React Suite",         url: "rsuitejs.com",                         cat: "react",         desc: "Comprehensive suite of React components for enterprise-grade applications", added: "2017-01", maintained: true },
  { id: 57, name: "Grommet",             url: "v2.grommet.io",                        cat: "react",         desc: "Accessibility-first React library backed by HPE — battle-tested for enterprise products", added: "2015-01", maintained: true },
  // ── Headless ──
  { id: 58, name: "Radix UI",            url: "radix-ui.com",                         cat: "headless",      desc: "Unstyled, fully accessible React components — the foundation of shadcn/ui and many design systems", added: "2021-01", maintained: true },
  { id: 59, name: "Headless UI",         url: "headlessui.com",                       cat: "headless",      desc: "Completely unstyled, fully accessible UI components by the Tailwind CSS team", added: "2020-01", maintained: true },
  { id: 60, name: "Base UI",             url: "base-ui.com",                          cat: "headless",      desc: "Unstyled React components from the MUI team — the actively maintained Radix UI alternative in 2026", added: "2023-01", maintained: true },
  { id: 61, name: "React Aria",          url: "react-spectrum.adobe.com/react-aria",  cat: "headless",      desc: "Adobe's React Hooks library for building accessible UI primitives — rock-solid ARIA compliance", added: "2020-01", maintained: true },
  { id: 84, name: "Ark UI",              url: "ark-ui.com",                           cat: "headless",      desc: "45+ headless, zero-style, framework-agnostic accessible UI primitives for any stack", added: "2023-01", maintained: true },
  // ── Vue / Svelte / Multi ──
  { id: 14, name: "Inspira UI",          url: "inspira-ui.com",                       cat: "multi",         desc: "Animated component library for Vue developers — the Vue equivalent of Magic UI", added: "2024-01", maintained: true },
  { id: 62, name: "shadcn-svelte",       url: "shadcn-svelte.com",                    cat: "multi",         desc: "shadcn/ui ported to Svelte — all the power and DX, native Svelte syntax", added: "2023-01", maintained: true },
  { id: 63, name: "Flowbite Svelte",     url: "flowbite-svelte.com",                  cat: "multi",         desc: "Flowbite component library ported to Svelte with full feature parity", added: "2023-02", maintained: true },
  { id: 76, name: "Float UI",            url: "floatui.com",                          cat: "multi",         desc: "Free multi-framework UI components that work with React, Vue, Svelte, and plain HTML", added: "2023-03", maintained: true },
  { id: 64, name: "Vuetify",             url: "vuetifyjs.com",                        cat: "multi",         desc: "Material Design component framework for Vue — 80+ components and a massive ecosystem", added: "2016-01", maintained: true },
  { id: 65, name: "PrimeVue",            url: "primevue.org",                         cat: "multi",         desc: "The ultimate Vue UI component library — 90+ components, 11 themes, and a Figma kit", added: "2019-01", maintained: true },
  { id: 93, name: "Nuxt UI",             url: "ui.nuxt.com",                          cat: "multi",         desc: "125+ accessible Tailwind CSS components for Vue and Nuxt — v4 made everything completely free including 12 templates and a Figma kit", added: "2026-01", maintained: true },
  // ── Collections ──
  { id: 66, name: "Untitled UI React",   url: "untitledui.com/react",                 cat: "collections",   desc: "React implementation of the Untitled UI Figma design system — built with Tailwind v4 and React Aria", added: "2026-01", maintained: true },
  { id: 67, name: "Tailark",             url: "tailark.com",                          cat: "collections",   desc: "Marketing-focused block library with the most distinctive design language in the shadcn ecosystem", added: "2024-01", maintained: true },
  { id: 68, name: "React Keep Design",   url: "react.keepdesign.io",                  cat: "collections",   desc: "Design-driven React component collection with strong Figma-to-code workflow support", added: "2023-01", maintained: true },
  // ── Design Tools ──
  { id: 70, name: "Pattern Craft",       url: "patterncraft.dev",                     cat: "design-tools",  desc: "100+ CSS and Tailwind background patterns, ready to copy-paste into any project", added: "2024-01", maintained: true },
  { id: 71, name: "Gradienty",           url: "gradienty.codes",                      cat: "design-tools",  desc: "CSS gradient generator and library — browse, customize, and copy gradients in one click", added: "2023-01", maintained: true },
  { id: 87, name: "Coolors",             url: "coolors.co",                           cat: "design-tools",  desc: "The fastest color palette generator — create, explore, and share beautiful color palettes", added: "2015-01", maintained: true },
  { id: 91, name: "Blobmaker",           url: "blobmaker.app",                        cat: "design-tools",  desc: "Generate unique SVG blob shapes for backgrounds, illustrations, and decorative elements", added: "2019-01", maintained: true },
  { id: 94, name: "CSS Clip-Path Maker", url: "bennettfeely.com/clippy",              cat: "design-tools",  desc: "Visual CSS clip-path shape generator — create complex clip-path values without writing code", added: "2015-01", maintained: true },
  { id: 86, name: "Google Fonts",        url: "fonts.google.com",                     cat: "design-tools",  desc: "1,500+ free, open-source web fonts — the most widely used font resource on the internet", added: "2010-01", maintained: true },
  { id: 90, name: "LottieFiles",         url: "lottiefiles.com",                      cat: "design-tools",  desc: "Platform for Lottie animations — create, edit, preview, and share lightweight web animations", added: "2017-01", maintained: true },
  // ── Dev Tools ──
  { id: 72, name: "Lordicon",            url: "lordicon.com",                         cat: "dev-tools",     desc: "Animated Lottie icons with a free tier — 1000+ animated icons ready for web and apps", added: "2020-01", maintained: true },
  { id: 73, name: "Lucide Icons",        url: "lucide.dev",                           cat: "dev-tools",     desc: "1000+ open-source icons — consistent stroke width, MIT-licensed, React/Vue/Svelte packages", added: "2021-01", maintained: true },
  { id: 88, name: "Iconify",             url: "iconify.design",                       cat: "dev-tools",     desc: "250,000+ open-source SVG icons from 150+ icon sets unified under one API and package", added: "2020-01", maintained: true },
  { id: 89, name: "Squoosh",             url: "squoosh.app",                          cat: "dev-tools",     desc: "Open-source image compression tool that runs entirely in the browser — no upload, fully private", added: "2018-01", maintained: true },
];

// which items are "new" — added in 2026
const NEW_IDS = new Set(LIBS.filter(l => l.added?.startsWith("2026")).map(l => l.id));

const CAT_META = {
  animated:     { label: "Animated",      darkBg: "rgba(139,92,246,0.14)",  darkText: "#c4b5fd", darkDot: "#8b5cf6",  lightBg: "rgba(109,40,217,0.09)", lightText: "#5b21b6", lightDot: "#7c3aed" },
  shadcn:       { label: "shadcn",        darkBg: "rgba(34,197,94,0.12)",   darkText: "#86efac", darkDot: "#22c55e",  lightBg: "rgba(22,163,74,0.09)",  lightText: "#14532d", lightDot: "#16a34a" },
  tailwind:     { label: "Tailwind",      darkBg: "rgba(14,165,233,0.12)",  darkText: "#7dd3fc", darkDot: "#0ea5e9",  lightBg: "rgba(2,132,199,0.09)",  lightText: "#075985", lightDot: "#0284c7" },
  css:          { label: "CSS / SVG",     darkBg: "rgba(251,146,60,0.12)",  darkText: "#fdba74", darkDot: "#f97316",  lightBg: "rgba(194,65,12,0.09)",  lightText: "#9a3412", lightDot: "#ea580c" },
  react:        { label: "React",         darkBg: "rgba(96,165,250,0.12)",  darkText: "#93c5fd", darkDot: "#60a5fa",  lightBg: "rgba(37,99,235,0.09)",  lightText: "#1e3a8a", lightDot: "#2563eb" },
  headless:     { label: "Headless",      darkBg: "rgba(248,113,113,0.12)", darkText: "#fca5a5", darkDot: "#ef4444",  lightBg: "rgba(185,28,28,0.09)",  lightText: "#991b1b", lightDot: "#dc2626" },
  multi:        { label: "Vue / Svelte",  darkBg: "rgba(52,211,153,0.12)",  darkText: "#6ee7b7", darkDot: "#34d399",  lightBg: "rgba(4,120,87,0.09)",   lightText: "#065f46", lightDot: "#059669" },
  collections:  { label: "Collection",    darkBg: "rgba(250,204,21,0.12)",  darkText: "#fde047", darkDot: "#eab308",  lightBg: "rgba(146,64,14,0.09)",  lightText: "#78350f", lightDot: "#b45309" },
  "design-tools":{ label: "Design Tool",  darkBg: "rgba(232,121,249,0.12)", darkText: "#f0abfc", darkDot: "#d946ef",  lightBg: "rgba(126,34,206,0.09)", lightText: "#581c87", lightDot: "#9333ea" },
  "dev-tools":  { label: "Dev Tool",      darkBg: "rgba(20,184,166,0.12)",  darkText: "#5eead4", darkDot: "#14b8a6",  lightBg: "rgba(13,148,136,0.09)", lightText: "#134e4a", lightDot: "#0d9488" },
};

const RECIPIENT = "your@email.com";
const VERIFIED_DATE = "August 2026";

export default function App() {
  const init = getUrlParams();
  const [active, setActive]       = useState(init.cat);
  const [query, setQuery]         = useState(init.q);
  const [sort, setSort]           = useState("default"); // default | alpha | new
  const [dark, setDark]           = useState(true);
  const [suggOpen, setSuggOpen]   = useState(false);
  const [copiedId, setCopiedId]   = useState(null);
  const [randomId, setRandomId]   = useState(null);
  const [floatVisible, setFloat]  = useState(false);
  const [name, setName]           = useState("");
  const [siteName, setSiteName]   = useState("");
  const [siteUrl, setSiteUrl]     = useState("");
  const [reason, setReason]       = useState("");
  const [sent, setSent]           = useState(false);
  const mainRef = useRef(null);

  const D = dark;

  // sync URL params
  useEffect(() => { setUrlParams(active, query); }, [active, query]);

  // show float button after scroll
  useEffect(() => {
    const onScroll = () => setFloat(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = LIBS.filter(l =>
      (active === "all" || l.cat === active) &&
      (!q || l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q))
    );
    if (sort === "alpha") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "new") list = [...list].filter(l => NEW_IDS.has(l.id)).concat(list.filter(l => !NEW_IDS.has(l.id)));
    return list;
  }, [active, query, sort]);

  const counts = useMemo(() => {
    const c = { all: LIBS.length };
    LIBS.forEach(l => { c[l.cat] = (c[l.cat] || 0) + 1; });
    return c;
  }, []);

  function pickRandom() {
    const pool = filtered.length > 1 ? filtered.filter(l => l.id !== randomId) : filtered;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setRandomId(pick.id);
    // scroll to it
    setTimeout(() => {
      const el = document.getElementById(`lib-${pick.id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  function copyUrl(url, id, e) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`https://${url}`).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  }

  function handleSuggest() {
    if (!siteName.trim() || !siteUrl.trim()) return;
    const clean = s => s.trim();
    const subject = encodeURIComponent(`UI Library Suggestion: ${clean(siteName)}`);
    const body = encodeURIComponent(
`Hi,\n\nI'd like to suggest a resource for your UI Component Libraries directory.\n\nName:    ${clean(siteName)}\nURL:     ${clean(siteUrl.startsWith("http") ? siteUrl : "https://" + siteUrl)}\n${clean(reason) ? `Why it's useful:\n${clean(reason)}\n` : ""}${clean(name) ? `\nSuggested by: ${clean(name)}` : ""}\n\nThanks!`
    );
    window.open(`mailto:${RECIPIENT}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
    setTimeout(() => { setSent(false); setName(""); setSiteName(""); setSiteUrl(""); setReason(""); }, 3000);
  }

  // ── Theme tokens ───────────────────────────────────────────────
  const t = {
    bg:               D ? "#0c0c13"                         : "#f4f5f8",
    headerBg:         D ? "#0c0c13"                         : "#ffffff",
    headerBorder:     D ? "rgba(255,255,255,0.09)"          : "rgba(0,0,0,0.09)",
    cardBg:           D ? "#13131f"                         : "#ffffff",
    cardBorder:       D ? "rgba(255,255,255,0.09)"          : "rgba(0,0,0,0.09)",
    cardHoverBg:      D ? "#1c1c30"                         : "#eef1ff",
    cardHoverBorder:  D ? "rgba(167,139,250,0.5)"           : "rgba(99,102,241,0.45)",
    cardFocusBorder:  D ? "rgba(167,139,250,0.8)"           : "rgba(99,102,241,0.8)",
    highlightBg:      D ? "rgba(167,139,250,0.08)"          : "rgba(99,102,241,0.06)",
    highlightBorder:  D ? "rgba(167,139,250,0.6)"           : "rgba(99,102,241,0.6)",
    titleColor:       D ? "#f0f4ff"                         : "#0f172a",
    titleHover:       D ? "#ffffff"                         : "#1e1b4b",
    descColor:        D ? "#9baacf"                         : "#374151",
    descHover:        D ? "#c2cfee"                         : "#111827",
    urlColor:         D ? "#4f5e7a"                         : "#9ca3af",
    eyebrow:          D ? "#7c8db5"                         : "#6b7280",
    tabBg:            D ? "rgba(255,255,255,0.06)"          : "rgba(0,0,0,0.05)",
    tabActiveBg:      D ? "rgba(167,139,250,0.18)"          : "rgba(99,102,241,0.12)",
    tabColor:         D ? "#7c8db5"                         : "#4b5563",
    tabActiveColor:   D ? "#d4bbff"                         : "#3730a3",
    tabActiveBorder:  D ? "rgba(167,139,250,0.5)"           : "rgba(99,102,241,0.5)",
    searchBg:         D ? "rgba(255,255,255,0.06)"          : "#ffffff",
    searchBorder:     D ? "rgba(255,255,255,0.12)"          : "rgba(0,0,0,0.13)",
    searchColor:      D ? "#f0f4ff"                         : "#0f172a",
    searchPlaceholder:D ? "#4f5e7a"                         : "#9ca3af",
    arrowColor:       D ? "#4f5e7a"                         : "#c4c9d4",
    arrowHover:       D ? "#a78bfa"                         : "#6366f1",
    footerText:       D ? "#4f5e7a"                         : "#9ca3af",
    countColor:       D ? "#4f5e7a"                         : "#9ca3af",
    glow:             D ? "radial-gradient(ellipse 70% 35% at 50% -5%,rgba(139,92,246,0.15) 0%,transparent 70%)" : "none",
    h1Grad:           D ? "linear-gradient(135deg,#ffffff 0%,#c4b5fd 100%)" : "linear-gradient(135deg,#1e1b4b 0%,#4338ca 100%)",
    emptyColor:       D ? "#4f5e7a"                         : "#d1d5db",
    toggleBg:         D ? "rgba(255,255,255,0.07)"          : "rgba(0,0,0,0.05)",
    toggleBorder:     D ? "rgba(255,255,255,0.12)"          : "rgba(0,0,0,0.1)",
    suggBg:           D ? "#13131f"                         : "#ffffff",
    suggBorder:       D ? "rgba(255,255,255,0.09)"          : "rgba(0,0,0,0.09)",
    suggHeaderBg:     D ? "rgba(139,92,246,0.08)"           : "rgba(99,102,241,0.05)",
    suggHeaderBorder: D ? "rgba(139,92,246,0.22)"           : "rgba(99,102,241,0.15)",
    inputBg:          D ? "rgba(255,255,255,0.05)"          : "#f9fafb",
    inputBorder:      D ? "rgba(255,255,255,0.12)"          : "rgba(0,0,0,0.12)",
    inputColor:       D ? "#f0f4ff"                         : "#0f172a",
    labelColor:       D ? "#b0bedd"                         : "#374151",
    submitBg:         D ? "#7c3aed"                         : "#4f46e5",
    accentPurple:     D ? "#a78bfa"                         : "#6366f1",
    newBadgeBg:       D ? "rgba(52,211,153,0.12)"           : "rgba(4,120,87,0.09)",
    newBadgeText:     D ? "#6ee7b7"                         : "#065f46",
    copyBg:           D ? "rgba(255,255,255,0.07)"          : "rgba(0,0,0,0.05)",
    copyHoverBg:      D ? "rgba(255,255,255,0.12)"          : "rgba(0,0,0,0.08)",
    sortBg:           D ? "rgba(255,255,255,0.05)"          : "rgba(0,0,0,0.04)",
    sortBorder:       D ? "rgba(255,255,255,0.1)"           : "rgba(0,0,0,0.1)",
    floatBg:          D ? "#7c3aed"                         : "#4f46e5",
    divider:          D ? "rgba(255,255,255,0.06)"          : "rgba(0,0,0,0.07)",
  };

  const inputStyle = {
    width: "100%", padding: "0.55rem 0.85rem",
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: 9, color: t.inputColor, fontSize: 13.5, outline: "none",
    boxSizing: "border-box", transition: "border-color 0.18s",
    fontFamily: "inherit",
  };

  const stackTags = (cat) => (STACKS[cat] || []).map(s => (
    <span key={s} style={{ fontSize: 10, fontWeight: 500, padding: "0.1rem 0.4rem", borderRadius: 4, background: t.sortBg, color: t.eyebrow, border: `1px solid ${t.divider}` }}>{s}</span>
  ));

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.titleColor, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", transition: "background 0.25s,color 0.25s" }}>

      {D && <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: t.glow }} />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HEADER ─────────────────────────────────── */}
        <header style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", transition: "background 0.25s" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "1.5rem 0 1.25rem" }}>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.accentPurple, boxShadow: D ? `0 0 10px ${t.accentPurple}` : "none", flexShrink: 0 }} />
                  <span style={{ fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: t.eyebrow, fontWeight: 600 }}>Free & Open Source</span>
                </div>
                <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 800, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1, background: t.h1Grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  UI Component Libraries
                </h1>
                <p style={{ marginTop: "0.4rem", color: t.descColor, fontSize: "0.875rem", lineHeight: 1.6, maxWidth: 420 }}>
                  {LIBS.length} curated, free resources — all links verified {VERIFIED_DATE}.
                </p>
              </div>

              {/* Controls */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {/* theme toggle */}
                  <button onClick={() => setDark(d => !d)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.75rem", borderRadius: 999, border: `1px solid ${t.toggleBorder}`, background: t.toggleBg, color: t.eyebrow, fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {D ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                       : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
                    {D ? "Light" : "Dark"}
                  </button>
                  {/* sort */}
                  <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: "0.35rem 0.65rem", borderRadius: 8, border: `1px solid ${t.sortBorder}`, background: t.sortBg, color: t.tabColor, fontSize: 12, cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                    <option value="default">Default order</option>
                    <option value="alpha">A → Z</option>
                    <option value="new">New first</option>
                  </select>
                  {/* random */}
                  <button onClick={pickRandom} title="Random pick" style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", borderRadius: 8, border: `1px solid ${t.sortBorder}`, background: t.sortBg, color: t.tabColor, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                    Random
                  </button>
                </div>
                {/* search */}
                <div style={{ position: "relative", width: 220 }}>
                  <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: t.searchPlaceholder, pointerEvents: "none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input type="text" placeholder="Search libraries…" value={query} onChange={e => setQuery(e.target.value)}
                    style={{ width: "100%", padding: "0.45rem 0.8rem 0.45rem 2rem", background: t.searchBg, border: `1px solid ${t.searchBorder}`, borderRadius: 8, color: t.searchColor, fontSize: 12.5, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                    onFocus={e => e.target.style.borderColor = t.accentPurple}
                    onBlur={e => e.target.style.borderColor = t.searchBorder}
                  />
                  {query && (
                    <button onClick={() => setQuery("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.searchPlaceholder, padding: 2, lineHeight: 1 }}>✕</button>
                  )}
                </div>
              </div>
            </div>

            {/* Category tabs — scrollable on mobile */}
            <div style={{ display: "flex", gap: "0.25rem", marginTop: "1.25rem", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none" }}>
              {CATEGORIES.map(cat => {
                const isA = active === cat.id;
                return (
                  <button key={cat.id} onClick={() => setActive(cat.id)} style={{ padding: "0.32rem 0.75rem", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.14s", background: isA ? t.tabActiveBg : t.tabBg, color: isA ? t.tabActiveColor : t.tabColor, outline: isA ? `1px solid ${t.tabActiveBorder}` : "1px solid transparent", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {cat.label}
                    <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.55 }}>{counts[cat.id] || 0}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* ── LIST ────────────────────────────────────── */}
        <main ref={mainRef} style={{ maxWidth: 860, margin: "0 auto", padding: "1.5rem 1.5rem 2rem" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 0", color: t.emptyColor }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>—</div>
              No libraries match "<strong>{query}</strong>"
              <div style={{ marginTop: "0.75rem" }}>
                <button onClick={() => { setQuery(""); setActive("all"); }} style={{ fontSize: 12.5, color: t.accentPurple, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Clear filters</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {filtered.map(lib => {
                const m    = CAT_META[lib.cat] || CAT_META["dev-tools"];
                const bg   = D ? m.darkBg   : m.lightBg;
                const txt  = D ? m.darkText  : m.lightText;
                const dot  = D ? m.darkDot   : m.lightDot;
                const isRandom  = randomId === lib.id;
                const isCopied  = copiedId === lib.id;
                const isNew     = NEW_IDS.has(lib.id);

                return (
                  <div key={lib.id} id={`lib-${lib.id}`} style={{ position: "relative" }}>
                    <a
                      href={`https://${lib.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: "1rem",
                        padding: "0.9rem 1.1rem",
                        background: isRandom ? t.highlightBg : t.cardBg,
                        border: `1px solid ${isRandom ? t.highlightBorder : t.cardBorder}`,
                        borderRadius: 13, textDecoration: "none", cursor: "pointer",
                        transition: "background 0.14s,border-color 0.14s",
                        outline: "none",
                      }}
                      onMouseEnter={e => { if (!isRandom) { e.currentTarget.style.background = t.cardHoverBg; e.currentTarget.style.borderColor = t.cardHoverBorder; }}}
                      onMouseLeave={e => { if (!isRandom) { e.currentTarget.style.background = t.cardBg; e.currentTarget.style.borderColor = t.cardBorder; }}}
                      onFocus={e => { e.currentTarget.style.outline = `2px solid ${t.cardFocusBorder}`; e.currentTarget.style.outlineOffset = "2px"; }}
                      onBlur={e => { e.currentTarget.style.outline = "none"; }}
                    >
                      {/* dot */}
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0, boxShadow: isRandom ? `0 0 10px ${dot}` : "none" }} />

                      {/* content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: t.titleColor, letterSpacing: "-0.015em" }}>
                            {lib.name}
                          </span>
                          <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.1rem 0.45rem", borderRadius: 4, background: bg, color: txt }}>
                            {m.label}
                          </span>
                          {isNew && (
                            <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.1rem 0.45rem", borderRadius: 4, background: t.newBadgeBg, color: t.newBadgeText }}>
                              New
                            </span>
                          )}
                          <div style={{ display: "flex", gap: "0.25rem", marginLeft: "0.1rem" }}>
                            {stackTags(lib.cat)}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: t.descColor, lineHeight: 1.6 }}>
                          {lib.desc}
                        </div>
                        <div style={{ marginTop: "0.22rem", fontSize: 11, color: t.urlColor, fontFamily: "'SF Mono','Fira Code',monospace", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {lib.url}
                          <span style={{ fontSize: 10, color: t.countColor }}>· Verified {VERIFIED_DATE}</span>
                        </div>
                      </div>

                      {/* copy + arrow */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                        <button
                          onClick={e => copyUrl(lib.url, lib.id, e)}
                          title="Copy URL"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 7, border: `1px solid ${t.divider}`, background: isCopied ? t.newBadgeBg : t.copyBg, cursor: "pointer", color: isCopied ? t.newBadgeText : t.urlColor, transition: "all 0.15s", flexShrink: 0 }}
                        >
                          {isCopied
                            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                            : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          }
                        </button>
                        <div style={{ color: t.arrowColor }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M7 17L17 7M17 7H7M17 7v10"/>
                          </svg>
                        </div>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── SUGGESTION BOX ─────────────────────── */}
          <div style={{ marginTop: "2rem", borderRadius: 16, border: `1px solid ${t.suggBorder}`, background: t.suggBg, overflow: "hidden" }}>
            <button
              onClick={() => setSuggOpen(o => !o)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem 1.25rem", background: t.suggHeaderBg, border: "none", borderBottom: suggOpen ? `1px solid ${t.suggHeaderBorder}` : "1px solid transparent", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: 15 }}>💡</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 650, color: t.titleColor }}>Know a useful open-source resource?</div>
                  <div style={{ fontSize: 11.5, color: t.descColor, marginTop: 2 }}>If you know any free website, tool, or library that belongs here — send it our way.</div>
                </div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.accentPurple} strokeWidth="2.5"
                style={{ flexShrink: 0, transform: suggOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            <div style={{ maxHeight: suggOpen ? 620 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
              <div style={{ padding: "1.25rem" }}>
                {sent ? (
                  <div style={{ textAlign: "center", padding: "2rem 0", color: t.newBadgeText }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>✓</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Opening your email app…</div>
                    <div style={{ fontSize: 12, marginTop: 4, color: t.descColor }}>Thank you for the suggestion!</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: t.labelColor, marginBottom: "0.28rem" }}>Your name <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" style={inputStyle} onFocus={e => e.target.style.borderColor = t.accentPurple} onBlur={e => e.target.style.borderColor = t.inputBorder} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: t.labelColor, marginBottom: "0.28rem" }}>Website name <span style={{ color: "#ef4444" }}>*</span></label>
                        <input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="e.g. ShadcnBlocks" style={inputStyle} onFocus={e => e.target.style.borderColor = t.accentPurple} onBlur={e => e.target.style.borderColor = t.inputBorder} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: t.labelColor, marginBottom: "0.28rem" }}>Website URL <span style={{ color: "#ef4444" }}>*</span></label>
                      <input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} placeholder="e.g. shadcnblocks.com" style={inputStyle} onFocus={e => e.target.style.borderColor = t.accentPurple} onBlur={e => e.target.style.borderColor = t.inputBorder} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: t.labelColor, marginBottom: "0.28rem" }}>Why should it be listed? <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
                      <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Briefly describe what makes it useful or unique…" rows={3}
                        style={{ ...inputStyle, resize: "vertical", minHeight: 68, lineHeight: 1.55 }}
                        onFocus={e => e.target.style.borderColor = t.accentPurple}
                        onBlur={e => e.target.style.borderColor = t.inputBorder}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                      <p style={{ margin: 0, fontSize: 11, color: t.descColor }}>Opens your default email app with details pre-filled.</p>
                      <button onClick={handleSuggest} disabled={!siteName.trim() || !siteUrl.trim()}
                        style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.48rem 1rem", borderRadius: 8, border: "none", background: (!siteName.trim() || !siteUrl.trim()) ? "rgba(139,92,246,0.2)" : t.submitBg, color: (!siteName.trim() || !siteUrl.trim()) ? t.accentPurple : "#fff", fontSize: 13, fontWeight: 600, cursor: (!siteName.trim() || !siteUrl.trim()) ? "not-allowed" : "pointer", opacity: (!siteName.trim() || !siteUrl.trim()) ? 0.6 : 1 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                        Send suggestion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── FOOTER ──────────────────────────────── */}
          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: `1px solid ${t.divider}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p style={{ margin: "0 0 0.25rem", fontSize: 12.5, fontWeight: 600, color: t.descColor }}>UI Component Libraries Directory</p>
                <p style={{ margin: 0, fontSize: 11.5, color: t.footerText, lineHeight: 1.6, maxWidth: 440 }}>
                  A curated, community-maintained list of free and open-source UI resources. Maintained by developers, for developers. All links are hand-verified — last checked {VERIFIED_DATE}.
                </p>
              </div>
              <span style={{ fontSize: 11.5, color: t.countColor, whiteSpace: "nowrap" }}>{filtered.length} of {LIBS.length} shown</span>
            </div>
          </div>
        </main>
      </div>

      {/* ── FLOATING SUGGEST BUTTON ─────────────── */}
      {floatVisible && (
        <button
          onClick={() => { setSuggOpen(true); document.querySelector("[data-sugg]")?.scrollIntoView({ behavior: "smooth" }); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}
          title="Suggest a resource"
          style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 100, display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.6rem 1rem", borderRadius: 999, border: "none", background: t.floatBg, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.35)", transition: "opacity 0.2s,transform 0.2s", opacity: floatVisible ? 1 : 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Suggest
        </button>
      )}
    </div>
  );
}
