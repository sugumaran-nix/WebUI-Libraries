import { useState, useMemo, useEffect, useRef } from "react";

// ── Persist helpers ────────────────────────────────────────────────
function getRecent() {
  try { return JSON.parse(localStorage.getItem("uidir-recent") || "[]"); } catch { return []; }
}
function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("ui-folio-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function addRecent(lib) {
  try {
    const prev = getRecent().filter(r => r.id !== lib.id);
    localStorage.setItem("uidir-recent", JSON.stringify([lib, ...prev].slice(0, 5)));
  } catch {}
}

// ── URL state ─────────────────────────────────────────────────────
function getUrlParams() {
  if (typeof window === "undefined") return { cat: "all", q: "", stack: "all", sort: "featured", view: "list" };
  const p = new URLSearchParams(window.location.search);
  return {
    cat: p.get("cat") || "all",
    q: p.get("q") || "",
    stack: p.get("stack") || "all",
    sort: p.get("sort") || "featured",
    view: p.get("view") || "list",
  };
}
function setUrlParams(cat, q, stack, sort, view) {
  const p = new URLSearchParams();
  if (cat !== "all") p.set("cat", cat);
  if (q) p.set("q", q);
  if (stack !== "all") p.set("stack", stack);
  if (sort !== "featured") p.set("sort", sort);
  if (view !== "list") p.set("view", view);
  const str = p.toString();
  window.history.replaceState(null, "", str ? `?${str}` : window.location.pathname);
}

// ── Search highlight ──────────────────────────────────────────────
function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "rgba(193,125,60,0.18)", color: "inherit", borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Data ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",           label: "All" },
  { id: "animated",      label: "Animated" },
  { id: "shadcn",        label: "shadcn" },
  { id: "tailwind",      label: "Tailwind" },
  { id: "react",         label: "React" },
  { id: "vue-svelte",    label: "Vue / Svelte" },
  { id: "angular",       label: "Angular" },
  { id: "headless",      label: "Headless" },
  { id: "css",           label: "CSS / HTML" },
  { id: "collections",   label: "Collections" },
  { id: "design-tools",  label: "Design Tools" },
  { id: "dev-tools",     label: "Dev Tools" },
  { id: "inspiration",   label: "Inspiration" },
];

const CAT_RESOLVE = (cat) => cat === "multi" ? "vue-svelte" : cat;
const STACK_FILTERS = ["all", "React", "Tailwind", "Vue", "Svelte", "CSS", "Design"];
const SORT_OPTIONS = [
  { id:"featured", label:"Curated order" },
  { id:"newest", label:"Newest first" },
  { id:"az", label:"A → Z" },
];

// Category accent colors — muted ink tones, not neon
const CAT_COLOR = {
  animated:      "#B85C2C",
  shadcn:        "#2E7D52",
  tailwind:      "#1B6CA8",
  css:           "#7A5C1E",
  react:         "#1A6B7A",
  angular:       "#A02525",
  headless:      "#5B3A8A",
  "vue-svelte":  "#2A7A5A",
  multi:         "#2A7A5A",
  collections:   "#8A3A6A",
  "design-tools":"#6A3A8A",
  "dev-tools":   "#2A6A6A",
  inspiration:     "#8A5A2A",
};

const LIB_STACKS = {
  1:["React","Tailwind"], 2:["React","Tailwind"], 3:["React"],
  4:["React","Tailwind"], 5:["React","shadcn"],   6:["React"],
  7:["React"],            8:["React","Tailwind"], 9:["React"],
  10:["React","shadcn"],  11:["React"],           12:["React","Tailwind"],
  13:["React","Tailwind"],15:["React"],
  16:["React","shadcn"],  17:["React","shadcn"],  18:["React","shadcn"],
  19:["React","shadcn"],  20:["React","shadcn"],  21:["React","shadcn"],
  22:["React","shadcn"],  23:["React","shadcn"],  24:["React","shadcn"],
  25:["React","shadcn"],  26:["React","shadcn"],  27:["React","shadcn"],
  28:["React","shadcn"],  79:["React","shadcn"],
  29:["Tailwind"],        30:["Tailwind","React","Vue"],
  31:["Tailwind"],        32:["Tailwind"],        33:["Tailwind"],
  77:["Tailwind"],        78:["React","Tailwind"],34:["Tailwind"],
  35:["Tailwind"],        36:["Tailwind"],        37:["Tailwind"],
  38:["Tailwind"],        39:["Tailwind"],
  40:["CSS"],             41:["React","shadcn"],  42:["CSS"],
  43:["React","Tailwind"],44:["React","shadcn"],  45:["CSS"],
  46:["CSS"],             47:["CSS"],             48:["CSS"],
  49:["React"],  50:["React"],  51:["React"],  52:["React"],
  53:["React"],  54:["React"],  75:["React","Tailwind"],
  80:["React"],  81:["React"],  82:["React"],  83:["React"],
  85:["React"],  55:["React"],  56:["React"],  57:["React"],
  95:["Angular"],  96:["Angular"],  97:["Angular"],
  58:["React"],  59:["React","Vue"],  60:["React"],
  61:["React"],  84:["React","Vue","Svelte"],
  14:["Vue"],    62:["Svelte"],  63:["Svelte"],
  76:["React","Vue","Svelte"],  64:["Vue"],  65:["Vue"],  93:["Vue"],
  66:["React","Tailwind"],  67:["React","Tailwind","shadcn"],  68:["React"],
  70:["CSS","Tailwind"],  71:["CSS"],   87:["Design"],
  91:["Design"],          94:["CSS"],   86:["Design"],  90:["Design"],
  72:["React"],  73:["React","Vue","Svelte"],  88:["React","Vue"],  89:["Design"],
  98:["Tailwind"],  99:["React"],  100:["React"],
  101:["Design"],   102:["Design"], 103:["Design","CSS"],
  104:["Tailwind"], 105:["Design","CSS"],
  137:["Design"], 138:["Design"], 139:["Design"], 140:["Design"], 141:["Design"], 142:["Design"], 143:["Design"], 144:["Design"],
  145:["Design"], 146:["Design"], 147:["Design"], 148:["CSS"], 149:["Design"], 150:["React"], 151:["Vue"], 152:["React","Tailwind"],
};

const LIBS = [
  { id:1,  name:"Aceternity UI",        url:"ui.aceternity.com",                   cat:"animated",      desc:"Stunning animated components built with Tailwind CSS and Framer Motion", added:"2024-01" },
  { id:2,  name:"Magic UI",             url:"magicui.design",                      cat:"animated",      desc:"150+ free animated React components for marketing sites and SaaS products", added:"2024-02" },
  { id:3,  name:"Motion Primitives",    url:"motion-primitives.com",               cat:"animated",      desc:"Copy-paste motion primitives for building beautiful animated React interfaces", added:"2024-03" },
  { id:4,  name:"Eldora UI",            url:"eldoraui.site",                       cat:"animated",      desc:"Animated React components inspired by shadcn/ui, Aceternity UI, and Magic UI", added:"2024-04" },
  { id:5,  name:"Cult UI",              url:"cult-ui.com",                         cat:"animated",      desc:"Animated React components built on shadcn/ui with a dark-mode-first aesthetic", added:"2024-05" },
  { id:6,  name:"Animata",              url:"animata.design",                      cat:"animated",      desc:"Hand-crafted interaction and animation components for creative interfaces", added:"2024-06" },
  { id:7,  name:"UI Layout",            url:"ui-layout.com",                       cat:"animated",      desc:"Complex layout patterns with smooth animation support for React apps", added:"2024-07" },
  { id:8,  name:"Lukacho UI",           url:"ui.lukacho.com",                      cat:"animated",      desc:"Minimal animated UI kit for modern React apps", added:"2024-08" },
  { id:9,  name:"ReactBits",            url:"reactbits.dev",                       cat:"animated",      desc:"Animated React components for creative, expressive UIs", added:"2024-09" },
  { id:10, name:"SmoothUI",             url:"smoothui.dev",                        cat:"animated",      desc:"130+ micro-interaction components built on Motion, compatible with shadcn/ui", added:"2024-10" },
  { id:11, name:"Fancy Components",     url:"fancycomponents.dev",                 cat:"animated",      desc:"Distinctive animated component collection for creative developers", added:"2024-11" },
  { id:12, name:"CuiCui",               url:"cuicui.day",                          cat:"animated",      desc:"Daily component drops with polished motion design", added:"2024-12" },
  { id:13, name:"SyntaxUI",             url:"syntaxui.com",                        cat:"animated",      desc:"Animated component library with live code previews and Tailwind integration", added:"2024-13" },
  { id:15, name:"UI Labs",              url:"uilabs.dev",                          cat:"animated",      desc:"Experimental fine UI — carefully crafted React components and interactions", added:"2024-15" },
  { id:16, name:"shadcn/ui",            url:"ui.shadcn.com",                       cat:"shadcn",        desc:"The gold standard — accessible components installed via CLI into your own codebase", added:"2023-01" },
  { id:17, name:"21st.dev",             url:"21st.dev",                            cat:"shadcn",        desc:"The npm for design engineers — component registry with thousands of community components", added:"2024-01" },
  { id:18, name:"Origin UI",            url:"originui.com",                        cat:"shadcn",        desc:"Beautiful SaaS-focused shadcn/ui components built with a design-first approach", added:"2024-02" },
  { id:19, name:"Shadcnblocks",         url:"shadcnblocks.com",                    cat:"shadcn",        desc:"1,700+ full page sections and blocks for shadcn/ui projects", added:"2024-03" },
  { id:20, name:"HextaUI",              url:"hextaui.com",                         cat:"shadcn",        desc:"Modern shadcn/ui extensions with refined aesthetics and smooth animations", added:"2024-04" },
  { id:21, name:"KokonutUI",            url:"kokonutui.com",                       cat:"shadcn",        desc:"Accessible, production-ready shadcn/ui component extensions", added:"2024-05" },
  { id:22, name:"Bundui",               url:"bundui.io",                           cat:"shadcn",        desc:"Curated shadcn/ui component bundles ready to drop into your project", added:"2024-06" },
  { id:23, name:"Skiper UI",            url:"skiper-ui.com",                       cat:"shadcn",        desc:"24 free animated components built on top of shadcn/ui", added:"2024-07" },
  { id:24, name:"lndev/ui",             url:"ui.lndev.me",                         cat:"shadcn",        desc:"Indie-crafted shadcn/ui extensions with a unique visual personality", added:"2024-08" },
  { id:25, name:"ReUI",                 url:"reui.io",                             cat:"shadcn",        desc:"Enterprise-grade shadcn/ui extensions with Radix and Base UI support", added:"2024-09" },
  { id:26, name:"MynaUI",               url:"mynaui.com",                          cat:"shadcn",        desc:"Elegant shadcn/ui components with consistent visual language", added:"2024-10" },
  { id:27, name:"BadtzUI",              url:"badtz-ui.com",                        cat:"shadcn",        desc:"Core-free shadcn/ui extensions updated every week", added:"2024-11" },
  { id:28, name:"Nyxb UI",              url:"nyxbui.design",                       cat:"shadcn",        desc:"Dark-mode-first shadcn/ui components with rich motion and expressive design", added:"2024-12" },
  { id:79, name:"Kibo UI",              url:"kibo-ui.com",                         cat:"shadcn",        desc:"Advanced shadcn/ui registry: color pickers, QR codes, drag-drop uploaders", added:"2024-13" },
  { id:29, name:"DaisyUI",              url:"daisyui.com",                         cat:"tailwind",      desc:"The most popular Tailwind CSS component library — 65 components, 35 themes", added:"2021-01" },
  { id:30, name:"Flowbite",             url:"flowbite.com",                        cat:"tailwind",      desc:"Tailwind component library with React, Vue, Svelte adapters and a Figma kit", added:"2021-02" },
  { id:31, name:"Preline UI",           url:"preline.co",                          cat:"tailwind",      desc:"Fully responsive Tailwind HTML components with Alpine.js interactivity", added:"2022-01" },
  { id:32, name:"HyperUI",              url:"hyperui.dev",                         cat:"tailwind",      desc:"Free Tailwind components for ecommerce, marketing, and application UIs", added:"2022-02" },
  { id:33, name:"Meraki UI",            url:"merakiui.com",                        cat:"tailwind",      desc:"RTL-supported Tailwind CSS UI components", added:"2022-03" },
  { id:77, name:"Sailboat UI",          url:"sailboatui.com",                      cat:"tailwind",      desc:"150+ Tailwind CSS components with Alpine.js interactivity", added:"2023-01" },
  { id:78, name:"TailGrids",            url:"tailgrids.com",                       cat:"tailwind",      desc:"600+ React + Tailwind components, blocks, and templates", added:"2023-02" },
  { id:34, name:"FlyonUI",              url:"flyonui.com",                         cat:"tailwind",      desc:"Semantic Tailwind components on DaisyUI and Alpine.js", added:"2023-03" },
  { id:35, name:"Penguin UI",           url:"penguinui.com",                       cat:"tailwind",      desc:"Simple, clean, and accessible Tailwind CSS components", added:"2023-04" },
  { id:36, name:"Tailkits",             url:"tailkits.com",                        cat:"tailwind",      desc:"Curated Tailwind CSS component marketplace", added:"2023-05" },
  { id:37, name:"Tailus HTML",          url:"html.tailus.io",                      cat:"tailwind",      desc:"Tailwind CSS components with refined design standards and P3 color support", added:"2023-06" },
  { id:38, name:"DevUI",                url:"devui.in",                            cat:"tailwind",      desc:"Developer-centric Tailwind components with a code-first DX", added:"2023-07" },
  { id:39, name:"Tailblocks",           url:"tailblocks.cc",                       cat:"tailwind",      desc:"Ready-to-use Tailwind CSS blocks for rapid prototyping", added:"2021-03" },
  { id:40, name:"Uiverse",              url:"uiverse.io",                          cat:"css",           desc:"Thousands of community-created CSS elements and components", added:"2022-01" },
  { id:41, name:"Dot Matrix",           url:"dotmatrix.zzzzshawn.cloud",           cat:"css",           desc:"55+ dot-matrix loaders built with React, TypeScript, Tailwind, and shadcn", added:"2026-01" },
  { id:42, name:"Shapes Gallery",       url:"shapes.gallery",                      cat:"css",           desc:"Pure CSS shape collection for creative backgrounds and flourishes", added:"2023-01" },
  { id:43, name:"RareUI",               url:"rareui.com",                          cat:"css",           desc:"Rare animated React components built with Tailwind and Motion", added:"2024-01" },
  { id:44, name:"Indie Starter UI",     url:"ui.indie-starter.dev",               cat:"css",           desc:"Minimal React + shadcn components for indie developers who want to ship fast", added:"2024-02" },
  { id:45, name:"FlashUI",              url:"flashui.site",                        cat:"css",           desc:"Zero-install paste-and-go CSS UI elements", added:"2024-03" },
  { id:46, name:"Ever UI",              url:"ever-ui.com",                         cat:"css",           desc:"Evergreen CSS components built for long-term browser support", added:"2024-04" },
  { id:47, name:"Chakra Framer",        url:"chakraframer.com",                    cat:"css",           desc:"CSS motion templates inspired by Framer's design system", added:"2024-05" },
  { id:48, name:"Ground Bossadizenith", url:"ground.bossadizenith.me",            cat:"css",           desc:"Experimental CSS ground-level components and visual effects", added:"2024-06" },
  { id:49, name:"HeroUI",               url:"heroui.com",                          cat:"react",         desc:"Beautiful React components (formerly NextUI) — 100+ accessible, themeable components", added:"2022-01" },
  { id:50, name:"Mantine",              url:"mantine.dev",                         cat:"react",         desc:"Feature-rich React library with 100+ components and 50+ hooks", added:"2021-01" },
  { id:51, name:"Chakra UI",            url:"chakra-ui.com",                       cat:"react",         desc:"Accessible, composable React components with dark mode out of the box", added:"2020-01" },
  { id:52, name:"PrimeReact",           url:"primereact.org",                      cat:"react",         desc:"90+ React UI components with rich theming support", added:"2019-01" },
  { id:53, name:"MUI",                  url:"mui.com",                             cat:"react",         desc:"The most widely used React UI framework — Material Design and Joy UI systems", added:"2016-01" },
  { id:54, name:"Ant Design",           url:"ant.design",                          cat:"react",         desc:"Enterprise-grade React UI library from Alibaba", added:"2016-02" },
  { id:75, name:"Tremor",               url:"tremor.so",                           cat:"react",         desc:"35+ React components for dashboards — charts, KPI cards, data tables", added:"2023-01" },
  { id:80, name:"Fluent UI",            url:"react.fluentui.dev",                 cat:"react",         desc:"Microsoft's React library with 950+ cross-platform components", added:"2020-01" },
  { id:81, name:"Blueprint",            url:"blueprintjs.com",                     cat:"react",         desc:"Palantir's React UI toolkit for data-dense desktop applications", added:"2017-01" },
  { id:82, name:"Semantic UI React",    url:"react.semantic-ui.com",              cat:"react",         desc:"Human-friendly declarative React APIs — 100+ components", added:"2016-01" },
  { id:83, name:"CoreUI React",         url:"coreui.io/react",                    cat:"react",         desc:"Bootstrap-based React library with admin dashboard templates", added:"2018-01" },
  { id:85, name:"React Bootstrap",      url:"react-bootstrap.github.io",          cat:"react",         desc:"Bootstrap rebuilt as true React components — no jQuery", added:"2019-01" },
  { id:55, name:"Gluestack",            url:"gluestack.io",                        cat:"react",         desc:"Free React + React Native component library — one codebase, two platforms", added:"2023-01" },
  { id:56, name:"React Suite",          url:"rsuitejs.com",                        cat:"react",         desc:"Comprehensive React component suite for enterprise applications", added:"2017-01" },
  { id:57, name:"Grommet",              url:"v2.grommet.io",                       cat:"react",         desc:"Accessibility-first React library backed by HPE", added:"2015-01" },
  { id:95, name:"Angular Material",     url:"material.angular.io",                 cat:"angular",       desc:"Google's official Angular UI library — Material Design components", added:"2016-01" },
  { id:96, name:"PrimeNG",              url:"primeng.org",                         cat:"angular",       desc:"The most complete Angular UI component suite — 80+ components, MIT-licensed", added:"2016-02" },
  { id:97, name:"NG-ZORRO",             url:"ng.ant.design",                       cat:"angular",       desc:"Enterprise Angular UI library based on Ant Design — 60+ components", added:"2017-01" },
  { id:58, name:"Radix UI",             url:"radix-ui.com",                        cat:"headless",      desc:"Unstyled, fully accessible React components — the foundation of shadcn/ui", added:"2021-01" },
  { id:59, name:"Headless UI",          url:"headlessui.com",                      cat:"headless",      desc:"Completely unstyled, fully accessible UI components by the Tailwind CSS team", added:"2020-01" },
  { id:60, name:"Base UI",              url:"base-ui.com",                         cat:"headless",      desc:"Unstyled React components from the MUI team — the active Radix alternative", added:"2023-01" },
  { id:61, name:"React Aria",           url:"react-spectrum.adobe.com/react-aria", cat:"headless",     desc:"Adobe's React Hooks for accessible UI primitives — rock-solid ARIA compliance", added:"2020-01" },
  { id:84, name:"Ark UI",               url:"ark-ui.com",                          cat:"headless",      desc:"45+ headless, zero-style, framework-agnostic accessible UI primitives", added:"2023-01" },
  { id:14, name:"Inspira UI",           url:"inspira-ui.com",                      cat:"multi",         desc:"Animated component library for Vue — the Vue equivalent of Magic UI", added:"2024-01" },
  { id:62, name:"shadcn-svelte",        url:"shadcn-svelte.com",                   cat:"multi",         desc:"shadcn/ui ported to Svelte — all the power, native Svelte syntax", added:"2023-01" },
  { id:63, name:"Flowbite Svelte",      url:"flowbite-svelte.com",                 cat:"multi",         desc:"Flowbite component library for Svelte with full feature parity", added:"2023-02" },
  { id:76, name:"Float UI",             url:"floatui.com",                         cat:"multi",         desc:"Free multi-framework UI components — React, Vue, Svelte, and plain HTML", added:"2023-03" },
  { id:64, name:"Vuetify",              url:"vuetifyjs.com",                       cat:"multi",         desc:"Material Design component framework for Vue — 80+ components", added:"2016-01" },
  { id:65, name:"PrimeVue",             url:"primevue.org",                        cat:"multi",         desc:"The ultimate Vue UI component library — 90+ components, 11 themes, Figma kit", added:"2019-01" },
  { id:93, name:"Nuxt UI",              url:"ui.nuxt.com",                         cat:"multi",         desc:"125+ accessible Tailwind components for Vue and Nuxt — v4 completely free", added:"2026-01" },
  { id:66, name:"Untitled UI React",    url:"untitledui.com/react",                cat:"collections",   desc:"React implementation of the Untitled UI Figma design system", added:"2026-01" },
  { id:67, name:"Tailark",              url:"tailark.com",                         cat:"collections",   desc:"Marketing-focused block library with distinctive design language", added:"2024-01" },
  { id:68, name:"React Keep Design",    url:"react.keepdesign.io",                 cat:"collections",   desc:"Design-driven React component collection with Figma workflow support", added:"2023-01" },
  { id:70, name:"Pattern Craft",        url:"patterncraft.dev",                    cat:"design-tools",  desc:"100+ CSS and Tailwind background patterns, copy-paste ready", added:"2024-01" },
  { id:71, name:"Gradienty",            url:"gradienty.codes",                     cat:"design-tools",  desc:"CSS gradient generator — browse, customize, and copy in one click", added:"2023-01" },
  { id:87, name:"Coolors",              url:"coolors.co",                          cat:"design-tools",  desc:"Fast color palette generator — create, explore, and share beautiful palettes", added:"2015-01" },
  { id:91, name:"Blobmaker",            url:"blobmaker.app",                       cat:"design-tools",  desc:"Generate unique SVG blob shapes for backgrounds and decorative elements", added:"2019-01" },
  { id:94, name:"CSS Clip-Path Maker",  url:"bennettfeely.com/clippy",             cat:"design-tools",  desc:"Visual CSS clip-path shape generator — no code needed", added:"2015-01" },
  { id:86, name:"Google Fonts",         url:"fonts.google.com",                    cat:"design-tools",  desc:"1,500+ free open-source web fonts", added:"2010-01" },
  { id:90, name:"LottieFiles",          url:"lottiefiles.com",                     cat:"design-tools",  desc:"Create, edit, preview, and share lightweight Lottie web animations", added:"2017-01" },
  { id:72, name:"Lordicon",             url:"lordicon.com",                        cat:"dev-tools",     desc:"1000+ animated Lottie icons with a free tier", added:"2020-01" },
  { id:73, name:"Lucide Icons",         url:"lucide.dev",                          cat:"dev-tools",     desc:"1000+ open-source icons — MIT-licensed, React/Vue/Svelte packages included", added:"2021-01" },
  { id:88, name:"Iconify",              url:"iconify.design",                      cat:"dev-tools",     desc:"250,000+ SVG icons from 150+ icon sets under one unified API", added:"2020-01" },
  { id:89, name:"Squoosh",              url:"squoosh.app",                         cat:"dev-tools",     desc:"Open-source browser-based image compression — no upload, fully private", added:"2018-01" },
  { id:98, name:"Pines UI",             url:"devdojo.com/pines",                   cat:"tailwind",      desc:"Copy-paste Alpine.js + Tailwind UI library — animations, sliders, modals, tooltips, accordions, zero dependencies", added:"2026-02" },
  { id:99, name:"Tamagui",              url:"tamagui.dev",                         cat:"react",         desc:"Cross-platform React + React Native style library and UI kit with an optimizing compiler", added:"2026-02" },
  { id:100,name:"NativeWind",           url:"nativewind.dev",                      cat:"multi",         desc:"Tailwind CSS as a universal style system for React Native — same utility classes on iOS, Android, and web", added:"2026-02" },
  { id:101,name:"fffuel",               url:"fffuel.co",                           cat:"design-tools",  desc:"Collection of free SVG generators for gradients, patterns, textures, blob shapes, and cool backgrounds", added:"2026-02" },
  { id:102,name:"WebGradients",         url:"webgradients.com",                    cat:"design-tools",  desc:"180 free linear gradients as CSS code, Sketch swatches, and PNG — copy-paste or download instantly", added:"2026-02" },
  { id:103,name:"CSS Gradient",         url:"cssgradient.io",                      cat:"design-tools",  desc:"Free CSS gradient generator with live preview — create linear, radial, and conic gradients visually", added:"2026-02" },
    { id:104,name:"Pinemix",              url:"pinemix.dev",                         cat:"tailwind",     desc:"Free open-source Alpine.js components styled with Tailwind CSS — accessible, interactive, copy-paste ready", added:"2026-02" },
  { id:105,name:"FrontendBaba",         url:"frontendbaba.dev",                    cat:"dev-tools",     desc:"Free browser-based frontend tools — CSS gradient, clip-path, blob, glassmorphism, shadow generators", added:"2026-02" },

  // Inspiration — curated galleries, UI references, and real-world flows
  { id:106,name:"Godly",                 url:"godly.design",                        cat:"inspiration",   desc:"Curated gallery of interesting web, app, UI, and visual design work, with sections for websites, heroes, CTAs, logos, and app screens", added:"2026-08" },
  { id:107,name:"Recent Design",         url:"recent.design",                       cat:"inspiration",   desc:"Daily curation of exceptional design, websites, interfaces, tools, typography, motion, and more", added:"2026-08" },
  { id:108,name:"Unsection",             url:"unsection.com",                       cat:"inspiration",   desc:"Curated library of 4,000+ website sections, hover effects, style filters, and a growing SVG library", added:"2026-08" },
  { id:109,name:"Detail",                url:"detail.design",                       cat:"inspiration",   desc:"Small interface details and interaction patterns covering accessibility, motion, optimization, and copywriting", added:"2026-08" },
  { id:110,name:"BentoGrids",            url:"bentogrids.com",                      cat:"inspiration",   desc:"Curated gallery of bento layouts, cards, templates, and real product examples with source links", added:"2026-08" },
  { id:111,name:"UIBits.co",             url:"uibits.co",                            cat:"inspiration",   desc:"Daily-curated UI inspiration library for discovering interface ideas and visual references", added:"2026-08" },
  { id:112,name:"Design Spells",         url:"designspells.com",                    cat:"inspiration",   desc:"Curated design details and small interactions that add polish and character to interfaces", added:"2026-08" },
  { id:113,name:"Viewport UI",            url:"viewport-ui.design",                  cat:"inspiration",   desc:"Curated UI experiences and interface references for product and web designers", added:"2026-08" },
  { id:114,name:"Lookup.design",          url:"lookup.design",                       cat:"inspiration",   desc:"Searchable collection of realistic design examples for product and interface research", added:"2026-08" },
  { id:115,name:"Design Vault",           url:"designvault.io",                      cat:"inspiration",   desc:"UI patterns and design inspiration collected from real products", added:"2026-08" },
  { id:116,name:"Interface Index",        url:"interface-index.com",                 cat:"inspiration",   desc:"Interface elements from B2B, SaaS, desktop apps, and digital services", added:"2026-08" },
  { id:117,name:"UI.live",                url:"ui.live",                              cat:"inspiration",   desc:"Community gallery for sharing and discovering notable design work", added:"2026-08" },
  { id:118,name:"Mobbin",                url:"mobbin.com",                           cat:"inspiration",   desc:"Searchable library of real mobile and web product screenshots for UI research", added:"2026-08" },
  { id:119,name:"Page Flows",            url:"pageflows.com",                       cat:"inspiration",   desc:"Real-world user-flow recordings, screens, annotations, and UX patterns from leading apps and websites", added:"2026-08" },
  { id:120,name:"SaaSFrame",             url:"saasframe.io",                        cat:"inspiration",   desc:"Large UI and UX library focused on SaaS product interfaces and website patterns", added:"2026-08" },

  // Web galleries — community showcases and award collections
  { id:121,name:"SiteInspire",           url:"siteinspire.com",                     cat:"collections",   desc:"Showcase of the web's finest design and talent, searchable by style, type, subject, and platform", added:"2026-08" },
  { id:122,name:"Httpster",              url:"httpster.net",                        cat:"collections",   desc:"Website design inspiration gallery featuring thousands of sites from designers around the world", added:"2026-08" },
  { id:123,name:"Awwwards",              url:"awwwards.com",                        cat:"collections",   desc:"Award platform and inspiration gallery for innovative websites, creative studios, and digital experiences", added:"2026-08" },
  { id:124,name:"The FWA",               url:"thefwa.com",                          cat:"collections",   desc:"Long-running awards and showcase platform for cutting-edge web design and development", added:"2026-08" },
  { id:125,name:"Hoverstates",           url:"hoverstat.es",                        cat:"collections",   desc:"Alternative design, code, and content from the wider web, curated for creative inspiration", added:"2026-08" },
  { id:126,name:"Site of Sites",         url:"siteofsites.co",                      cat:"collections",   desc:"Growing collection of go-to web design inspiration and standout website references", added:"2026-08" },
  { id:127,name:"Websitevice",           url:"websitevice.com",                     cat:"collections",   desc:"Casual website examples for practical, real-world web design inspiration", added:"2026-08" },
  { id:128,name:"Dark Mode Design",      url:"darkmodedesign.com",                  cat:"collections",   desc:"Showcase of thoughtfully designed dark-mode websites and interfaces", added:"2026-08" },
  { id:129,name:"Siiimple",              url:"siiimple.com",                        cat:"collections",   desc:"Hand-picked collection of simple, polished, and visually focused websites", added:"2026-08" },
  { id:130,name:"SiteSee",               url:"sitesee.co",                          cat:"collections",   desc:"Curated gallery of beautiful, modern websites and landing pages", added:"2026-08" },
  { id:131,name:"TOOOLS.design",          url:"toools.design",                       cat:"collections",   desc:"Curated directory of design inspiration for UI, web, mobile, SaaS, branding, illustration, motion, and more", added:"2026-08" },

  // Additional component and accessibility systems
  { id:132,name:"AlignUI",               url:"alignui.com",                         cat:"react",         desc:"React and Tailwind design system with open-source base components, Figma support, responsive layouts, and accessible patterns", added:"2026-08" },
  { id:133,name:"React Spectrum",        url:"react-spectrum.adobe.com",             cat:"react",         desc:"Adobe's React implementation and accessibility-focused design system for building robust interfaces", added:"2026-08" },
  { id:134,name:"Park UI",               url:"park-ui.com",                          cat:"react",         desc:"Beautiful components built with Ark UI and Panda CSS for React and Solid design systems", added:"2026-08" },
  { id:135,name:"Konsta UI",             url:"konstaui.com",                         cat:"multi",         desc:"MIT-licensed mobile UI components with pixel-perfect iOS and Material themes for React, Vue, and Svelte", added:"2026-08" },
  { id:136,name:"Zag.js",                url:"zagjs.com",                            cat:"headless",      desc:"Framework-agnostic state machines for accessible, interactive UI components and design systems", added:"2026-08" },

  // Trending discoveries — surfaced by Reddit and public Instagram/Reels signals
  { id:137,name:"60fps",                  url:"60fps.design",                        cat:"inspiration",   desc:"Curated library of 2,000+ UI animation and interaction details from best-in-class mobile and web apps", added:"2026-08" },
  { id:138,name:"Godly Websites",         url:"godly.website",                       cat:"inspiration",   desc:"Daily curation of exceptional design, websites, tools, typography, motion, and visual references", added:"2026-08" },
  { id:139,name:"UXArchive",              url:"uxarchive.com",                       cat:"inspiration",   desc:"Searchable archive of real mobile app flows and interaction patterns with thousands of steps to study", added:"2026-08" },
  { id:140,name:"Refero",                 url:"refero.design",                       cat:"inspiration",   desc:"Design research library of real product screens, flows, UI patterns, and searchable interface references", added:"2026-08" },
  { id:141,name:"Stark",                  url:"getstark.co",                         cat:"design-tools",  desc:"Accessibility platform for design, code, and live-product workflows with Figma, Sketch, browser, and GitHub integrations", added:"2026-08" },
  { id:142,name:"Contrast Grid",          url:"contrast-grid.eightshapes.com",       cat:"design-tools",  desc:"Fast WCAG contrast checker for testing many foreground and background color combinations at once", added:"2026-08" },
  { id:143,name:"Laws of UX",             url:"lawsofux.com",                        cat:"inspiration",   desc:"Collection of UX best practices and behavioral principles for building clearer, more usable interfaces", added:"2026-08" },
  { id:144,name:"Growth.Design",          url:"growth.design",                       cat:"inspiration",   desc:"Short, visual UX case studies and product psychology lessons delivered through interactive comics", added:"2026-08" },
  { id:145,name:"Nielsen Norman Group",   url:"nngroup.com",                          cat:"inspiration",   desc:"Research-backed UX articles, videos, courses, and usability guidance from the Nielsen Norman Group", added:"2026-08" },
  { id:146,name:"UXtweak",                url:"uxtweak.com",                         cat:"design-tools",  desc:"End-to-end UX research platform for card sorting, tree testing, prototype testing, interviews, and surveys", added:"2026-08" },
  { id:147,name:"Maze Guides",            url:"maze.co/guides",                       cat:"design-tools",  desc:"Practical guides and reports for UX research, prototype testing, interviews, and AI-moderated research", added:"2026-08" },
  { id:148,name:"Axe DevTools",           url:"deque.com/axe/devtools",               cat:"dev-tools",     desc:"Automated web and mobile accessibility testing tools for browser, IDE, CI/CD, and reporting workflows", added:"2026-08" },
  { id:149,name:"UXfolio",                url:"uxfolio.com",                          cat:"design-tools",  desc:"No-code UX portfolio builder with recruiter-friendly templates, case-study guidance, mockups, and hosting", added:"2026-08" },
  { id:150,name:"Once UI",                url:"once-ui.com",                          cat:"react",         desc:"Open-source React and Next.js design system with 100+ components, semantic layout primitives, and MIT-licensed core", added:"2026-08" },
  { id:151,name:"Naive UI",               url:"naiveui.com",                          cat:"multi",         desc:"Themeable Vue 3 component library with TypeScript support, dark mode, and a broad set of polished primitives", added:"2026-08" },
  { id:152,name:"v0",                     url:"v0.dev",                               cat:"dev-tools",     desc:"AI-powered interface builder that generates editable React and shadcn components from natural-language prompts", added:"2026-08" },
];

const NEW_IDS       = new Set(LIBS.filter(l => l.added?.startsWith("2026")).map(l => l.id));
const VERIFIED_DATE = "August 2026";
const RECIPIENT     = "sugumarankugan@gmail.com";

// ── Empty state ───────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <div style={{ textAlign:"center", padding:"5rem 1rem 4rem" }}>
      <div style={{ fontSize:32, marginBottom:12, opacity:0.25 }}>◎</div>
      <div style={{ fontSize:15, fontWeight:600, color:"#1C1A17", marginBottom:6 }}>Nothing found</div>
      <div style={{ fontSize:13, color:"#6B5F4B", marginBottom:20 }}>Try different keywords or clear filters</div>
      <button onClick={onClear} style={{ fontSize:13, fontWeight:500, color:"#C17D3C", background:"none", border:"1px solid #C17D3C50", borderRadius:6, padding:"0.4rem 1rem", cursor:"pointer", transition:"all 0.15s" }}
        onMouseEnter={e=>{e.currentTarget.style.background="#C17D3C10"}}
        onMouseLeave={e=>{e.currentTarget.style.background="none"}}>
        Clear filters
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const init = getUrlParams();
  const [active,      setActive]      = useState(init.cat);
  const [query,       setQuery]       = useState(init.q);
  const [debouncedQ,  setDebouncedQ]  = useState(init.q);
  const [stackFilter, setStackFilter] = useState(init.stack);
  const [sortBy,      setSortBy]      = useState(init.sort);
  const [viewMode,    setViewMode]    = useState(init.view);
  const [theme,       setTheme]       = useState(getInitialTheme);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [filterClosing,setFilterClosing]=useState(false);
  const [copiedId,    setCopiedId]    = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showTop,     setShowTop]     = useState(false);
  const [recent,      setRecent]      = useState(getRecent);
  const [suggOpen,    setSuggOpen]    = useState(false);
  const [name,        setName]        = useState("");
  const [siteName,    setSiteName]    = useState("");
  const [siteUrl,     setSiteUrl]     = useState("");
  const [reason,      setReason]      = useState("");
  const [sent,        setSent]        = useState(false);
  const searchRef = useRef(null);
  const listRef   = useRef(null);

  // Theme persistence and document chrome
  useEffect(() => {
    localStorage.setItem("ui-folio-theme", theme);
    document.documentElement.style.colorScheme = theme;
    document.body.style.background = theme === "dark" ? "#111126" : "#FFF9F1";
  }, [theme]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  // URL sync
  useEffect(() => { setUrlParams(active, query, stackFilter, sortBy, viewMode); }, [active, query, stackFilter, sortBy, viewMode]);

  // Page title
  useEffect(() => {
    const parts = [];
    if (active !== "all") parts.push(CATEGORIES.find(c => c.id === active)?.label || active);
    if (stackFilter !== "all") parts.push(stackFilter);
    if (query) parts.push(`"${query}"`);
    document.title = parts.length ? `${parts.join(" · ")} — UI / FOLIO` : "UI / FOLIO — Curated Interface Intelligence";
  }, [active, query, stackFilter, sortBy]);

  // Scroll listener
  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const fn = (e) => {
      const inInput = ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !inInput) { e.preventDefault(); searchRef.current?.focus(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setFilterOpen(true); }
      if (e.key === "Escape") {
        if (query) setQuery("");
        else closeDrawer();
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [query]);

  // Close drawer on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const fn = (e) => {
      if (!e.target.closest("[data-filter-drawer]") && !e.target.closest("[data-filter-btn]")) closeDrawer();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [filterOpen]);

  // Filtered results
  const filtered = useMemo(() => {
    const q = debouncedQ.toLowerCase();
    const matches = LIBS.filter(l => {
      const resolved = CAT_RESOLVE(l.cat);
      const stacks = LIB_STACKS[l.id] || [];
      const matchCat = active === "all" || resolved === active || l.cat === active;
      const matchStack = stackFilter === "all" || stacks.includes(stackFilter);
      const matchQ = !q || l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q) || stacks.some(s => s.toLowerCase().includes(q));
      return matchCat && matchStack && matchQ;
    });
    return [...matches].sort((a, b) => {
      if (sortBy === "az") return a.name.localeCompare(b.name);
      if (sortBy === "newest") return (b.added || "").localeCompare(a.added || "") || a.name.localeCompare(b.name);
      return 0;
    });
  }, [active, debouncedQ, sortBy, stackFilter]);

  // Category counts
  const counts = useMemo(() => {
    const c = { all: LIBS.length };
    LIBS.forEach(l => {
      const key = CAT_RESOLVE(l.cat);
      c[key] = (c[key] || 0) + 1;
    });
    return c;
  }, []);

  const activeFilters = (active !== "all" ? 1 : 0) + (query ? 1 : 0) + (stackFilter !== "all" ? 1 : 0) + (sortBy !== "featured" ? 1 : 0);
  const featured = useMemo(() => LIBS.filter(l => NEW_IDS.has(l.id)).slice(0, 4), []);

  function closeDrawer() {
    setFilterClosing(true);
    setTimeout(() => { setFilterOpen(false); setFilterClosing(false); }, 200);
  }
  function clearAll() { setQuery(""); setActive("all"); setStackFilter("all"); setSortBy("featured"); closeDrawer(); }
  function jumpToResults() { document.getElementById("results")?.scrollIntoView({ behavior:"smooth", block:"start" }); }

  function copyUrl(url, id, e) {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard?.writeText(`https://${url}`).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  }

  function shareFilter() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    });
  }

  function handleVisit(lib) { addRecent(lib); setRecent(getRecent()); }

  function handleSuggest() {
    if (!siteName.trim() || !siteUrl.trim()) return;
    const s = x => x.trim();
    const rawUrl = s(siteUrl).startsWith("http") ? s(siteUrl) : `https://${s(siteUrl)}`;
    const subject = encodeURIComponent(`UI Library Suggestion: ${s(siteName)}`);
    const body = encodeURIComponent(`Name: ${s(siteName)}\nURL: ${rawUrl}\n${s(reason)?`\nWhy: ${s(reason)}`:""}${s(name)?`\nFrom: ${s(name)}`:""}`);
    window.open(`mailto:${RECIPIENT}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
    setTimeout(() => { setSent(false); setName(""); setSiteName(""); setSiteUrl(""); setReason(""); }, 3000);
  }

  // ── Input style ───────────────────────────────────────────────
  const iStyle = {
    width:"100%", padding:"0.55rem 0.75rem",
    background:"#FFFFFF", border:"1px solid #D8D2C8",
    borderRadius:6, color:"#1C1A17", fontSize:"max(16px,13px)",
    outline:"none", boxSizing:"border-box", fontFamily:"inherit",
    transition:"border-color 0.15s", minHeight:40,
  };

  return (
    <div className="app-shell" data-theme={theme} style={{ minHeight:"100vh", background:"#F5F3EE", color:"#181714", fontFamily:"'DM Sans', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @keyframes fadeIn    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(100%)} }

        *, *::before, *::after { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#F7F5F0; }
        ::-webkit-scrollbar-thumb { background:#D8D2C8; border-radius:3px; }
        html { -webkit-text-size-adjust:100%; }
        body { margin:0; min-width:320px; }
        mark { background:transparent; }

        /* Card */
        .lib-card {
          display:flex; align-items:center; gap:0.75rem;
          padding:0.875rem 1rem;
          background:#FFFFFF;
          border:1px solid #E8E3DC;
          border-radius:10px;
          transition:border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
          cursor:pointer;
        }
        .lib-card:hover {
          border-color:#C17D3C50;
          box-shadow:0 4px 16px rgba(28,26,23,0.08);
          transform:translateY(-1px);
        }
        .lib-card:active { transform:translateY(0); transition-duration:0.06s; }
        .lib-card a:focus { outline:none; }
        .lib-card:focus-within { outline:2px solid #C17D3C80; outline-offset:2px; border-radius:10px; }

        /* Category pill */
        .cat-pill {
          display:inline-flex; align-items:center;
          font-size:10px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;
          padding:0.2rem 0.5rem; border-radius:4px;
          border:1px solid currentColor;
          opacity:0.7;
          transition:opacity 0.15s;
        }

        /* Stack tag */
        .stack-tag {
          font-size:10px; font-weight:400; letter-spacing:0.02em;
          padding:0.12rem 0.4rem; border-radius:4px;
          background:#F0EDE7; color:#6B5F4B;
          border:1px solid #E0D9D0;
        }

        /* New badge */
        .new-badge {
          font-size:9.5px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
          padding:0.15rem 0.45rem; border-radius:4px;
          background:#FEF3E2; color:#C17D3C;
          border:1px solid #F0D5A8;
        }

        /* Copy button */
        .copy-btn {
          display:flex; align-items:center; justify-content:center;
          width:28px; height:28px; border-radius:6px;
          border:1px solid #E8E3DC; background:#F7F5F0;
          color:#9B8E80; cursor:pointer;
          transition:all 0.15s ease;
          flex-shrink:0;
        }
        .copy-btn:hover { border-color:#C17D3C80; color:#C17D3C; background:#FEF3E2; }
        .copy-btn.copied { border-color:#2E7D5250; color:#2E7D52; background:#F0FAF4; }

        /* Category filter button */
        .cat-btn {
          width:100%; display:flex; align-items:center; justify-content:space-between;
          padding:0.55rem 0.75rem; border-radius:8px;
          border:1px solid transparent; background:transparent;
          color:#6B5F4B; font-size:14px; font-weight:400;
          cursor:pointer; text-align:left;
          transition:all 0.12s ease; font-family:inherit;
        }
        .cat-btn:hover { background:#F0EDE7; color:#1C1A17; }
        .cat-btn.active { background:#FEF3E2; color:#C17D3C; border-color:#F0D5A880; font-weight:600; }

        /* Search input */
        .search-input {
          width:100%; padding:0.5rem 1.75rem 0.5rem 2rem;
          background:#FFFFFF; border:1px solid #D8D2C8;
          border-radius:8px; color:#1C1A17;
          font-size:max(16px,13px); outline:none;
          font-family:inherit;
          transition:border-color 0.15s, box-shadow 0.15s;
        }
        .search-input:focus { border-color:#C17D3C; box-shadow:0 0 0 3px rgba(193,125,60,0.1); }
        .search-input::placeholder { color:#B0A898; }

        /* Control button */
        .ctrl-btn {
          display:flex; align-items:center; justify-content:center;
          border-radius:8px; border:1px solid #D8D2C8; background:#FFFFFF;
          color:#6B5F4B; cursor:pointer;
          transition:all 0.15s ease; font-family:inherit;
        }
        .ctrl-btn:hover { border-color:#C17D3C80; color:#C17D3C; background:#FEF3E2; }

        /* Drawer */
        .filter-drawer {
          position:fixed; bottom:0; left:0; right:0; z-index:90;
          background:#FDFCFA; border-top:1px solid #E8E3DC;
          border-radius:20px 20px 0 0;
          max-height:85vh; overflow-y:auto;
          box-shadow:0 -8px 40px rgba(28,26,23,0.12);
        }

        /* Suggest section */
        .suggest-panel {
          margin-top:1.5rem;
          border:1px solid #E8E3DC; border-radius:12px;
          background:#FFFFFF; overflow:hidden;
        }

        /* Floating top btn */
        .float-btn {
          width:40px; height:40px; border-radius:50%;
          border:1px solid #D8D2C8; background:#FFFFFF;
          color:#6B5F4B; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 2px 8px rgba(28,26,23,0.1);
          transition:all 0.15s ease;
        }
        .float-btn:hover { border-color:#C17D3C80; color:#C17D3C; }

        /* Recent chip */
        .recent-chip {
          font-size:11.5px; padding:0.2rem 0.6rem; border-radius:5px;
          background:#F0EDE7; border:1px solid #E0D9D0;
          color:#6B5F4B; text-decoration:none;
          display:inline-flex; align-items:center; gap:0.3rem;
          transition:all 0.12s ease;
        }
        .recent-chip:hover { background:#FEF3E2; border-color:#F0D5A8; color:#C17D3C; }

        /* Mobile */
        @media (max-width:599px) {
          .nav-title-sub { display:none !important; }
          .search-wrap { width:100% !important; order:3; }
          .suggest-link { display:none !important; }
        }
        @media (max-width:899px) {
          .nav-title h1 { font-size:1rem !important; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion:reduce) {
          *, *::before, *::after { transition-duration:0.01ms !important; animation-duration:0.01ms !important; }
        }

        :root { --ink:#181329; --muted:#726B84; --line:rgba(24,19,41,.12); --paper:#FFF9F1; --card:#FFFFFF; --accent:#C9F45A; --accent-ink:#17210B; --accent-2:#FF4D8D; --violet:#7C5CFC; --cyan:#36D1DC; --warm:#FFE2EC; --ease-out:cubic-bezier(.23,1,.32,1); }
        .app-shell[data-theme="light"] { --ink:#181329; --muted:#726B84; --line:rgba(24,19,41,.12); --paper:#FFF9F1; --card:#FFFFFF; --accent:#C9F45A; --accent-ink:#17210B; --accent-2:#FF4D8D; --violet:#7C5CFC; --cyan:#36D1DC; background-color:#FFF9F1 !important; color:#181329 !important; background-image:radial-gradient(circle at 8% 0%, rgba(255,255,255,.96), transparent 25rem), radial-gradient(circle at 98% 21%, rgba(255,77,141,.11), transparent 22rem), linear-gradient(rgba(124,92,252,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,.035) 1px, transparent 1px) !important; }
        .app-shell[data-theme="dark"] { --ink:#F9F7FF; --muted:#A9A3C2; --line:rgba(255,255,255,.12); --paper:#111126; --card:#19183A; --accent:#D7FF5D; --accent-ink:#101126; --accent-2:#FF6FA9; --violet:#A28BFF; --cyan:#5FE4EC; background-color:#111126 !important; color:#F9F7FF !important; background-image:radial-gradient(circle at 2% 0%, rgba(124,92,252,.24), transparent 27rem), radial-gradient(circle at 100% 24%, rgba(255,77,141,.16), transparent 23rem), linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px) !important; }
        .app-shell[data-theme="light"] .topbar { background:rgba(255,249,241,.84) !important; border-color:rgba(24,19,41,.1) !important; }
        .app-shell[data-theme="dark"] .topbar { background:rgba(17,17,38,.82) !important; border-color:rgba(255,255,255,.1) !important; }
        .app-shell[data-theme="light"] .hero-panel { background:linear-gradient(118deg,#6547F5 0%,#8A53F2 46%,#FF4D8D 100%) !important; box-shadow:0 28px 72px rgba(124,92,252,.25) !important; }
        .app-shell[data-theme="dark"] .hero-panel { background:linear-gradient(118deg,#241A55 0%,#3A2471 46%,#641F52 100%) !important; box-shadow:0 28px 72px rgba(0,0,0,.36) !important; }
        .app-shell[data-theme="light"] .hero-panel::after { border-color:rgba(201,244,90,.5) !important; box-shadow:0 0 0 36px rgba(201,244,90,.08),0 0 0 76px rgba(255,255,255,.08),0 0 0 118px rgba(255,77,141,.08) !important; }
        .app-shell[data-theme="dark"] .hero-panel::after { border-color:rgba(215,255,93,.4) !important; }
        .app-shell[data-theme="dark"] .brand-name, .app-shell[data-theme="dark"] .section-title, .app-shell[data-theme="dark"] .result-count, .app-shell[data-theme="dark"] .featured-card h3 { color:#F9F7FF !important; }
        .app-shell[data-theme="dark"] .brand-sub, .app-shell[data-theme="dark"] .section-eyebrow, .app-shell[data-theme="dark"] .result-context, .app-shell[data-theme="dark"] .featured-card p { color:#A9A3C2 !important; }
        .app-shell[data-theme="dark"] .featured-card, .app-shell[data-theme="dark"] .discovery-toolbar, .app-shell[data-theme="dark"] .recent-chip, .app-shell[data-theme="dark"] .suggest-panel { background:#19183A !important; border-color:rgba(255,255,255,.12) !important; color:#F9F7FF !important; }
        .app-shell[data-theme="light"] .featured-card, .app-shell[data-theme="light"] .discovery-toolbar, .app-shell[data-theme="light"] .suggest-panel { background:rgba(255,255,255,.82) !important; border-color:rgba(24,19,41,.1) !important; }
        .app-shell[data-theme="dark"] .sort-select, .app-shell[data-theme="dark"] .view-toggle, .app-shell[data-theme="dark"] .stack-chip { background:#211F47 !important; border-color:rgba(255,255,255,.14) !important; color:#C9C4E1 !important; }
        .app-shell[data-theme="dark"] .stack-chip.active, .app-shell[data-theme="dark"] .view-toggle button.active { background:#D7FF5D !important; color:#101126 !important; border-color:#D7FF5D !important; }
        .app-shell[data-theme="dark"] .lib-card { background:#19183A !important; border-color:rgba(255,255,255,.11) !important; box-shadow:0 10px 28px rgba(0,0,0,.13) !important; }
        .app-shell[data-theme="dark"] .lib-card span[style*="color:#1C1A17"], .app-shell[data-theme="dark"] .lib-card div[style*="color:#6B5F4B"] { color:#F9F7FF !important; }
        .app-shell[data-theme="dark"] .lib-card div[style*="color:#6B5F4B"] { color:#B7B1CC !important; }
        .app-shell[data-theme="dark"] .search-input { background:#19183A !important; color:#F9F7FF !important; border-color:rgba(255,255,255,.16) !important; }
        .app-shell[data-theme="light"] .search-input { background:#FFFFFF !important; color:#181329 !important; border-color:rgba(24,19,41,.12) !important; }
        .app-shell[data-theme="dark"] .theme-toggle, .app-shell[data-theme="dark"] .ctrl-btn { background:#19183A !important; border-color:rgba(255,255,255,.15) !important; color:#C9C4E1 !important; }
        .app-shell[data-theme="light"] .theme-toggle, .app-shell[data-theme="light"] .ctrl-btn { background:#FFFFFF !important; border-color:rgba(24,19,41,.12) !important; color:#726B84 !important; }
        .page-layout { display:grid; grid-template-columns:190px minmax(0,1fr); gap:clamp(1rem,3vw,2.4rem); align-items:start; }
        .content-stream { min-width:0; }
        .browse-rail { position:sticky; top:5.75rem; align-self:start; padding:.75rem 0; }
        .rail-heading { display:flex; flex-direction:column; gap:.25rem; margin:0 0 1rem; }
        .rail-heading strong { color:var(--ink); font-family:'DM Serif Display',Georgia,serif; font-size:1.35rem; font-weight:400; letter-spacing:-.04em; }
        .rail-kicker { color:var(--accent-2); font-size:9px; font-weight:800; letter-spacing:.15em; text-transform:uppercase; }
        .rail-category-list { display:flex; flex-direction:column; gap:.18rem; }
        .rail-category { display:flex; align-items:center; justify-content:space-between; gap:.5rem; width:100%; padding:.56rem .62rem; border:1px solid transparent; border-radius:9px; background:transparent; color:var(--muted); font:600 11px inherit; text-align:left; cursor:pointer; transition:all .18s var(--ease-out); }
        .rail-category:hover { color:var(--ink); background:rgba(124,92,252,.08); transform:translateX(3px); }
        .rail-category.active { border-color:rgba(124,92,252,.2); background:linear-gradient(90deg,rgba(124,92,252,.15),rgba(255,77,141,.08)); color:var(--ink); box-shadow:0 7px 18px rgba(124,92,252,.08); }
        .rail-category > span:last-child { color:var(--muted); font-size:10px; font-weight:700; }
        .rail-category-name { display:flex; align-items:center; gap:.5rem; min-width:0; }
        .rail-dot { width:7px; height:7px; flex-shrink:0; border-radius:50%; box-shadow:0 0 0 4px rgba(124,92,252,.08); }
        .rail-note { display:flex; gap:.55rem; margin-top:1.25rem; padding:.75rem; border:1px solid var(--line); border-radius:12px; background:linear-gradient(135deg,rgba(201,244,90,.18),rgba(255,77,141,.09)); }
        .rail-note-icon { display:grid; place-items:center; width:22px; height:22px; flex-shrink:0; border-radius:7px; background:var(--ink); color:var(--accent); font-size:11px; }
        .rail-note strong, .rail-note span { display:block; }
        .rail-note strong { color:var(--ink); font-size:10px; }
        .rail-note span { margin-top:3px; color:var(--muted); font-size:9px; line-height:1.35; }
        .theme-toggle { display:inline-flex; align-items:center; gap:.38rem; min-height:34px; padding:0 .6rem; border:1px solid var(--line); border-radius:999px; background:rgba(255,255,255,.65); color:var(--ink); font:700 10px inherit; cursor:pointer; transition:transform .18s var(--ease-out), background .18s var(--ease-out), border-color .18s var(--ease-out); }
        .theme-toggle:hover { transform:translateY(-1px); background:var(--accent); border-color:var(--accent); color:var(--accent-ink); }
        .theme-toggle:active { transform:scale(.97); }
        .app-shell[data-theme="dark"] .theme-toggle:hover { background:var(--accent-2); border-color:var(--accent-2); color:#FFF; }
        .main-canvas { transition:color .24s var(--ease-out); }
        @media (max-width:1020px) { .page-layout { grid-template-columns:1fr; gap:.25rem; } .browse-rail { position:static; padding:.5rem 0 .8rem; } .rail-heading { flex-direction:row; align-items:baseline; justify-content:space-between; margin-bottom:.55rem; } .rail-category-list { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.3rem; } .rail-category { background:rgba(255,255,255,.48); } .app-shell[data-theme="dark"] .rail-category { background:rgba(255,255,255,.04); } .rail-note { display:none; } }
        @media (max-width:599px) { .rail-heading { padding:0 .1rem; } .rail-category-list { display:flex; overflow-x:auto; gap:.35rem; padding:.15rem .1rem .5rem; scrollbar-width:none; } .rail-category-list::-webkit-scrollbar { display:none; } .rail-category { width:auto; min-width:max-content; padding:.5rem .65rem; border-radius:999px; } .rail-category > span:last-child { display:none; } .theme-toggle { width:34px; padding:0; justify-content:center; } .theme-toggle span { display:none; } }
        .app-shell { position:relative; overflow:hidden; background-image:radial-gradient(circle at 10% 0%, rgba(255,255,255,.85), transparent 26rem), linear-gradient(rgba(24,23,20,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(24,23,20,.025) 1px, transparent 1px); background-size:auto, 32px 32px, 32px 32px; }
        .app-shell::before { content:""; position:fixed; inset:0; pointer-events:none; opacity:.18; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E"); mix-blend-mode:multiply; z-index:0; }
        .app-shell > * { position:relative; z-index:1; }
        .topbar { background:rgba(245,243,238,.82) !important; border-bottom:1px solid var(--line) !important; }
        .brand-mark { width:30px; height:30px; display:grid; place-items:center; border-radius:9px; background:var(--ink); color:var(--accent); font-size:15px; box-shadow:0 6px 18px rgba(24,23,20,.16); }
        .brand-name { font-size:12px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
        .brand-sub { display:block; margin-top:3px; color:#9C9589; font-size:10px; letter-spacing:.02em; }
        .topnav { display:flex; align-items:center; gap:.15rem; }
        .topnav button { border:0; background:transparent; padding:.45rem .65rem; color:#817B70; font:500 12px inherit; cursor:pointer; border-radius:7px; transition:all .18s var(--ease-out); }
        .topnav button:hover { color:var(--ink); background:rgba(24,23,20,.05); }
        .hero-panel { position:relative; display:grid; grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr); gap:2rem; min-height:420px; margin:1.25rem 0 1.5rem; padding:clamp(1.5rem,4vw,3.75rem); overflow:hidden; border-radius:24px; background:linear-gradient(115deg,#1D1C19 0%,#292822 60%,#38362D 100%); color:#F6F3EA; box-shadow:0 26px 70px rgba(24,23,20,.17); }
        .hero-panel::after { content:""; position:absolute; width:520px; height:520px; top:-220px; right:-130px; border:1px solid rgba(200,241,105,.26); border-radius:50%; box-shadow:0 0 0 36px rgba(200,241,105,.035),0 0 0 76px rgba(200,241,105,.025),0 0 0 118px rgba(200,241,105,.018); }
        .hero-kicker { display:flex; align-items:center; gap:.5rem; color:var(--accent); font-size:10px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; }
        .hero-kicker::before { content:""; width:8px; height:8px; border-radius:50%; background:var(--accent); box-shadow:0 0 0 5px rgba(200,241,105,.12); }
        .hero-title { max-width:680px; margin:1rem 0 1.1rem; font-family:'DM Serif Display',Georgia,serif; font-size:clamp(2.8rem,7vw,6.5rem); font-weight:400; letter-spacing:-.055em; line-height:.9; }
        .hero-title em { color:var(--accent); font-style:normal; }
        .hero-copy { max-width:590px; color:rgba(246,243,234,.68); font-size:14px; line-height:1.65; }
        .hero-actions { display:flex; flex-wrap:wrap; gap:.6rem; margin-top:1.6rem; }
        .hero-primary { display:inline-flex; align-items:center; gap:.55rem; border:0; border-radius:8px; padding:.7rem 1rem; background:var(--accent); color:var(--accent-ink); font:700 12px inherit; cursor:pointer; transition:transform .18s var(--ease-out), box-shadow .18s var(--ease-out); box-shadow:0 8px 24px rgba(200,241,105,.12); }
        .hero-primary:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(200,241,105,.2); }
        .hero-secondary { display:inline-flex; align-items:center; gap:.5rem; border:1px solid rgba(246,243,234,.18); border-radius:8px; padding:.7rem 1rem; background:rgba(255,255,255,.05); color:#F6F3EA; font:600 12px inherit; cursor:pointer; }
        .hero-secondary:hover { background:rgba(255,255,255,.11); }
        .hero-index { align-self:end; display:grid; grid-template-columns:1fr 1fr; gap:.7rem; max-width:360px; padding:1rem; border:1px solid rgba(246,243,234,.14); border-radius:16px; background:rgba(255,255,255,.055); backdrop-filter:blur(12px); }
        .hero-stat { padding:.65rem .7rem; border-radius:10px; background:rgba(0,0,0,.12); }
        .hero-stat strong { display:block; color:#F6F3EA; font-family:'DM Serif Display',Georgia,serif; font-size:28px; font-weight:400; letter-spacing:-.04em; }
        .hero-stat span { display:block; margin-top:2px; color:rgba(246,243,234,.52); font-size:10px; letter-spacing:.06em; text-transform:uppercase; }
        .section-intro { display:flex; align-items:end; justify-content:space-between; gap:1rem; margin:0 0 .75rem; }
        .section-eyebrow { margin:0 0 .25rem; color:#9C9589; font-size:10px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; }
        .section-title { margin:0; color:var(--ink); font-family:'DM Serif Display',Georgia,serif; font-size:1.65rem; font-weight:400; letter-spacing:-.04em; }
        .featured-strip { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.65rem; margin-bottom:2rem; }
        .featured-card { min-height:132px; padding:1rem; border:1px solid var(--line); border-radius:14px; background:rgba(255,254,251,.78); transition:transform .22s var(--ease-out), box-shadow .22s var(--ease-out), border-color .22s var(--ease-out); }
        .featured-card:hover { transform:translateY(-4px); border-color:rgba(24,23,20,.24); box-shadow:0 16px 30px rgba(24,23,20,.09); }
        .featured-card .eyebrow { display:flex; align-items:center; justify-content:space-between; color:#9C9589; font-size:10px; text-transform:uppercase; letter-spacing:.08em; }
        .featured-card h3 { margin:.8rem 0 .35rem; color:var(--ink); font-size:14px; letter-spacing:-.02em; }
        .featured-card p { margin:0; color:#817B70; font-size:11px; line-height:1.45; }
        .discovery-toolbar { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin:0 0 .75rem; padding:.7rem .85rem; border:1px solid var(--line); border-radius:12px; background:rgba(255,254,251,.7); backdrop-filter:blur(10px); }
        .result-meta { display:flex; align-items:baseline; gap:.55rem; min-width:0; }
        .result-count { color:var(--ink); font-size:13px; font-weight:800; letter-spacing:-.02em; }
        .result-context { color:#9C9589; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .toolbar-actions { display:flex; align-items:center; gap:.45rem; flex-shrink:0; }
        .sort-select { min-height:32px; padding:0 .65rem; border:1px solid var(--line); border-radius:7px; background:#FFFEFB; color:#625D53; font:500 11px inherit; outline:none; }
        .view-toggle { display:flex; gap:2px; padding:2px; border:1px solid var(--line); border-radius:8px; background:#F0EEE8; }
        .view-toggle button { width:28px; height:27px; display:grid; place-items:center; border:0; border-radius:6px; background:transparent; color:#9C9589; cursor:pointer; }
        .view-toggle button.active { background:var(--ink); color:var(--accent); box-shadow:0 2px 6px rgba(24,23,20,.14); }
        .stack-row { display:flex; align-items:center; gap:.35rem; margin:0 0 1.2rem; overflow-x:auto; scrollbar-width:none; }
        .stack-row::-webkit-scrollbar { display:none; }
        .stack-label { flex-shrink:0; margin-right:.2rem; color:#9C9589; font-size:10px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
        .stack-chip { flex-shrink:0; min-height:29px; padding:0 .65rem; border:1px solid var(--line); border-radius:999px; background:rgba(255,254,251,.68); color:#817B70; font:600 11px inherit; cursor:pointer; transition:all .18s var(--ease-out); }
        .stack-chip:hover { border-color:rgba(24,23,20,.25); color:var(--ink); transform:translateY(-1px); }
        .stack-chip.active { border-color:var(--ink); background:var(--ink); color:var(--accent); }
        .results-grid { display:grid !important; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.7rem !important; }
        .results-grid .lib-card { min-height:220px; align-items:flex-start; flex-direction:column; }
        .results-grid .lib-card > a { align-self:stretch; }
        .results-grid .lib-card > div:last-child { align-self:flex-end; }
        .results-grid .lib-card .cat-pill { font-size:9px; }
        .lib-card:active, .featured-card:active { transform:scale(.995); }
        button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
        .ctrl-btn:active, .stack-chip:active, .hero-secondary:active, .drawer-stack-chip:active { transform:scale(.97); }
        .search-input { box-shadow:0 6px 18px rgba(24,23,20,.035); }
        .filter-section-label { margin:1rem 0 .5rem; color:#9C9589; font-size:10px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
        .stack-filter-grid { display:flex; flex-wrap:wrap; gap:.35rem; }
        .drawer-stack-chip { border:1px solid #E8E3DC; border-radius:999px; padding:.45rem .7rem; background:#FFF; color:#6B5F4B; font:500 12px inherit; cursor:pointer; }
        .drawer-stack-chip.active { border-color:#1C1A17; background:#1C1A17; color:#C8F169; }
        header { padding-top:env(safe-area-inset-top); }
        .filter-drawer { padding-bottom:env(safe-area-inset-bottom); }
        @media (max-width:899px) { .topnav { display:none; } .hero-panel { grid-template-columns:1fr; min-height:auto; } .hero-index { align-self:auto; max-width:none; } .featured-strip { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (max-width:599px) { .hero-panel { margin-top:.75rem; border-radius:18px; padding:1.25rem; } .hero-title { font-size:clamp(2.8rem,16vw,4.8rem); } .featured-strip { grid-template-columns:1fr 1fr; overflow-x:auto; } .featured-card { min-width:160px; } .discovery-toolbar { align-items:flex-start; flex-direction:column; gap:.65rem; } .toolbar-actions { width:100%; justify-content:space-between; } .sort-select { flex:1; } .results-grid { grid-template-columns:1fr; } }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="topbar" style={{ background:"rgba(247,245,240,0.92)", borderBottom:"1px solid #E8E3DC", padding:"0 1.25rem", position:"sticky", top:0, zIndex:50, backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)" }}>
        <div style={{ maxWidth:1180, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", flexWrap:"wrap", minHeight:52, paddingTop:"0.3rem", paddingBottom:"0.3rem" }}>

            {/* Wordmark */}
            <div className="nav-title" style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:".65rem" }}>
              <span className="brand-mark" aria-hidden="true">✦</span>
              <div>
                <h1 className="brand-name" style={{ margin:0, color:"#181714", lineHeight:1.1 }}>UI / FOLIO</h1>
                <p className="brand-sub nav-title-sub" style={{ margin:0 }}>The independent resource index</p>
              </div>
            </div>
            <nav className="topnav" aria-label="Primary navigation">
              <button type="button" onClick={jumpToResults}>Explore</button>
              <button type="button" onClick={() => setActive("inspiration")}>Inspiration</button>
              <button type="button" onClick={() => setActive("react")}>Libraries</button>
            </nav>

            <button type="button" className="theme-toggle" onClick={() => setTheme(current => current === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
              {theme === "light" ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><circle cx="12" cy="12" r="4"/></svg> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 15.2A8.5 8.5 0 0 1 8.8 3.2 8.5 8.5 0 1 0 20.8 15.2Z"/></svg>}
              <span>{theme === "light" ? "Bright" : "Dark"}</span>
            </button>

            {/* Search */}
            <div className="search-wrap" style={{ position:"relative", width:200, flexShrink:0 }}>
              <svg style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:"#B0A898", pointerEvents:"none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input ref={searchRef} className="search-input" type="text" aria-label="Search UI libraries and design resources" placeholder="Search ( / )"
                value={query} onChange={e => setQuery(e.target.value)} />
              {query && (
                <button onClick={() => setQuery("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9B8E80", padding:2, fontSize:11, lineHeight:1 }}>✕</button>
              )}
            </div>

            {/* Filter button */}
            <button data-filter-btn className="ctrl-btn" onClick={() => filterOpen ? closeDrawer() : setFilterOpen(true)}
              style={{ gap:"0.3rem", padding:"0.5rem 0.85rem", minHeight:40, fontSize:13, fontWeight:500, position:"relative",
                ...(filterOpen ? { borderColor:"#C17D3C80", color:"#C17D3C", background:"#FEF3E2" } : {}) }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filters
              {activeFilters > 0 && (
                <span style={{ position:"absolute", top:-5, right:-5, width:16, height:16, borderRadius:"50%", background:"#C17D3C", color:"#FFF", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {activeFilters}
                </span>
              )}
            </button>

            {/* Share */}
            <button className="ctrl-btn" onClick={shareFilter} title="Copy shareable link" aria-label="Copy shareable link"
              style={{ width:40, height:40, ...(copiedShare ? { borderColor:"#2E7D5250", color:"#2E7D52", background:"#F0FAF4" } : {}) }}>
              {copiedShare
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
            </button>

            {/* Suggest link */}
            <button className="suggest-link ctrl-btn" onClick={() => { setSuggOpen(true); setTimeout(() => window.scrollTo({ top:document.body.scrollHeight, behavior:"smooth" }), 80); }}
              style={{ fontSize:12, fontWeight:500, padding:"0 0.75rem", height:40, color:"#9B8E80", whiteSpace:"nowrap" }}>
              + Suggest
            </button>
          </div>
        </div>
      </header>

      {/* ── FILTER DRAWER ──────────────────────────────────────── */}
      {(filterOpen || filterClosing) && (
        <>
          <div onClick={closeDrawer} style={{ position:"fixed", inset:0, zIndex:80, background:"rgba(28,26,23,0.3)" }} />
          <div data-filter-drawer className="filter-drawer" style={{ animation:`${filterClosing ? "slideDown 0.2s ease forwards" : "slideUp 0.25s ease"}` }}>
            <div style={{ padding:"0 1.25rem 2rem" }}>
              {/* Handle */}
              <div style={{ display:"flex", justifyContent:"center", padding:"0.75rem 0 0.5rem" }}>
                <div style={{ width:36, height:3, borderRadius:999, background:"#D8D2C8" }} />
              </div>

              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                <span style={{ fontSize:15, fontWeight:600, color:"#1C1A17" }}>Browse by type</span>
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  {activeFilters > 0 && (
                    <button onClick={clearAll} className="ctrl-btn" style={{ fontSize:12, padding:"0.3rem 0.75rem", height:34, color:"#9B4A2A", borderColor:"#E8C4B0", background:"#FDF0EA" }}>
                      Clear all
                    </button>
                  )}
                  <button onClick={closeDrawer} className="ctrl-btn" aria-label="Close filters" style={{ fontSize:12, fontWeight:600, padding:"0.3rem 0.75rem", height:34, background:"#1C1A17", color:"#F7F5F0", border:"none" }}
                    onMouseEnter={e=>{e.currentTarget.style.background="#3A3632"}}
                    onMouseLeave={e=>{e.currentTarget.style.background="#1C1A17"}}>
                    Done
                  </button>
                </div>
              </div>

              {/* Category list */}
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                {CATEGORIES.map(cat => {
                  const on = active === cat.id;
                  const catCount = cat.id === "all" ? LIBS.length : counts[cat.id] || 0;
                  return (
                    <button key={cat.id} className={`cat-btn${on ? " active" : ""}`} onClick={() => setActive(cat.id)}>
                      <span>{cat.label}</span>
                      <span style={{ fontSize:11.5, padding:"0.1rem 0.5rem", borderRadius:999, background: on ? "rgba(193,125,60,0.12)" : "#F0EDE7", color: on ? "#C17D3C" : "#9B8E80", fontWeight:500 }}>
                        {catCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="filter-section-label">Built with</div>
              <div className="stack-filter-grid">
                {STACK_FILTERS.map(stack => <button type="button" key={stack} className={`drawer-stack-chip${stackFilter === stack ? " active" : ""}`} aria-pressed={stackFilter === stack} onClick={() => setStackFilter(stack)}>{stack === "all" ? "Everything" : stack}</button>)}
              </div>

              <button onClick={closeDrawer} style={{ width:"100%", marginTop:"1rem", padding:"0.75rem", borderRadius:8, border:"none", background:"#1C1A17", color:"#F7F5F0", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#3A3632"}}
                onMouseLeave={e=>{e.currentTarget.style.background="#1C1A17"}}>
                Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <main className="main-canvas" style={{ maxWidth:1280, margin:"0 auto", padding:"clamp(0.75rem,2vw,1.25rem) clamp(0.85rem,3vw,1.25rem) clamp(4rem,8vw,6rem)", position:"relative" }}>
        <div className="page-layout">
          <aside className="browse-rail" aria-label="Browse resource categories">
            <div className="rail-heading"><span className="rail-kicker">Explore the index</span><strong>Browse by vibe</strong></div>
            <div className="rail-category-list">
              {CATEGORIES.map(cat => <button type="button" key={cat.id} className={`rail-category${active === cat.id ? " active" : ""}`} onClick={() => { setActive(cat.id); jumpToResults(); }}>
                <span className="rail-category-name"><span className="rail-dot" style={{ background:cat.id === "all" ? "#FF4D8D" : CAT_COLOR[cat.id] || "#7C5CFC" }} />{cat.label}</span>
                <span>{cat.id === "all" ? LIBS.length : counts[cat.id] || 0}</span>
              </button>)}
            </div>
            <div className="rail-note"><span className="rail-note-icon">✦</span><div><strong>Fresh every week</strong><span>Independent finds for better interfaces.</span></div></div>
          </aside>
          <div className="content-stream">

        <section className="hero-panel" aria-labelledby="hero-title">
          <div>
            <div className="hero-kicker">Curated interface intelligence · Issue 08</div>
            <h2 id="hero-title" className="hero-title">Find the <em>good stuff.</em></h2>
            <p className="hero-copy">A refined index of the UI libraries, design systems, inspiration galleries, and frontend tools that make digital work feel considered.</p>
            <div className="hero-actions">
              <button type="button" className="hero-primary" onClick={jumpToResults}>Start exploring <span aria-hidden="true">↗</span></button>
              <button type="button" className="hero-secondary" onClick={() => setFilterOpen(true)}>Open filters <span aria-hidden="true">⌘ K</span></button>
            </div>
          </div>
          <div className="hero-index" aria-label="Directory statistics">
            <div className="hero-stat"><strong>{LIBS.length}</strong><span>Resources</span></div>
            <div className="hero-stat"><strong>{CATEGORIES.length - 1}</strong><span>Curated lanes</span></div>
            <div className="hero-stat"><strong>{NEW_IDS.size}</strong><span>New this issue</span></div>
            <div className="hero-stat"><strong>100%</strong><span>Independent</span></div>
          </div>
        </section>

        <div className="section-intro">
          <div><p className="section-eyebrow">Freshly indexed</p><h2 className="section-title">Worth a closer look</h2></div>
          <span style={{ fontSize:11, color:"#9C9589" }}>New resources · {VERIFIED_DATE}</span>
        </div>
        <section className="featured-strip" aria-label="Featured new resources">
          {featured.map(lib => <a key={lib.id} className="featured-card" href={`https://${lib.url}`} target="_blank" rel="noopener noreferrer" onClick={() => handleVisit(lib)}>
            <div className="eyebrow"><span>{CATEGORIES.find(c => c.id === CAT_RESOLVE(lib.cat))?.label || lib.cat}</span><span aria-hidden="true">↗</span></div>
            <h3>{lib.name}</h3><p>{lib.desc}</p>
          </a>)}
        </section>

        {/* Active filter chips */}
        {activeFilters > 0 && (
          <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom:"0.75rem", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#9B8E80" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            {query && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem", fontSize:11.5, padding:"0.18rem 0.55rem", borderRadius:999, background:"#FEF3E2", color:"#C17D3C", border:"1px solid #F0D5A8" }}>
                "{query}"
                <button onClick={() => setQuery("")} style={{ background:"none", border:"none", cursor:"pointer", color:"#C17D3C", padding:0, fontSize:10 }}>✕</button>
              </span>
            )}
            {active !== "all" && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem", fontSize:11.5, padding:"0.18rem 0.55rem", borderRadius:999, background:"#FEF3E2", color:"#C17D3C", border:"1px solid #F0D5A8" }}>
                {CATEGORIES.find(c => c.id === active)?.label}
                <button onClick={() => setActive("all")} style={{ background:"none", border:"none", cursor:"pointer", color:"#C17D3C", padding:0, fontSize:10 }}>✕</button>
              </span>
            )}
            {stackFilter !== "all" && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem", fontSize:11.5, padding:"0.18rem 0.55rem", borderRadius:999, background:"#EEF7D6", color:"#40551B", border:"1px solid #D6E7A8" }}>
                {stackFilter}
                <button onClick={() => setStackFilter("all")} style={{ background:"none", border:"none", cursor:"pointer", color:"#40551B", padding:0, fontSize:10 }}>✕</button>
              </span>
            )}
            {sortBy !== "featured" && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem", fontSize:11.5, padding:"0.18rem 0.55rem", borderRadius:999, background:"#F1EEE8", color:"#625D53", border:"1px solid #DDD8CF" }}>
                {SORT_OPTIONS.find(option => option.id === sortBy)?.label}
                <button onClick={() => setSortBy("featured")} style={{ background:"none", border:"none", cursor:"pointer", color:"#625D53", padding:0, fontSize:10 }}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* Recently viewed */}
        {recent.length > 0 && !query && active === "all" && (
          <div style={{ marginBottom:"1rem", padding:"0.65rem 0.9rem", background:"#FFFFFF", border:"1px solid #E8E3DC", borderRadius:10, animation:"fadeIn 0.2s ease" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.4rem" }}>
              <span style={{ fontSize:10, fontWeight:600, color:"#9B8E80", letterSpacing:"0.08em", textTransform:"uppercase" }}>Recently visited</span>
              <button onClick={() => { localStorage.removeItem("uidir-recent"); setRecent([]); }} style={{ fontSize:10, color:"#B0A898", background:"none", border:"none", cursor:"pointer" }}>Clear</button>
            </div>
            <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
              {recent.map(r => (
                <a key={r.id} href={`https://${r.url}`} target="_blank" rel="noopener noreferrer" onClick={() => handleVisit(r)} className="recent-chip">
                  {r.name}
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="discovery-toolbar" id="results">
          <div className="result-meta">
            <span className="result-count" aria-live="polite">{filtered.length} resources</span>
            <span className="result-context">{active === "all" ? "Everything worth bookmarking" : CATEGORIES.find(c => c.id === active)?.label}{stackFilter !== "all" ? ` · ${stackFilter}` : ""}</span>
          </div>
          <div className="toolbar-actions">
            <select className="sort-select" aria-label="Sort resources" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <div className="view-toggle" aria-label="Choose result view">
              <button type="button" className={viewMode === "list" ? "active" : ""} aria-label="List view" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              </button>
              <button type="button" className={viewMode === "grid" ? "active" : ""} aria-label="Grid view" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="stack-row" aria-label="Filter by stack">
          <span className="stack-label">Built with</span>
          {STACK_FILTERS.map(stack => <button type="button" key={stack} className={`stack-chip${stackFilter === stack ? " active" : ""}`} aria-pressed={stackFilter === stack} onClick={() => setStackFilter(stack)}>{stack === "all" ? "Everything" : stack}</button>)}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <EmptyState onClear={clearAll} />
        ) : (
          <div ref={listRef} key={`${active}-${stackFilter}-${sortBy}-${viewMode}`} className={`results-list${viewMode === "grid" ? " results-grid" : ""}`} style={{ display:"flex", flexDirection:"column", gap:"0.4rem", animation:"fadeIn 0.2s ease" }}>
            {filtered.map(lib => {
              const catColor = CAT_COLOR[lib.cat] || CAT_COLOR["dev-tools"];
              const isCopy   = copiedId === lib.id;
              const isNew    = NEW_IDS.has(lib.id);
              const stacks   = LIB_STACKS[lib.id] || [];
              const catLabel = CATEGORIES.find(c => c.id === CAT_RESOLVE(lib.cat))?.label || lib.cat;

              return (
                <div key={lib.id} className="lib-card">
                  {/* Left dot — category color */}
                  <div style={{ width:6, height:6, borderRadius:"50%", background:catColor, flexShrink:0, marginTop:1, opacity:0.7 }} />

                  {/* Main link */}
                  <a href={`https://${lib.url}`} target="_blank" rel="noopener noreferrer"
                    onClick={() => handleVisit(lib)}
                    style={{ flex:1, minWidth:0, textDecoration:"none", outline:"none", display:"block" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.35rem", flexWrap:"wrap", marginBottom:"0.2rem" }}>
                      <span style={{ fontSize:"0.95rem", fontWeight:600, color:"#1C1A17", letterSpacing:"-0.01em" }}>
                        <Highlight text={lib.name} query={query} />
                      </span>
                      <span className="cat-pill" style={{ color:catColor }}>{catLabel}</span>
                      {isNew && <span className="new-badge">New</span>}
                      {stacks.map(s => <span key={s} className="stack-tag">{s}</span>)}
                    </div>
                    <div style={{ fontSize:13.5, color:"#6B5F4B", lineHeight:1.6 }}>
                      <Highlight text={lib.desc} query={query} />
                    </div>
                    <div style={{ marginTop:"0.2rem", fontSize:11, color:"#B0A898", fontFamily:"'DM Mono', 'Fira Code', monospace" }}>
                      {lib.url}
                    </div>
                  </a>

                  {/* Copy + arrow */}
                  <div style={{ display:"flex", alignItems:"center", gap:"0.35rem", flexShrink:0 }}>
                    <button className={`copy-btn${isCopy ? " copied" : ""}`} onClick={e => copyUrl(lib.url, lib.id, e)} aria-label={isCopy ? "Copied!" : "Copy URL"}>
                      {isCopy
                        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                    </button>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C8BFB4" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Suggest section ─────────────────────────────────── */}
        <div className="suggest-panel">
          <button onClick={() => setSuggOpen(o => !o)}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem", padding:"0.85rem 1rem", background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <span style={{ fontSize:13 }}>💡</span>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#1C1A17" }}>Know a resource that belongs here?</div>
                <div style={{ fontSize:11.5, color:"#9B8E80", marginTop:1 }}>Drop a link — I review and add the best ones.</div>
              </div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9B8E80" strokeWidth="2.5"
              style={{ flexShrink:0, transform:suggOpen?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.22s ease" }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          <div style={{ maxHeight:suggOpen ? 600 : 0, overflow:"hidden", transition:"max-height 0.32s ease" }}>
            <div style={{ padding:"0 1rem 1rem", borderTop:"1px solid #E8E3DC" }}>
              {sent ? (
                <div style={{ textAlign:"center", padding:"1.5rem 0", color:"#2E7D52" }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>✓</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>Opening your email app…</div>
                  <div style={{ fontSize:11, marginTop:3, color:"#9B8E80" }}>Appreciated!</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem", paddingTop:"0.75rem" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"0.5rem" }}>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#6B5F4B", marginBottom:"0.2rem" }}>Your name <span style={{ opacity:0.5, fontWeight:400 }}>(optional)</span></label>
                      <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Alex" style={iStyle}
                        onFocus={e=>e.target.style.borderColor="#C17D3C"} onBlur={e=>e.target.style.borderColor="#D8D2C8"} />
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#6B5F4B", marginBottom:"0.2rem" }}>Site name <span style={{ color:"#B85C2C" }}>*</span></label>
                      <input value={siteName} onChange={e=>setSiteName(e.target.value)} placeholder="e.g. ShadcnBlocks" style={iStyle}
                        onFocus={e=>e.target.style.borderColor="#C17D3C"} onBlur={e=>e.target.style.borderColor="#D8D2C8"} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#6B5F4B", marginBottom:"0.2rem" }}>URL <span style={{ color:"#B85C2C" }}>*</span></label>
                    <input value={siteUrl} onChange={e=>setSiteUrl(e.target.value)} placeholder="e.g. shadcnblocks.com" style={iStyle}
                      onFocus={e=>e.target.style.borderColor="#C17D3C"} onBlur={e=>e.target.style.borderColor="#D8D2C8"} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#6B5F4B", marginBottom:"0.2rem" }}>Why should it be listed? <span style={{ opacity:0.5, fontWeight:400 }}>(optional)</span></label>
                    <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="What makes it useful or unique…" rows={3}
                      style={{ ...iStyle, resize:"vertical", minHeight:64, lineHeight:1.55 }}
                      onFocus={e=>e.target.style.borderColor="#C17D3C"} onBlur={e=>e.target.style.borderColor="#D8D2C8"} />
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.4rem" }}>
                    <p style={{ margin:0, fontSize:11, color:"#B0A898" }}>Opens your email client with details pre-filled.</p>
                    <button onClick={handleSuggest} disabled={!siteName.trim()||!siteUrl.trim()}
                      style={{ display:"flex", alignItems:"center", gap:"0.3rem", padding:"0.45rem 1rem", borderRadius:7, border:"none",
                        background:(!siteName.trim()||!siteUrl.trim())?"#E8E3DC":"#1C1A17",
                        color:(!siteName.trim()||!siteUrl.trim())?"#9B8E80":"#F7F5F0",
                        fontSize:12.5, fontWeight:600, cursor:(!siteName.trim()||!siteUrl.trim())?"not-allowed":"pointer",
                        fontFamily:"inherit", transition:"background 0.15s" }}>
                      Send suggestion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop:"1rem", paddingTop:"0.85rem", borderTop:"1px solid #E8E3DC", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.4rem" }}>
          <p style={{ margin:0, fontSize:11, color:"#B0A898" }}>Hand-picked · All links verified {VERIFIED_DATE}</p>
          <span style={{ fontSize:11, color:"#B0A898" }}>{filtered.length} / {LIBS.length}</span>
        </div>
          </div>
        </div>
      </main>

      {/* Back to top */}
      {showTop && (
        <div style={{ position:"fixed", bottom:"1.25rem", right:"1.25rem", zIndex:100 }}>
          <button className="float-btn" onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} title="Back to top" aria-label="Back to top">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
