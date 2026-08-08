import { useState, useMemo, useEffect, useRef } from "react";

// ── Theme ──────────────────────────────────────────────────────────
function getSavedTheme() {
  try { return localStorage.getItem("uidir-theme") !== "light"; } catch { return true; }
}
function saveTheme(dark) {
  try { localStorage.setItem("uidir-theme", dark ? "dark" : "light"); } catch {}
}

// ── Recent ─────────────────────────────────────────────────────────
function getRecent() {
  try { return JSON.parse(localStorage.getItem("uidir-recent") || "[]"); } catch { return []; }
}
function addRecent(lib) {
  try {
    const prev = getRecent().filter(r => r.id !== lib.id);
    localStorage.setItem("uidir-recent", JSON.stringify([lib, ...prev].slice(0, 5)));
  } catch {}
}

// ── URL ────────────────────────────────────────────────────────────
function getUrlParams() {
  if (typeof window === "undefined") return { cat: "all", q: "", fw: "all" };
  const p = new URLSearchParams(window.location.search);
  return { cat: p.get("cat") || "all", q: p.get("q") || "", fw: p.get("fw") || "all" };
}
function setUrlParams(cat, q, fw) {
  const p = new URLSearchParams();
  if (cat !== "all") p.set("cat", cat);
  if (q) p.set("q", q);
  if (fw !== "all") p.set("fw", fw);
  const str = p.toString();
  window.history.replaceState(null, "", str ? `?${str}` : window.location.pathname);
}

// ── Highlight ──────────────────────────────────────────────────────
function Highlight({ text, query, color }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: color, color: "inherit", borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Data ───────────────────────────────────────────────────────────
const FRAMEWORKS = [
  { id: "all", label: "All" },
  { id: "React", label: "React" },
  { id: "Vue", label: "Vue" },
  { id: "Svelte", label: "Svelte" },
  { id: "Angular", label: "Angular" },
  { id: "Tailwind", label: "Tailwind" },
  { id: "CSS", label: "CSS / HTML" },
  { id: "Design", label: "Design" },
];

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "animated", label: "Animated & Motion" },
  { id: "shadcn", label: "shadcn Ecosystem" },
  { id: "tailwind", label: "Tailwind CSS" },
  { id: "css", label: "CSS / HTML / SVG" },
  { id: "react", label: "Full React" },
  { id: "angular", label: "Angular" },
  { id: "headless", label: "Headless" },
  { id: "multi", label: "Vue / Svelte" },
  { id: "collections", label: "Collections" },
  { id: "design-tools", label: "Design Tools" },
  { id: "dev-tools", label: "Dev Tools" },
];

const LIB_STACKS = {
  1:["React","Tailwind"],2:["React","Tailwind"],3:["React"],4:["React","Tailwind"],
  5:["React","shadcn"],6:["React"],7:["React"],8:["React","Tailwind"],9:["React"],
  10:["React","shadcn"],11:["React"],12:["React","Tailwind"],13:["React","Tailwind"],15:["React"],
  16:["React","shadcn"],17:["React","shadcn"],18:["React","shadcn"],19:["React","shadcn"],
  20:["React","shadcn"],21:["React","shadcn"],22:["React","shadcn"],23:["React","shadcn"],
  24:["React","shadcn"],25:["React","shadcn"],26:["React","shadcn"],27:["React","shadcn"],
  28:["React","shadcn"],79:["React","shadcn"],
  29:["Tailwind","CSS"],30:["Tailwind","React","Vue"],31:["Tailwind","CSS"],
  32:["Tailwind","CSS"],33:["Tailwind","CSS"],77:["Tailwind","CSS"],
  78:["React","Tailwind"],34:["Tailwind","CSS"],35:["Tailwind","CSS"],
  36:["Tailwind","CSS"],37:["Tailwind","CSS"],38:["Tailwind","CSS"],39:["Tailwind","CSS"],
  40:["CSS"],41:["React","shadcn"],42:["CSS"],43:["React","Tailwind"],
  44:["React","shadcn"],45:["CSS"],46:["CSS"],47:["CSS"],48:["CSS"],
  49:["React"],50:["React"],51:["React"],52:["React"],53:["React"],54:["React"],
  75:["React","Tailwind"],80:["React"],81:["React"],82:["React"],
  83:["React"],85:["React"],55:["React"],56:["React"],57:["React"],
  95:["Angular"],96:["Angular"],97:["Angular"],
  58:["React"],59:["React","Vue"],60:["React"],61:["React"],84:["React","Vue"],
  14:["Vue"],62:["Svelte"],63:["Svelte"],76:["React","Vue","Svelte","CSS"],
  64:["Vue"],65:["Vue"],93:["Vue"],
  66:["React","Tailwind"],67:["React","Tailwind"],68:["React"],
  70:["CSS","Tailwind"],71:["CSS"],87:["Design"],91:["Design"],94:["CSS"],
  86:["Design","CSS"],90:["Design"],
  72:["React","CSS"],73:["React","Vue","Svelte"],88:["React","Vue"],89:["Design"],
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
  { id:89,  name:"Squoosh",              url:"squoosh.app",                         cat:"dev-tools",     desc:"Open-source browser-based image compression — no upload, fully private", added:"2018-01" },

  // ── NEW: Research-added ──
  { id:98,  name:"Pines UI",             url:"devdojo.com/pines",                   cat:"tailwind",      desc:"Copy-paste Alpine.js + Tailwind UI library — animations, sliders, modals, tooltips, accordions, zero dependencies", added:"2026-02" },
  { id:99,  name:"Tamagui",              url:"tamagui.dev",                         cat:"react",         desc:"Cross-platform React + React Native style library and UI kit with an optimizing compiler — write once, run on web and native", added:"2026-02" },
  { id:100, name:"NativeWind",           url:"nativewind.dev",                      cat:"multi",         desc:"Tailwind CSS as a universal style system for React Native — same utility classes on iOS, Android, and web", added:"2026-02" },
  { id:101, name:"fffuel",               url:"fffuel.co",                           cat:"design-tools",  desc:"Collection of free SVG generators for gradients, patterns, textures, blob shapes, and cool backgrounds — all copy-paste", added:"2026-02" },
  { id:102, name:"WebGradients",         url:"webgradients.com",                    cat:"design-tools",  desc:"180 free linear gradients as CSS code, Sketch swatches, and PNG — copy-paste or download instantly", added:"2026-02" },
  { id:103, name:"CSS Gradient",         url:"cssgradient.io",                      cat:"design-tools",  desc:"Free CSS gradient generator with live preview — create linear, radial, and conic gradients visually", added:"2026-02" },
  { id:104, name:"Pinemix",              url:"pinemix.dev",                         cat:"tailwind",      desc:"Free open-source Alpine.js components styled with Tailwind CSS — accessible, interactive, copy-paste ready", added:"2026-02" },
  { id:105, name:"FrontendBaba",         url:"frontendbaba.dev",                    cat:"dev-tools",     desc:"Free browser-based frontend tools — CSS gradient, clip-path, blob, glassmorphism, shadow generators and image utilities", added:"2026-02" },
];

const NEW_IDS       = new Set(LIBS.filter(l => l.added?.startsWith("2026")).map(l => l.id));
const VERIFIED_DATE = "August 2026";
const RECIPIENT     = "your@email.com";

const CAT_META = {
  animated:      { label:"Animated",     dBg:"rgba(239,120,60,0.15)",  dTx:"#fdb07a", dDot:"#ef7840", lBg:"rgba(194,65,12,0.09)",  lTx:"#9a3412", lDot:"#ea580c" },
  shadcn:        { label:"shadcn",       dBg:"rgba(34,197,94,0.12)",   dTx:"#86efac", dDot:"#22c55e", lBg:"rgba(22,163,74,0.09)",  lTx:"#14532d", lDot:"#16a34a" },
  tailwind:      { label:"Tailwind",     dBg:"rgba(14,165,233,0.13)",  dTx:"#7dd3fc", dDot:"#0ea5e9", lBg:"rgba(2,132,199,0.09)",  lTx:"#075985", lDot:"#0284c7" },
  css:           { label:"CSS / SVG",    dBg:"rgba(251,146,60,0.13)",  dTx:"#fdba74", dDot:"#f97316", lBg:"rgba(194,65,12,0.09)",  lTx:"#9a3412", lDot:"#ea580c" },
  react:         { label:"React",        dBg:"rgba(96,165,250,0.13)",  dTx:"#93c5fd", dDot:"#60a5fa", lBg:"rgba(37,99,235,0.09)",  lTx:"#1e3a8a", lDot:"#2563eb" },
  angular:       { label:"Angular",      dBg:"rgba(220,53,69,0.14)",   dTx:"#fca5a5", dDot:"#ef4444", lBg:"rgba(185,28,28,0.09)",  lTx:"#991b1b", lDot:"#dc2626" },
  headless:      { label:"Headless",     dBg:"rgba(248,113,113,0.13)", dTx:"#fca5a5", dDot:"#f87171", lBg:"rgba(159,18,57,0.09)",  lTx:"#881337", lDot:"#e11d48" },
  multi:         { label:"Vue/Svelte",   dBg:"rgba(52,211,153,0.12)",  dTx:"#6ee7b7", dDot:"#34d399", lBg:"rgba(4,120,87,0.09)",   lTx:"#065f46", lDot:"#059669" },
  collections:   { label:"Collection",   dBg:"rgba(245,158,11,0.14)",  dTx:"#fcd34d", dDot:"#f59e0b", lBg:"rgba(180,83,9,0.09)",   lTx:"#92400e", lDot:"#d97706" },
  "design-tools":{ label:"Design",       dBg:"rgba(245,100,60,0.14)",  dTx:"#fdb09a", dDot:"#f56040", lBg:"rgba(180,50,20,0.09)",  lTx:"#7c1d06", lDot:"#dc4020" },
  "dev-tools":   { label:"Dev Tool",     dBg:"rgba(20,184,166,0.13)",  dTx:"#5eead4", dDot:"#14b8a6", lBg:"rgba(13,148,136,0.09)", lTx:"#134e4a", lDot:"#0d9488" },
};

function EmptyState({ query, fw, onClear, t }) {
  return (
    <div style={{ textAlign:"center", padding:"4rem 1rem 3rem" }}>
      <svg width="56" height="56" viewBox="0 0 64 64" fill="none" style={{ margin:"0 auto 1rem", display:"block", opacity:0.3 }}>
        <circle cx="28" cy="28" r="18" stroke={t.desc} strokeWidth="2.5"/>
        <path d="M41 41L54 54" stroke={t.desc} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M22 28h12M28 22v12" stroke={t.desc} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </svg>
      <div style={{ fontSize:15, fontWeight:600, color:t.title, marginBottom:"0.3rem" }}>No results found</div>
      <div style={{ fontSize:13, color:t.desc, marginBottom:"1.25rem" }}>Try adjusting your filters or search term</div>
      <button onClick={onClear} style={{ fontSize:13, fontWeight:500, color:t.acc, background:"none", border:`1px solid ${t.acc}40`, borderRadius:8, padding:"0.4rem 1rem", cursor:"pointer" }}>
        Clear all filters
      </button>
    </div>
  );
}

export default function App() {
  const init = getUrlParams();
  const [active,      setActive]      = useState(init.cat);
  const [query,       setQuery]       = useState(init.q);
  const [debouncedQ,  setDebouncedQ]  = useState(init.q);
  const [fw,          setFw]          = useState(init.fw);
  const [dark,        setDark]        = useState(getSavedTheme);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [filterClosing, setFilterClosing] = useState(false);
  const [suggOpen,    setSuggOpen]    = useState(false);
  const [copiedId,    setCopiedId]    = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [randomId,    setRandomId]    = useState(null);
  const [showTop,     setShowTop]     = useState(false);
  const [floatVis,    setFloatVis]    = useState(false);
  const [recent,      setRecent]      = useState(getRecent);
  const searchRef = useRef(null);
  const listRef   = useRef(null);
  const D = dark;

  useEffect(() => { saveTheme(dark); }, [dark]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 150);
    return () => clearTimeout(t);
  }, [query]);
  useEffect(() => { setUrlParams(active, query, fw); }, [active, query, fw]);
  useEffect(() => {
    const parts = [];
    if (active !== "all") parts.push(CATEGORIES.find(c => c.id === active)?.label || active);
    if (fw !== "all") parts.push(fw);
    if (query) parts.push(`"${query}"`);
    document.title = parts.length > 0 ? `${parts.join(" · ")} — UI Libraries` : "UI Libraries — Free & Open Source";
  }, [active, fw, query]);
  useEffect(() => {
    const fn = () => { const y = window.scrollY; setShowTop(y > 500); setFloatVis(y > 400); };
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    const fn = (e) => {
      const inInput = ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !inInput) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") {
        setQuery(""); closeDrawer(); searchRef.current?.blur();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (inInput) return;
        e.preventDefault();
        const cards = listRef.current?.querySelectorAll("a[data-card]");
        if (!cards?.length) return;
        const cur = Array.from(cards).indexOf(document.activeElement);
        const next = e.key === "ArrowDown" ? Math.min(cur+1, cards.length-1) : Math.max(cur-1, 0);
        cards[next]?.focus();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // close filter drawer on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const fn = (e) => {
      if (!e.target.closest("[data-filter-drawer]") && !e.target.closest("[data-filter-btn]")) {
        closeDrawer();
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [filterOpen]);

  const filtered = useMemo(() => {
    const q = debouncedQ.toLowerCase();
    return LIBS.filter(l => {
      const matchCat = active === "all" || l.cat === active;
      const matchQ   = !q || l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q);
      const stacks   = LIB_STACKS[l.id] || [];
      const matchFw  = fw === "all" || stacks.includes(fw);
      return matchCat && matchQ && matchFw;
    });
  }, [active, debouncedQ, fw]);

  const counts = useMemo(() => {
    const c = { all: LIBS.length };
    LIBS.forEach(l => { c[l.cat] = (c[l.cat] || 0) + 1; });
    return c;
  }, []);

  const activeFilters = (active !== "all" ? 1 : 0) + (fw !== "all" ? 1 : 0) + (query ? 1 : 0);

  function closeDrawer() {
    setFilterClosing(true);
    setTimeout(() => { setFilterOpen(false); setFilterClosing(false); }, 220);
  }
  function clearAll() { setQuery(""); setFw("all"); setActive("all"); closeDrawer(); }

  function applyFilters() { closeDrawer(); }

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

  const [name, setName]         = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl]   = useState("");
  const [reason, setReason]     = useState("");
  const [sent, setSent]         = useState(false);

  // ── Theme tokens ───────────────────────────────────────────────
  // DARK: Crimson palette | LIGHT: Sand palette
  // Dark uses same warmth/saturation family as light, just inverted brightness
  const t = {
    // Base
    bg:         D ? "#180f0f"                         : "#fdf6ed",
    hBg:        D ? "rgba(24,15,15,0.95)"             : "rgba(253,246,237,0.97)",
    hBorder:    D ? "rgba(255,200,180,0.08)"          : "#e8ddd0",
    // Cards
    card:       D ? "#211414"                         : "#ffffff",
    cardBorder: D ? "rgba(255,200,180,0.08)"          : "#ede0d0",
    cardHover:  D ? "#2a1818"                         : "#fff8f0",
    cardHBorder:D ? "rgba(224,80,80,0.4)"             : "#c87820",
    cardShadow: D ? "0 1px 4px rgba(0,0,0,0.4)"      : "0 1px 4px rgba(120,80,0,0.07)",
    cardHShadow:D ? "0 6px 24px rgba(0,0,0,0.5)"     : "0 6px 20px rgba(120,80,0,0.12)",
    hlBg:       D ? "rgba(224,80,80,0.1)"             : "rgba(200,120,32,0.08)",
    hlBorder:   D ? "rgba(224,80,80,0.55)"            : "rgba(200,120,32,0.5)",
    // Text hierarchy — WCAG AA on both
    title:      D ? "#f5e8e8"                         : "#2a1f0f",   // AAA contrast
    desc:       D ? "#c49090"                         : "#5c4a30",   // AA contrast
    url:        D ? "#7a4f50"                         : "#a08060",
    eyebrow:    D ? "#6a3838"                         : "#8a6040",
    // Controls
    ctrl:       D ? "rgba(255,255,255,0.05)"          : "rgba(0,0,0,0.04)",
    ctrlBorder: D ? "rgba(255,200,180,0.12)"          : "#e0cdb8",
    ctrlText:   D ? "#c49090"                         : "#7a5a30",
    // Search
    sBg:        D ? "rgba(255,255,255,0.06)"          : "#ffffff",
    sBorder:    D ? "rgba(255,200,180,0.15)"          : "#e0cdb8",
    sColor:     D ? "#f5e8e8"                         : "#2a1f0f",
    sPh:        D ? "#7a4f50"                         : "#b09070",
    // Tabs (inside filter drawer)
    tabBg:      D ? "rgba(255,255,255,0.04)"          : "rgba(0,0,0,0.03)",
    tabABg:     D ? "rgba(224,80,80,0.15)"            : "rgba(200,120,32,0.12)",
    tabC:       D ? "#a87070"                         : "#7a5a30",
    tabAC:      D ? "#f5c0c0"                         : "#6a3800",
    tabABorder: D ? "rgba(224,80,80,0.4)"             : "rgba(200,120,32,0.45)",
    // Accent
    acc:        D ? "#e05050"                         : "#c87820",
    accHover:   D ? "#f06060"                         : "#b06810",
    // Drawer
    drawerBg:   D ? "#1e1010"                         : "#fefaf4",
    drawerBorder:D? "rgba(255,200,180,0.1)"           : "#e8ddd0",
    // Misc
    div:        D ? "rgba(255,200,180,0.08)"          : "#ede0d0",
    arrow:      D ? "#4a2828"                         : "#c0a070",
    foot:       D ? "#6a3838"                         : "#a08060",
    h1:         D ? "linear-gradient(135deg,#f5e8e8 0%,#e05050 100%)" : undefined,
    h1C:        D ? undefined                         : "#2a1f0f",
    glow:       D ? "radial-gradient(ellipse 70% 35% at 50% -5%,rgba(200,40,40,0.18) 0%,transparent 70%)" : "none",
    float:      D ? "#c03030"                         : "#c87820",
    stBg:       D ? "rgba(255,255,255,0.07)"          : "rgba(0,0,0,0.04)",
    stTx:       D ? "#8a5858"                         : "#8a6840",
    nBg:        D ? "rgba(200,120,32,0.14)"           : "rgba(200,120,32,0.1)",
    nTx:        D ? "#f5c060"                         : "#7a4010",
    hlMark:     D ? "rgba(224,80,80,0.25)"            : "rgba(200,120,32,0.2)",
    recentBg:   D ? "rgba(255,255,255,0.02)"          : "rgba(0,0,0,0.02)",
    recentB:    D ? "rgba(255,200,180,0.08)"          : "#e8ddd0",
    filterBadge:D ? "#e05050"                         : "#c87820",
    // form inputs
    iBg:        D ? "rgba(255,255,255,0.05)"          : "#fdf0e0",
    iBorder:    D ? "rgba(255,200,180,0.15)"          : "#e0cdb8",
    iColor:     D ? "#f5e8e8"                         : "#2a1f0f",
    label:      D ? "#c49090"                         : "#5c4a30",
    submit:     D ? "#c03030"                         : "#c87820",
    suggBg:     D ? "#211414"                         : "#ffffff",
    suggB:      D ? "rgba(255,200,180,0.08)"          : "#e8ddd0",
    suggHBg:    D ? "rgba(224,80,80,0.07)"            : "rgba(200,120,32,0.05)",
    suggHB:     D ? "rgba(224,80,80,0.18)"            : "rgba(200,120,32,0.2)",
    fade:       D ? "linear-gradient(to right,transparent,rgba(24,15,15,0.95))" : "linear-gradient(to right,transparent,rgba(253,246,237,0.97))",
  };

  const iStyle = { width:"100%", padding:"0.6rem 0.75rem", background:t.iBg, border:`1px solid ${t.iBorder}`, borderRadius:8, color:t.iColor, fontSize:"max(16px,13px)", outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.15s", minHeight:44 };

  return (
    <div style={{ minHeight:"100vh", background:t.bg, color:t.title, fontFamily:"'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", transition:"background 0.2s,color 0.2s" }}>
      <style>{`
        /* ── Keyframes ── */
        @keyframes fadeIn    { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeOut   { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-4px)} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(100%)} }
        @keyframes blob1     { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.15)} 66%{transform:translate(-40px,30px) scale(0.92)} }
        @keyframes blob2     { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,50px) scale(1.1)} 66%{transform:translate(50px,-30px) scale(0.95)} }
        @keyframes blob3     { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,60px) scale(0.9)} 66%{transform:translate(-50px,-40px) scale(1.12)} }

        /* ── Base reset ── */
        *, *::before, *::after { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar { display:none }
        html { -webkit-text-size-adjust:100%; text-size-adjust:100%; }
        body { margin:0; min-width:360px; }

        /* ── Cards ── */
        .card { transition:transform 0.18s ease,box-shadow 0.18s ease,background 0.12s,border-color 0.12s; }
        .card:not([data-pinned]):active { transform:scale(0.982) !important; transition:transform 0.08s ease !important; }
        .card[data-pinned] { transform:none !important; }
        .card:focus-within { outline:2px solid ${t.acc}; outline-offset:2px; }
        .card a:focus { outline:none; }

        /* ── Hover effects — desktop only ── */
        @media (hover:hover) {
          .card:not([data-pinned]):hover { transform:translateY(-2px); }
        }

        /* ── Tooltip — desktop only ── */
        mark { background:transparent; }
        .copy-wrap .copy-tip { opacity:0; transition:opacity 0.15s; pointer-events:none; }
        @media (hover:hover) { .copy-wrap:hover .copy-tip { opacity:1; } }

        /* ── Recent block ── */
        .recent-block { animation:fadeIn 0.2s ease; }

        /* ── Min touch targets ── */
        button, a, [role="button"] { min-height:44px; display:inline-flex; align-items:center; justify-content:center; }
        .card a { min-height:unset; display:block; }
        .copy-wrap button { min-height:44px; min-width:44px; }

        /* ── Mobile: 360–599px ── */
        @media (max-width:599px) {
          .nav-inner { gap:0.5rem !important; }
          .nav-title h1 { font-size:0.95rem !important; }
          .nav-title p { display:none !important; }
          .nav-controls { gap:0.3rem !important; }
          .search-wrap { width:100% !important; order:3; }
          .suggest-link { display:none !important; }
          .card-desc { font-size:13px !important; }
          .card-name { font-size:0.9rem !important; }
          .filter-drawer { max-height:92vh !important; }
          .filter-drawer-inner { padding:0 1rem 6rem !important; }
          .float-row { bottom:0.75rem !important; right:0.75rem !important; }
          .chip-row { flex-wrap:wrap !important; }
        }

        /* ── Tablet: 600–899px ── */
        @media (min-width:600px) and (max-width:899px) {
          .nav-title p { font-size:0.65rem !important; }
          .search-wrap { width:180px !important; }
        }

        /* ── Desktop: 900px+ ── */
        @media (min-width:900px) {
          .card:not([data-pinned]):hover { transform:translateY(-2px); }
        }

        /* ── Safe area for notch phones ── */
        .filter-drawer-inner { padding-bottom:max(2rem, env(safe-area-inset-bottom)) !important; }
        .float-row { padding-bottom:env(safe-area-inset-bottom); }
        header { padding-top:env(safe-area-inset-top); }
      `}</style>
      `}</style>

      {/* Aurora — dark only */}
      {D && (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:t.glow }} />
          <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(200,40,40,0.12) 0%,transparent 70%)", top:"-15%", left:"20%", animation:"blob1 18s ease-in-out infinite", willChange:"transform" }} />
          <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(180,30,30,0.09) 0%,transparent 70%)", top:"30%", right:"-10%", animation:"blob2 22s ease-in-out infinite", willChange:"transform" }} />
          <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(220,60,40,0.07) 0%,transparent 70%)", bottom:"5%", left:"10%", animation:"blob3 26s ease-in-out infinite", willChange:"transform" }} />
        </div>
      )}

      {/* ── HEADER — single compact row ───────────────────── */}
      <header style={{ background:t.hBg, borderBottom:`1px solid ${t.hBorder}`, padding:"0 1.25rem", position:"sticky", top:0, zIndex:50, backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div className="nav-inner" style={{ display:"flex", alignItems:"center", gap:"0.6rem", flexWrap:"wrap", minHeight:52, paddingTop:"0.35rem", paddingBottom:"0.35rem" }}>

            {/* Logo / Title */}
            <div className="nav-title" style={{ flex:1, minWidth:0 }}>
              <h1 style={{
                fontSize:"1rem", fontWeight:800, margin:0, letterSpacing:"-0.02em", lineHeight:1.1,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                ...(D
                  ? { background:t.h1, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }
                  : { color:t.h1C }
                )
              }}>
                UI Libraries
              </h1>
              <p style={{ margin:0, fontSize:"0.65rem", color:t.eyebrow, lineHeight:1, marginTop:2 }}>
                {LIBS.length} resources · {VERIFIED_DATE}
              </p>
            </div>

            {/* Search */}
            <div className="search-wrap" style={{ position:"relative", width:190, flexShrink:0 }}>
              <svg style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:t.sPh, pointerEvents:"none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input ref={searchRef} type="text" placeholder="Search ( / )" value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ width:"100%", padding:"0.5rem 1.75rem 0.5rem 1.85rem", background:t.sBg, border:`1px solid ${t.sBorder}`, borderRadius:8, color:t.sColor, fontSize:"max(16px,12.5px)", outline:"none", fontFamily:"inherit", transition:"border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = t.acc}
                onBlur={e => e.target.style.borderColor = t.sBorder}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ position:"absolute", right:7, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:t.sPh, padding:2, lineHeight:1, fontSize:11 }}>✕</button>
              )}
            </div>

            {/* Filter button */}
            <button data-filter-btn onClick={() => filterOpen ? closeDrawer() : setFilterOpen(true)}
              style={{ display:"flex", alignItems:"center", gap:"0.35rem", padding:"0.5rem 0.85rem", minHeight:44, borderRadius:8, border:`1px solid ${filterOpen ? t.acc : t.ctrlBorder}`, background: filterOpen ? `${t.acc}18` : t.ctrl, color: filterOpen ? t.acc : t.ctrlText, fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0, position:"relative" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filters
              {activeFilters > 0 && (
                <span style={{ position:"absolute", top:-5, right:-5, width:16, height:16, borderRadius:"50%", background:t.filterBadge, color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {activeFilters}
                </span>
              )}
            </button>

            {/* Theme toggle — icon only */}
            <button onClick={() => setDark(d => !d)} title={D ? "Switch to light mode" : "Switch to dark mode"} aria-label={D ? "Switch to light mode" : "Switch to dark mode"}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", width:44, height:44, borderRadius:8, border:`1px solid ${t.ctrlBorder}`, background:t.ctrl, color:t.ctrlText, cursor:"pointer", flexShrink:0 }}>
              {D
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>

            {/* Share — icon only */}
            <button onClick={shareFilter} title="Copy link to current view" aria-label="Copy shareable link"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", width:44, height:44, borderRadius:8, border:`1px solid ${copiedShare ? t.acc : t.ctrlBorder}`, background: copiedShare ? `${t.acc}18` : t.ctrl, color: copiedShare ? t.acc : t.ctrlText, cursor:"pointer", flexShrink:0 }}>
              {copiedShare
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
            </button>

            {/* Suggest — text link, hidden on mobile */}
            <button className="suggest-link" onClick={() => { setSuggOpen(true); setTimeout(() => window.scrollTo({ top:document.body.scrollHeight, behavior:"smooth" }), 80); }}
              style={{ fontSize:11.5, fontWeight:500, color:t.eyebrow, background:"none", border:"none", cursor:"pointer", flexShrink:0, whiteSpace:"nowrap", padding:"0 4px", minHeight:44, textDecoration:"none", opacity:0.75 }}
              onMouseEnter={e => { e.currentTarget.style.color=t.acc; e.currentTarget.style.opacity="1"; }}
              onMouseLeave={e => { e.currentTarget.style.color=t.eyebrow; e.currentTarget.style.opacity="0.75"; }}>
              + Suggest
            </button>
          </div>
        </div>
      </header>

      {/* ── FILTER DRAWER — bottom sheet ──────────────────── */}
      {(filterOpen || filterClosing) && (
        <>
          {/* backdrop */}
          <div onClick={() => closeDrawer()} style={{ position:"fixed", inset:0, zIndex:80, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(2px)" }} />
          {/* sheet */}
          <div data-filter-drawer className="filter-drawer" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:90, background:t.drawerBg, borderTop:`1px solid ${t.drawerBorder}`, borderRadius:"20px 20px 0 0", maxHeight:"85vh", overflowY:"auto", animation:`${filterClosing ? "slideDown 0.22s ease forwards" : "slideUp 0.28s ease"}`, boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>

            {/* Scrollable inner */}
            <div className="filter-drawer-inner" style={{ padding:"0 1.25rem 2rem" }}>

            {/* Handle */}
            <div style={{ display:"flex", justifyContent:"center", padding:"0.75rem 0 0.5rem" }}>
              <div style={{ width:40, height:4, borderRadius:999, background:t.ctrlBorder }} />
            </div>

            {/* Header row */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
              <span style={{ fontSize:16, fontWeight:700, color:t.title }}>Filters</span>
              <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
                {activeFilters > 0 && (
                  <button onClick={clearAll} style={{ fontSize:13, fontWeight:600, color:"#fff", background:"rgba(180,60,60,0.85)", border:"none", cursor:"pointer", padding:"0.35rem 0.85rem", borderRadius:8, minHeight:36 }}>
                    Clear all
                  </button>
                )}
                <button onClick={applyFilters} style={{ fontSize:13, fontWeight:700, color:"#fff", background:t.acc, border:"none", cursor:"pointer", padding:"0.35rem 0.85rem", borderRadius:8, minHeight:36 }}>
                  Apply
                </button>
              </div>
            </div>

            {/* Framework filter */}
            <div style={{ marginBottom:"1.25rem" }}>
              <div style={{ fontSize:11, fontWeight:600, color:t.eyebrow, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.6rem" }}>Framework</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                {FRAMEWORKS.map(f => {
                  const on = fw === f.id;
                  return (
                    <button key={f.id} onClick={() => setFw(f.id)}
                      style={{ padding:"0.5rem 1rem", minHeight:44, borderRadius:999, border:`1px solid ${on ? t.acc : t.ctrlBorder}`, background: on ? `${t.acc}18` : t.ctrl, color: on ? t.acc : t.ctrlText, fontSize:14, fontWeight: on ? 600 : 400, cursor:"pointer", transition:"all 0.12s" }}>
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category filter */}
            <div style={{ marginBottom:"1.5rem" }}>
              <div style={{ fontSize:11, fontWeight:600, color:t.eyebrow, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.6rem" }}>Category</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
                {CATEGORIES.map(cat => {
                  const on = active === cat.id;
                  return (
                    <button key={cat.id} onClick={() => setActive(cat.id)}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.65rem 0.85rem", minHeight:48, borderRadius:10, border:`1px solid ${on ? t.acc : "transparent"}`, background: on ? `${t.acc}14` : "transparent", color: on ? t.acc : t.ctrlText, fontSize:15, fontWeight: on ? 600 : 400, cursor:"pointer", textAlign:"left", transition:"all 0.12s", width:"100%" }}>
                      <span>{cat.label}</span>
                      <span style={{ fontSize:11, color: on ? t.acc : t.eyebrow, opacity:0.7 }}>{counts[cat.id] || 0}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom apply button — full width */}
            <button onClick={applyFilters}
              style={{ width:"100%", padding:"0.85rem", borderRadius:12, border:"none", background:t.acc, color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:"-0.01em", marginTop:"0.5rem" }}>
              Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </button>

            </div>{/* end filter-drawer-inner */}
          </div>
        </>
      )}

      {/* ── MAIN ──────────────────────────────────────────── */}
      <main style={{ maxWidth:900, margin:"0 auto", padding:"clamp(0.75rem,2vw,1rem) clamp(0.85rem,3vw,1.25rem) clamp(4rem,8vw,6rem)", position:"relative", zIndex:1 }}>
        {/* subtle inset to visually ground content below sticky header */}
        <div style={{ height:1, background:`linear-gradient(to right,transparent,${t.div},transparent)`, marginBottom:"0.85rem", opacity:0.6 }} />

        {/* Active filter chips */}
        {activeFilters > 0 && (
          <div className="chip-row" style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom:"0.85rem", alignItems:"center" }}>
            <span style={{ fontSize:11, color:t.eyebrow }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            {query && (
              <span style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:11.5, padding:"0.2rem 0.55rem", borderRadius:999, background:`${t.acc}14`, color:t.acc, border:`1px solid ${t.acc}30` }}>
                "{query}"
                <button onClick={() => setQuery("")} style={{ background:"none", border:"none", cursor:"pointer", color:t.acc, padding:0, lineHeight:1, fontSize:11 }}>✕</button>
              </span>
            )}
            {active !== "all" && (
              <span style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:11.5, padding:"0.2rem 0.55rem", borderRadius:999, background:`${t.acc}14`, color:t.acc, border:`1px solid ${t.acc}30` }}>
                {CATEGORIES.find(c => c.id === active)?.label}
                <button onClick={() => setActive("all")} style={{ background:"none", border:"none", cursor:"pointer", color:t.acc, padding:0, lineHeight:1, fontSize:11 }}>✕</button>
              </span>
            )}
            {fw !== "all" && (
              <span style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:11.5, padding:"0.2rem 0.55rem", borderRadius:999, background:`${t.acc}14`, color:t.acc, border:`1px solid ${t.acc}30` }}>
                {fw}
                <button onClick={() => setFw("all")} style={{ background:"none", border:"none", cursor:"pointer", color:t.acc, padding:0, lineHeight:1, fontSize:11 }}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* Recently viewed */}
        {recent.length > 0 && !query && active === "all" && fw === "all" && (
          <div className="recent-block" style={{ marginBottom:"1rem", padding:"0.65rem 0.9rem", background:t.recentBg, border:`1px solid ${t.recentB}`, borderRadius:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.4rem" }}>
              <span style={{ fontSize:10, fontWeight:600, color:t.eyebrow, letterSpacing:"0.1em", textTransform:"uppercase" }}>Recently Visited</span>
              <button onClick={() => { localStorage.removeItem("uidir-recent"); setRecent([]); }} style={{ fontSize:10, color:t.foot, background:"none", border:"none", cursor:"pointer" }}>Clear</button>
            </div>
            <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
              {recent.map(r => (
                <a key={r.id} href={`https://${r.url}`} target="_blank" rel="noopener noreferrer" onClick={() => handleVisit(r)}
                  style={{ fontSize:11.5, padding:"0.18rem 0.55rem", borderRadius:6, background:t.ctrl, border:`1px solid ${t.ctrlBorder}`, color:t.desc, textDecoration:"none", display:"flex", alignItems:"center", gap:"0.28rem" }}>
                  {r.name}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {filtered.length === 0 ? (
          <EmptyState query={query || fw} fw={fw} onClear={clearAll} t={t} />
        ) : (
          <div ref={listRef} key={`${active}-${fw}`} style={{ display:"flex", flexDirection:"column", gap:"0.45rem", animation:"fadeIn 0.18s ease" }}>
            {filtered.map(lib => {
              const m      = CAT_META[lib.cat] || CAT_META["dev-tools"];
              const bg     = D ? m.dBg  : m.lBg;
              const tx     = D ? m.dTx  : m.lTx;
              const dot    = D ? m.dDot : m.lDot;
              const isRand = randomId === lib.id;
              const isCopy = copiedId === lib.id;
              const isNew  = NEW_IDS.has(lib.id);
              const stacks = LIB_STACKS[lib.id] || [];

              return (
                <div key={lib.id} id={`lib-${lib.id}`} className="card"
                  data-pinned={isRand ? "" : undefined}
                  style={{
                    display:"flex", alignItems:"center", gap:"0.65rem",
                    padding:"clamp(0.75rem,2vw,0.9rem) clamp(0.75rem,2vw,1rem)",
                    background: isRand ? t.hlBg : t.card,
                    border: `1px solid ${isRand ? t.hlBorder : t.cardBorder}`,
                    borderRadius:12,
                    boxShadow: isRand ? `0 0 0 2px ${t.hlBorder}, 0 8px 28px rgba(200,40,40,0.2)` : t.cardShadow,
                  }}
                  onMouseEnter={e => { if(!isRand){ e.currentTarget.style.background=t.cardHover; e.currentTarget.style.borderColor=t.cardHBorder; e.currentTarget.style.boxShadow=t.cardHShadow; }}}
                  onMouseLeave={e => { if(!isRand){ e.currentTarget.style.background=t.card; e.currentTarget.style.borderColor=t.cardBorder; e.currentTarget.style.boxShadow=t.cardShadow; }}}
                >
                  <span style={{ width:7, height:7, borderRadius:"50%", background:dot, flexShrink:0, boxShadow:isRand?`0 0 10px ${dot}`:"none", marginTop:1 }} />

                  <a href={`https://${lib.url}`} target="_blank" rel="noopener noreferrer"
                    data-card="true" tabIndex={0} onClick={() => handleVisit(lib)}
                    style={{ flex:1, minWidth:0, textDecoration:"none", outline:"none" }}
                  >
                    <div style={{ display:"flex", alignItems:"center", gap:"0.3rem", flexWrap:"wrap", marginBottom:"0.18rem" }}>
                      <span className="card-name" style={{ fontSize:"0.95rem", fontWeight:700, color:t.title, letterSpacing:"-0.015em" }}>
                        <Highlight text={lib.name} query={query} color={t.hlMark} />
                      </span>
                      <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", padding:"0.09rem 0.45rem", borderRadius:4, background:bg, color:tx }}>
                        {m.label}
                      </span>
                      {isNew && (
                        <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", padding:"0.09rem 0.45rem", borderRadius:4, background:t.nBg, color:t.nTx }}>
                          New
                        </span>
                      )}
                      {stacks.map(s => (
                        <span key={s}
                          onClick={e => { e.preventDefault(); e.stopPropagation(); setFw(f => f === s ? "all" : s); }}
                          title={fw === s ? `Remove "${s}" filter` : `Filter by ${s}`}
                          aria-label={fw === s ? `Remove ${s} filter` : `Filter by ${s}`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === "Enter" && setFw(f => f === s ? "all" : s)}
                          style={{ fontSize:9.5, fontWeight:500, padding:"0.07rem 0.38rem", borderRadius:4, background: fw===s ? `${t.acc}18` : t.stBg, color: fw===s ? t.acc : t.stTx, border:`1px solid ${fw===s ? t.acc+"40" : t.div}`, cursor:"pointer", transition:"background 0.12s,color 0.12s,border-color 0.12s", userSelect:"none" }}>
                          {fw === s ? `✕ ${s}` : s}
                        </span>
                      ))}
                    </div>
                    <div className="card-desc" style={{ fontSize:13.5, color:t.desc, lineHeight:1.65 }}>
                      <Highlight text={lib.desc} query={query} color={t.hlMark} />
                    </div>
                    <div style={{ marginTop:"0.2rem", fontSize:11, color:t.url, fontFamily:"'SF Mono','Fira Code',monospace" }}>
                      {lib.url}
                    </div>
                  </a>

                  <div style={{ display:"flex", alignItems:"center", gap:"0.3rem", flexShrink:0 }}>
                    <div style={{ position:"relative", display:"flex" }} className="copy-wrap">
                    <button onClick={e => copyUrl(lib.url, lib.id, e)} aria-label={isCopy ? "Copied!" : "Copy URL"}
                      style={{ display:"flex", alignItems:"center", justifyContent:"center", width:26, height:26, borderRadius:6, border:`1px solid ${t.div}`, background: isCopy ? t.nBg : t.ctrl, cursor:"pointer", color: isCopy ? t.nTx : t.url, transition:"all 0.15s" }}>
                      {isCopy
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                    </button>
                    <span className="copy-tip" style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)", background:D?"#2a1010":"#2a1f0f", color:D?"#f5e8e8":"#fdf6ed", fontSize:10, fontWeight:500, whiteSpace:"nowrap", padding:"3px 7px", borderRadius:5, pointerEvents:"none", zIndex:200 }}>
                      {isCopy ? "Copied!" : "Copy URL"}
                    </span>
                  </div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.arrow} strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Suggestion box */}
        <div style={{ marginTop:"1.75rem", borderRadius:13, border:`1px solid ${t.suggB}`, background:t.suggBg, overflow:"hidden" }}>
          <button onClick={() => setSuggOpen(o => !o)}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem", padding:"0.85rem 1rem", background:t.suggHBg, border:"none", borderBottom:suggOpen?`1px solid ${t.suggHB}`:"1px solid transparent", cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <span style={{ fontSize:14 }}>💡</span>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:12.5, fontWeight:650, color:t.title }}>Know a resource that belongs here?</div>
                <div style={{ fontSize:11, color:t.desc, marginTop:1 }}>Drop a link — I review and add the best ones.</div>
              </div>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.acc} strokeWidth="2.5"
              style={{ flexShrink:0, transform:suggOpen?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.25s" }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <div style={{ maxHeight:suggOpen?640:0, overflow:"hidden", transition:"max-height 0.35s ease" }}>
            <div style={{ padding:"1rem" }}>
              {sent ? (
                <div style={{ textAlign:"center", padding:"1.5rem 0", color:t.nTx }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>✓</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>Opening your email app…</div>
                  <div style={{ fontSize:11, marginTop:3, color:t.desc }}>Appreciated!</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"0.5rem" }}>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.label, marginBottom:"0.22rem" }}>Your name <span style={{ opacity:0.5, fontWeight:400 }}>(optional)</span></label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" style={iStyle} onFocus={e=>e.target.style.borderColor=t.acc} onBlur={e=>e.target.style.borderColor=t.iBorder} />
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.label, marginBottom:"0.22rem" }}>Site name <span style={{ color:"#e05050" }}>*</span></label>
                      <input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="e.g. ShadcnBlocks" style={iStyle} onFocus={e=>e.target.style.borderColor=t.acc} onBlur={e=>e.target.style.borderColor=t.iBorder} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.label, marginBottom:"0.22rem" }}>URL <span style={{ color:"#e05050" }}>*</span></label>
                    <input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} placeholder="e.g. shadcnblocks.com" style={iStyle} onFocus={e=>e.target.style.borderColor=t.acc} onBlur={e=>e.target.style.borderColor=t.iBorder} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.label, marginBottom:"0.22rem" }}>Why should it be listed? <span style={{ opacity:0.5, fontWeight:400 }}>(optional)</span></label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="What makes it useful or unique…" rows={3}
                      style={{ ...iStyle, resize:"vertical", minHeight:60, lineHeight:1.55 }}
                      onFocus={e=>e.target.style.borderColor=t.acc} onBlur={e=>e.target.style.borderColor=t.iBorder} />
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.4rem" }}>
                    <p style={{ margin:0, fontSize:10.5, color:t.desc }}>Opens your email app with details pre-filled.</p>
                    <button onClick={handleSuggest} disabled={!siteName.trim()||!siteUrl.trim()}
                      style={{ display:"flex", alignItems:"center", gap:"0.3rem", padding:"0.45rem 0.9rem", borderRadius:8, border:"none", background:(!siteName.trim()||!siteUrl.trim())?`${t.acc}20`:t.submit, color:(!siteName.trim()||!siteUrl.trim())?t.acc:"#fff", fontSize:12.5, fontWeight:600, cursor:(!siteName.trim()||!siteUrl.trim())?"not-allowed":"pointer", opacity:(!siteName.trim()||!siteUrl.trim())?0.6:1 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop:"1rem", paddingTop:"0.85rem", borderTop:`1px solid ${t.div}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.5rem" }}>
          <p style={{ margin:0, fontSize:11, color:t.foot }}>
            Hand-picked by a solo dev · All links verified {VERIFIED_DATE}
          </p>
          <span style={{ fontSize:11, color:t.foot }}>{filtered.length} / {LIBS.length}</span>
        </div>
      </main>

      {/* Back to top */}
      {/* Floating action row — safe area aware */}
      <div className="float-row" style={{ position:"fixed", bottom:"1.25rem", right:"1.25rem", zIndex:100, display:"flex", alignItems:"center", gap:"0.5rem" }}>
        {showTop && (
          <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
            title="Back to top" aria-label="Back to top"
            style={{ width:44, height:44, borderRadius:"50%", border:`1px solid ${t.ctrlBorder}`, background:t.ctrl, color:t.ctrlText, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.25)", backdropFilter:"blur(10px)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
        )}
        {floatVis && (
          <button onClick={() => { setSuggOpen(true); setTimeout(() => window.scrollTo({ top:document.body.scrollHeight, behavior:"smooth" }), 80); }}
            style={{ height:44, display:"flex", alignItems:"center", gap:"0.35rem", padding:"0 1rem", borderRadius:999, border:"none", background:t.float, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:`0 4px 18px ${t.float}60`, backdropFilter:"blur(10px)", whiteSpace:"nowrap" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Suggest
          </button>
        )}
      </div>
    </div>
  );
}
