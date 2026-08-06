import { useState, useMemo, useEffect, useRef, useCallback } from "react";

// ── Theme persistence ──────────────────────────────────────────────
function getSavedTheme() {
  try { return localStorage.getItem("uidir-theme") !== "light"; }
  catch { return true; }
}
function saveTheme(dark) {
  try { localStorage.setItem("uidir-theme", dark ? "dark" : "light"); } catch {}
}

// ── Recently viewed ────────────────────────────────────────────────
function getRecent() {
  try { return JSON.parse(localStorage.getItem("uidir-recent") || "[]"); }
  catch { return []; }
}
function addRecent(lib) {
  try {
    const prev = getRecent().filter(r => r.id !== lib.id);
    localStorage.setItem("uidir-recent", JSON.stringify([lib, ...prev].slice(0, 5)));
  } catch {}
}

// ── URL state ──────────────────────────────────────────────────────
function getUrlParams() {
  if (typeof window === "undefined") return { cat: "all", q: "", fw: "all" };
  const p = new URLSearchParams(window.location.search);
  return { cat: p.get("cat") || "all", q: p.get("q") || "", fw: p.get("fw") || "all" };
}
function setUrlParams(cat, q, fw) {
  const p = new URLSearchParams();
  if (cat && cat !== "all") p.set("cat", cat);
  if (q) p.set("q", q);
  if (fw && fw !== "all") p.set("fw", fw);
  const str = p.toString();
  window.history.replaceState(null, "", str ? `?${str}` : window.location.pathname);
}

// ── Highlight match in text ────────────────────────────────────────
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
  { id: "all",          label: "All Frameworks" },
  { id: "React",        label: "React" },
  { id: "Vue",          label: "Vue" },
  { id: "Svelte",       label: "Svelte" },
  { id: "Angular",      label: "Angular" },
  { id: "Tailwind",     label: "Tailwind" },
  { id: "CSS",          label: "CSS / HTML" },
  { id: "Design",       label: "Design" },
];

const CATEGORIES = [
  { id: "all",           label: "All" },
  { id: "animated",      label: "Animated & Motion" },
  { id: "shadcn",        label: "shadcn Ecosystem" },
  { id: "tailwind",      label: "Tailwind CSS" },
  { id: "css",           label: "CSS / HTML / SVG" },
  { id: "react",         label: "Full React" },
  { id: "angular",       label: "Angular" },
  { id: "headless",      label: "Headless" },
  { id: "multi",         label: "Vue / Svelte" },
  { id: "collections",   label: "Collections" },
  { id: "design-tools",  label: "Design Tools" },
  { id: "dev-tools",     label: "Dev Tools" },
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
  { id:1,  name:"Aceternity UI",        url:"ui.aceternity.com",                   cat:"animated",      desc:"Stunning animated components built with Tailwind CSS and Framer Motion — perfect for landing pages", added:"2024-01" },
  { id:2,  name:"Magic UI",             url:"magicui.design",                      cat:"animated",      desc:"150+ free, open-source animated React components for marketing sites and SaaS products", added:"2024-02" },
  { id:3,  name:"Motion Primitives",    url:"motion-primitives.com",               cat:"animated",      desc:"Copy-paste motion primitives for building beautiful, animated React interfaces", added:"2024-03" },
  { id:4,  name:"Eldora UI",            url:"eldoraui.site",                       cat:"animated",      desc:"Animated React components inspired by shadcn/ui, Aceternity UI, and Magic UI", added:"2024-04" },
  { id:5,  name:"Cult UI",              url:"cult-ui.com",                         cat:"animated",      desc:"Polished animated React components built on shadcn/ui with a refined dark-mode-first aesthetic", added:"2024-05" },
  { id:6,  name:"Animata",              url:"animata.design",                      cat:"animated",      desc:"Hand-crafted interaction and animation components for creative interfaces", added:"2024-06" },
  { id:7,  name:"UI Layout",            url:"ui-layout.com",                       cat:"animated",      desc:"Complex layout patterns with smooth animation support for modern React apps", added:"2024-07" },
  { id:8,  name:"Lukacho UI",           url:"ui.lukacho.com",                      cat:"animated",      desc:"Minimal animated UI kit for modern React apps", added:"2024-08" },
  { id:9,  name:"ReactBits",            url:"reactbits.dev",                       cat:"animated",      desc:"Animated React bit-components for creative, expressive UIs", added:"2024-09" },
  { id:10, name:"SmoothUI",             url:"smoothui.dev",                        cat:"animated",      desc:"130+ ultra-smooth micro-interaction components built on Motion, compatible with shadcn/ui", added:"2024-10" },
  { id:11, name:"Fancy Components",     url:"fancycomponents.dev",                 cat:"animated",      desc:"Distinctive, delightful animated component collection for creative developers", added:"2024-11" },
  { id:12, name:"CuiCui",               url:"cuicui.day",                          cat:"animated",      desc:"Daily component drops with polished motion design and copy-paste simplicity", added:"2024-12" },
  { id:13, name:"SyntaxUI",             url:"syntaxui.com",                        cat:"animated",      desc:"Dev-focused animated component library with live code previews and Tailwind integration", added:"2024-13" },
  { id:15, name:"UI Labs",              url:"uilabs.dev",                          cat:"animated",      desc:"Experimental laboratory of fine UI — carefully crafted React components and interactions", added:"2024-15" },
  { id:16, name:"shadcn/ui",            url:"ui.shadcn.com",                       cat:"shadcn",        desc:"The gold standard — accessible, re-usable components installed via CLI into your own codebase", added:"2023-01" },
  { id:17, name:"21st.dev",             url:"21st.dev",                            cat:"shadcn",        desc:"The npm for design engineers — community-driven component registry with thousands of components", added:"2024-01" },
  { id:18, name:"Origin UI",            url:"originui.com",                        cat:"shadcn",        desc:"Beautiful, SaaS-focused shadcn/ui components built with a design-first approach", added:"2024-02" },
  { id:19, name:"Shadcnblocks",         url:"shadcnblocks.com",                    cat:"shadcn",        desc:"1,700+ full page sections and blocks for shadcn/ui projects — the largest block marketplace", added:"2024-03" },
  { id:20, name:"HextaUI",              url:"hextaui.com",                         cat:"shadcn",        desc:"Modern shadcn/ui extensions with refined aesthetics and smooth animations", added:"2024-04" },
  { id:21, name:"KokonutUI",            url:"kokonutui.com",                       cat:"shadcn",        desc:"Accessible, production-ready shadcn/ui component extensions with strong defaults", added:"2024-05" },
  { id:22, name:"Bundui",               url:"bundui.io",                           cat:"shadcn",        desc:"Curated shadcn/ui component bundles, ready to drop into your project", added:"2024-06" },
  { id:23, name:"Skiper UI",            url:"skiper-ui.com",                       cat:"shadcn",        desc:"24 free animated components built on top of shadcn/ui with polished motion", added:"2024-07" },
  { id:24, name:"lndev/ui",             url:"ui.lndev.me",                         cat:"shadcn",        desc:"Indie-crafted shadcn/ui extensions with a unique visual personality", added:"2024-08" },
  { id:25, name:"ReUI",                 url:"reui.io",                             cat:"shadcn",        desc:"Enterprise-grade shadcn/ui component extensions with Radix and Base UI support", added:"2024-09" },
  { id:26, name:"MynaUI",               url:"mynaui.com",                          cat:"shadcn",        desc:"Elegant shadcn/ui components with a consistent visual language and design-system parity", added:"2024-10" },
  { id:27, name:"BadtzUI",              url:"badtz-ui.com",                        cat:"shadcn",        desc:"Core-free shadcn/ui extensions updated every week — fresh components on a regular schedule", added:"2024-11" },
  { id:28, name:"Nyxb UI",              url:"nyxbui.design",                       cat:"shadcn",        desc:"Dark-mode-first shadcn/ui components with rich motion and expressive visual design", added:"2024-12" },
  { id:79, name:"Kibo UI",              url:"kibo-ui.com",                         cat:"shadcn",        desc:"Advanced shadcn/ui registry: color pickers, QR codes, drag-drop uploaders, AI chatbot UI and more", added:"2024-13" },
  { id:29, name:"DaisyUI",              url:"daisyui.com",                         cat:"tailwind",      desc:"The most popular Tailwind CSS component library — 65 components, 35 themes, zero JS dependencies", added:"2021-01" },
  { id:30, name:"Flowbite",             url:"flowbite.com",                        cat:"tailwind",      desc:"Open-source Tailwind component library with React, Vue, and Svelte adapters plus a Figma kit", added:"2021-02" },
  { id:31, name:"Preline UI",           url:"preline.co",                          cat:"tailwind",      desc:"Fully responsive Tailwind HTML components and templates with Alpine.js interactivity", added:"2022-01" },
  { id:32, name:"HyperUI",              url:"hyperui.dev",                         cat:"tailwind",      desc:"Free open-source Tailwind components for ecommerce, marketing, and application UIs", added:"2022-02" },
  { id:33, name:"Meraki UI",            url:"merakiui.com",                        cat:"tailwind",      desc:"Beautiful, RTL-supported Tailwind CSS UI components for your next project", added:"2022-03" },
  { id:77, name:"Sailboat UI",          url:"sailboatui.com",                      cat:"tailwind",      desc:"150+ open-source Tailwind CSS components with Alpine.js interactivity built in", added:"2023-01" },
  { id:78, name:"TailGrids",            url:"tailgrids.com",                       cat:"tailwind",      desc:"600+ free React + Tailwind components, blocks, and templates for real-world production use", added:"2023-02" },
  { id:34, name:"FlyonUI",              url:"flyonui.com",                         cat:"tailwind",      desc:"Semantic Tailwind components built on DaisyUI and Alpine.js with extra utility", added:"2023-03" },
  { id:35, name:"Penguin UI",           url:"penguinui.com",                       cat:"tailwind",      desc:"Simple, clean, and accessible Tailwind CSS components", added:"2023-04" },
  { id:36, name:"Tailkits",             url:"tailkits.com",                        cat:"tailwind",      desc:"Curated Tailwind CSS component marketplace and collection", added:"2023-05" },
  { id:37, name:"Tailus HTML",          url:"html.tailus.io",                      cat:"tailwind",      desc:"Tailwind CSS components with refined visual design standards and P3 color support", added:"2023-06" },
  { id:38, name:"DevUI",                url:"devui.in",                            cat:"tailwind",      desc:"Developer-centric Tailwind components with a code-first developer experience", added:"2023-07" },
  { id:39, name:"Tailblocks",           url:"tailblocks.cc",                       cat:"tailwind",      desc:"Ready-to-use Tailwind CSS blocks for rapid prototyping and layout building", added:"2021-03" },
  { id:40, name:"Uiverse",              url:"uiverse.io",                          cat:"css",           desc:"Community-created CSS elements and components — thousands of unique, copy-paste-ready designs", added:"2022-01" },
  { id:41, name:"Dot Matrix",           url:"dotmatrix.zzzzshawn.cloud",           cat:"css",           desc:"55+ free dot-matrix loaders built with React, TypeScript, Tailwind, and shadcn", added:"2026-01" },
  { id:42, name:"Shapes Gallery",       url:"shapes.gallery",                      cat:"css",           desc:"Pure CSS shape collection for creative backgrounds, decorations, and visual flourishes", added:"2023-01" },
  { id:43, name:"RareUI",               url:"rareui.com",                          cat:"css",           desc:"Unique, rare animated React components built with Tailwind and Motion — genuinely uncommon designs", added:"2024-01" },
  { id:44, name:"Indie Starter UI",     url:"ui.indie-starter.dev",               cat:"css",           desc:"Minimal React + shadcn components for indie hackers who want to ship fast", added:"2024-02" },
  { id:45, name:"FlashUI",              url:"flashui.site",                        cat:"css",           desc:"Zero-install, paste-and-go CSS UI elements for quick wins", added:"2024-03" },
  { id:46, name:"Ever UI",              url:"ever-ui.com",                         cat:"css",           desc:"Evergreen CSS components built for long-term browser support and stability", added:"2024-04" },
  { id:47, name:"Chakra Framer",        url:"chakraframer.com",                    cat:"css",           desc:"CSS motion templates inspired by Framer's design system and interaction patterns", added:"2024-05" },
  { id:48, name:"Ground Bossadizenith", url:"ground.bossadizenith.me",            cat:"css",           desc:"Experimental CSS components and ground-level visual effects for creative projects", added:"2024-06" },
  { id:49, name:"HeroUI",               url:"heroui.com",                          cat:"react",         desc:"Beautiful React components (formerly NextUI) — 100+ accessible, themeable components", added:"2022-01" },
  { id:50, name:"Mantine",              url:"mantine.dev",                         cat:"react",         desc:"Feature-rich React component library with 100+ components and 50+ hooks", added:"2021-01" },
  { id:51, name:"Chakra UI",            url:"chakra-ui.com",                       cat:"react",         desc:"Accessible, composable React components with dark mode and theming out of the box", added:"2020-01" },
  { id:52, name:"PrimeReact",           url:"primereact.org",                      cat:"react",         desc:"The ultimate React UI component suite — 90+ components with rich theming support", added:"2019-01" },
  { id:53, name:"MUI",                  url:"mui.com",                             cat:"react",         desc:"The most widely used React UI framework — Material Design and Joy UI component systems", added:"2016-01" },
  { id:54, name:"Ant Design",           url:"ant.design",                          cat:"react",         desc:"Enterprise-grade React UI library from Alibaba — the standard for large-scale business apps", added:"2016-02" },
  { id:75, name:"Tremor",               url:"tremor.so",                           cat:"react",         desc:"35+ open-source React components for dashboards — charts, KPI cards, data tables and trackers", added:"2023-01" },
  { id:80, name:"Fluent UI",            url:"react.fluentui.dev",                 cat:"react",         desc:"Microsoft's open-source React library with 950+ cross-platform components powering Office and Teams", added:"2020-01" },
  { id:81, name:"Blueprint",            url:"blueprintjs.com",                     cat:"react",         desc:"Palantir's React UI toolkit optimized for data-dense, complex desktop applications", added:"2017-01" },
  { id:82, name:"Semantic UI React",    url:"react.semantic-ui.com",              cat:"react",         desc:"Human-friendly declarative React APIs — 100+ components with a natural language approach", added:"2016-01" },
  { id:83, name:"CoreUI React",         url:"coreui.io/react",                    cat:"react",         desc:"Bootstrap-based enterprise React library with admin dashboard templates and components", added:"2018-01" },
  { id:85, name:"React Bootstrap",      url:"react-bootstrap.github.io",          cat:"react",         desc:"Bootstrap rebuilt from scratch as true React components — no jQuery, full React lifecycle", added:"2019-01" },
  { id:55, name:"Gluestack",            url:"gluestack.io",                        cat:"react",         desc:"Fully free React + React Native component library — one codebase, two platforms", added:"2023-01" },
  { id:56, name:"React Suite",          url:"rsuitejs.com",                        cat:"react",         desc:"Comprehensive suite of React components for enterprise-grade applications", added:"2017-01" },
  { id:57, name:"Grommet",              url:"v2.grommet.io",                       cat:"react",         desc:"Accessibility-first React library backed by HPE — battle-tested for enterprise products", added:"2015-01" },
  { id:95, name:"Angular Material",     url:"material.angular.io",                 cat:"angular",       desc:"Google's official Angular UI library — Material Design components maintained by the Angular core team", added:"2016-01" },
  { id:96, name:"PrimeNG",              url:"primeng.org",                         cat:"angular",       desc:"The most complete Angular UI component suite — 80+ components, multiple themes, fully MIT-licensed", added:"2016-02" },
  { id:97, name:"NG-ZORRO",             url:"ng.ant.design",                       cat:"angular",       desc:"Enterprise-class Angular UI library based on Ant Design — 60+ components, MIT-licensed, Alibaba-backed", added:"2017-01" },
  { id:58, name:"Radix UI",             url:"radix-ui.com",                        cat:"headless",      desc:"Unstyled, fully accessible React components — the foundation of shadcn/ui and many design systems", added:"2021-01" },
  { id:59, name:"Headless UI",          url:"headlessui.com",                      cat:"headless",      desc:"Completely unstyled, fully accessible UI components by the Tailwind CSS team", added:"2020-01" },
  { id:60, name:"Base UI",              url:"base-ui.com",                         cat:"headless",      desc:"Unstyled React components from the MUI team — the actively maintained Radix UI alternative in 2026", added:"2023-01" },
  { id:61, name:"React Aria",           url:"react-spectrum.adobe.com/react-aria", cat:"headless",      desc:"Adobe's React Hooks library for building accessible UI primitives — rock-solid ARIA compliance", added:"2020-01" },
  { id:84, name:"Ark UI",               url:"ark-ui.com",                          cat:"headless",      desc:"45+ headless, zero-style, framework-agnostic accessible UI primitives for any stack", added:"2023-01" },
  { id:14, name:"Inspira UI",           url:"inspira-ui.com",                      cat:"multi",         desc:"Animated component library for Vue developers — the Vue equivalent of Magic UI", added:"2024-01" },
  { id:62, name:"shadcn-svelte",        url:"shadcn-svelte.com",                   cat:"multi",         desc:"shadcn/ui ported to Svelte — all the power and DX, native Svelte syntax", added:"2023-01" },
  { id:63, name:"Flowbite Svelte",      url:"flowbite-svelte.com",                 cat:"multi",         desc:"Flowbite component library ported to Svelte with full feature parity", added:"2023-02" },
  { id:76, name:"Float UI",             url:"floatui.com",                         cat:"multi",         desc:"Free multi-framework UI components that work with React, Vue, Svelte, and plain HTML", added:"2023-03" },
  { id:64, name:"Vuetify",              url:"vuetifyjs.com",                       cat:"multi",         desc:"Material Design component framework for Vue — 80+ components and a massive ecosystem", added:"2016-01" },
  { id:65, name:"PrimeVue",             url:"primevue.org",                        cat:"multi",         desc:"The ultimate Vue UI component library — 90+ components, 11 themes, and a Figma kit", added:"2019-01" },
  { id:93, name:"Nuxt UI",              url:"ui.nuxt.com",                         cat:"multi",         desc:"125+ accessible Tailwind CSS components for Vue and Nuxt — v4 made everything completely free including 12 templates and a Figma kit", added:"2026-01" },
  { id:66, name:"Untitled UI React",    url:"untitledui.com/react",                cat:"collections",   desc:"React implementation of the Untitled UI Figma design system — built with Tailwind v4 and React Aria", added:"2026-01" },
  { id:67, name:"Tailark",              url:"tailark.com",                         cat:"collections",   desc:"Marketing-focused block library with the most distinctive design language in the shadcn ecosystem", added:"2024-01" },
  { id:68, name:"React Keep Design",    url:"react.keepdesign.io",                 cat:"collections",   desc:"Design-driven React component collection with strong Figma-to-code workflow support", added:"2023-01" },
  { id:70, name:"Pattern Craft",        url:"patterncraft.dev",                    cat:"design-tools",  desc:"100+ CSS and Tailwind background patterns, ready to copy-paste into any project", added:"2024-01" },
  { id:71, name:"Gradienty",            url:"gradienty.codes",                     cat:"design-tools",  desc:"CSS gradient generator and library — browse, customize, and copy gradients in one click", added:"2023-01" },
  { id:87, name:"Coolors",              url:"coolors.co",                          cat:"design-tools",  desc:"The fastest color palette generator — create, explore, and share beautiful color palettes", added:"2015-01" },
  { id:91, name:"Blobmaker",            url:"blobmaker.app",                       cat:"design-tools",  desc:"Generate unique SVG blob shapes for backgrounds, illustrations, and decorative elements", added:"2019-01" },
  { id:94, name:"CSS Clip-Path Maker",  url:"bennettfeely.com/clippy",             cat:"design-tools",  desc:"Visual CSS clip-path shape generator — create complex clip-path values without writing code", added:"2015-01" },
  { id:86, name:"Google Fonts",         url:"fonts.google.com",                    cat:"design-tools",  desc:"1,500+ free, open-source web fonts — the most widely used font resource on the internet", added:"2010-01" },
  { id:90, name:"LottieFiles",          url:"lottiefiles.com",                     cat:"design-tools",  desc:"Platform for Lottie animations — create, edit, preview, and share lightweight web animations", added:"2017-01" },
  { id:72, name:"Lordicon",             url:"lordicon.com",                        cat:"dev-tools",     desc:"Animated Lottie icons with a free tier — 1000+ animated icons ready for web and apps", added:"2020-01" },
  { id:73, name:"Lucide Icons",         url:"lucide.dev",                          cat:"dev-tools",     desc:"1000+ open-source icons — consistent stroke width, MIT-licensed, React/Vue/Svelte packages included", added:"2021-01" },
  { id:88, name:"Iconify",              url:"iconify.design",                      cat:"dev-tools",     desc:"250,000+ open-source SVG icons from 150+ icon sets unified under one API and package", added:"2020-01" },
  { id:89, name:"Squoosh",              url:"squoosh.app",                         cat:"dev-tools",     desc:"Open-source image compression tool that runs entirely in the browser — no upload, fully private", added:"2018-01" },
];

const NEW_IDS       = new Set(LIBS.filter(l => l.added?.startsWith("2026")).map(l => l.id));
const VERIFIED_DATE = "August 2026";
const RECIPIENT     = "your@email.com";

const CAT_META = {
  animated:      { label:"Animated",      dBg:"rgba(139,92,246,0.14)", dTx:"#c4b5fd", dDot:"#8b5cf6", lBg:"rgba(109,40,217,0.09)", lTx:"#5b21b6", lDot:"#7c3aed" },
  shadcn:        { label:"shadcn",        dBg:"rgba(34,197,94,0.12)",  dTx:"#86efac", dDot:"#22c55e", lBg:"rgba(22,163,74,0.09)",  lTx:"#14532d", lDot:"#16a34a" },
  tailwind:      { label:"Tailwind",      dBg:"rgba(14,165,233,0.12)", dTx:"#7dd3fc", dDot:"#0ea5e9", lBg:"rgba(2,132,199,0.09)",  lTx:"#075985", lDot:"#0284c7" },
  css:           { label:"CSS / SVG",     dBg:"rgba(251,146,60,0.12)", dTx:"#fdba74", dDot:"#f97316", lBg:"rgba(194,65,12,0.09)",  lTx:"#9a3412", lDot:"#ea580c" },
  react:         { label:"React",         dBg:"rgba(96,165,250,0.12)", dTx:"#93c5fd", dDot:"#60a5fa", lBg:"rgba(37,99,235,0.09)",  lTx:"#1e3a8a", lDot:"#2563eb" },
  angular:       { label:"Angular",       dBg:"rgba(220,53,69,0.14)",  dTx:"#fca5a5", dDot:"#ef4444", lBg:"rgba(185,28,28,0.09)",  lTx:"#991b1b", lDot:"#dc2626" },
  headless:      { label:"Headless",      dBg:"rgba(248,113,113,0.12)",dTx:"#fca5a5", dDot:"#f87171", lBg:"rgba(159,18,57,0.09)",  lTx:"#881337", lDot:"#e11d48" },
  multi:         { label:"Vue / Svelte",  dBg:"rgba(52,211,153,0.12)", dTx:"#6ee7b7", dDot:"#34d399", lBg:"rgba(4,120,87,0.09)",   lTx:"#065f46", lDot:"#059669" },
  collections:   { label:"Collection",    dBg:"rgba(250,204,21,0.12)", dTx:"#fde047", dDot:"#eab308", lBg:"rgba(146,64,14,0.09)",  lTx:"#78350f", lDot:"#b45309" },
  "design-tools":{ label:"Design Tool",   dBg:"rgba(232,121,249,0.12)",dTx:"#f0abfc", dDot:"#d946ef", lBg:"rgba(126,34,206,0.09)", lTx:"#581c87", lDot:"#9333ea" },
  "dev-tools":   { label:"Dev Tool",      dBg:"rgba(20,184,166,0.12)", dTx:"#5eead4", dDot:"#14b8a6", lBg:"rgba(13,148,136,0.09)", lTx:"#134e4a", lDot:"#0d9488" },
};

// ── Empty state SVG ────────────────────────────────────────────────
function EmptyState({ query, onClear, color }) {
  return (
    <div style={{ textAlign:"center", padding:"4rem 0 3rem" }}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin:"0 auto 1rem", display:"block", opacity:0.35 }}>
        <circle cx="28" cy="28" r="18" stroke={color} strokeWidth="2.5"/>
        <path d="M41 41L54 54" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M22 28h12M28 22v12" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </svg>
      <div style={{ fontSize:14, fontWeight:600, color, marginBottom:"0.35rem" }}>
        No results for "{query}"
      </div>
      <div style={{ fontSize:12, color, opacity:0.6, marginBottom:"1rem" }}>
        Try a different keyword or framework filter
      </div>
      <button onClick={onClear}
        style={{ fontSize:12, color:"#a78bfa", background:"none", border:"1px solid rgba(167,139,250,0.3)", borderRadius:8, padding:"0.35rem 0.9rem", cursor:"pointer" }}>
        Clear all filters
      </button>
    </div>
  );
}

export default function App() {
  const init = getUrlParams();
  const [active,    setActive]    = useState(init.cat);
  const [query,     setQuery]     = useState(init.q);
  const [fw,        setFw]        = useState(init.fw);
  const [sort,      setSort]      = useState("default");
  const [dark,      setDark]      = useState(getSavedTheme);
  const [suggOpen,  setSuggOpen]  = useState(false);
  const [copiedId,  setCopiedId]  = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [randomId,  setRandomId]  = useState(null);
  const [showTop,   setShowTop]   = useState(false);
  const [floatVis,  setFloatVis]  = useState(false);
  const [recent,    setRecent]    = useState(getRecent);
  const [focusIdx,  setFocusIdx]  = useState(-1);
  const [name,      setName]      = useState("");
  const [siteName,  setSiteName]  = useState("");
  const [siteUrl,   setSiteUrl]   = useState("");
  const [reason,    setReason]    = useState("");
  const [sent,      setSent]      = useState(false);
  const searchRef  = useRef(null);
  const listRef    = useRef(null);
  const D = dark;

  // persist theme
  useEffect(() => { saveTheme(dark); }, [dark]);

  // URL sync
  useEffect(() => { setUrlParams(active, query, fw); }, [active, query, fw]);

  // scroll
  useEffect(() => {
    const fn = () => { const y = window.scrollY; setShowTop(y > 500); setFloatVis(y > 400); };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const fn = (e) => {
      const tag = document.activeElement?.tagName;
      const inInput = ["INPUT","TEXTAREA","SELECT"].includes(tag);
      if (e.key === "/" && !inInput) { e.preventDefault(); searchRef.current?.focus(); return; }
      if (e.key === "Escape") { setQuery(""); setFw("all"); searchRef.current?.blur(); return; }
      // arrow key card navigation
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !inInput) {
        e.preventDefault();
        setFocusIdx(i => {
          const cards = listRef.current?.querySelectorAll("a[data-card]");
          if (!cards?.length) return i;
          const next = e.key === "ArrowDown" ? Math.min(i + 1, cards.length - 1) : Math.max(i - 1, 0);
          cards[next]?.focus();
          return next;
        });
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  function changeActive(id) { setActive(id); setRandomId(null); setFocusIdx(-1); }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = LIBS.filter(l => {
      const matchCat = active === "all" || l.cat === active;
      const matchQ   = !q || l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q);
      const stacks   = LIB_STACKS[l.id] || [];
      const matchFw  = fw === "all" || stacks.includes(fw);
      return matchCat && matchQ && matchFw;
    });
    if (sort === "alpha") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "new")   list = [...list].sort((a, b) => (NEW_IDS.has(b.id)?1:0)-(NEW_IDS.has(a.id)?1:0));
    return list;
  }, [active, query, fw, sort]);

  const counts = useMemo(() => {
    const c = { all: LIBS.length };
    LIBS.forEach(l => { c[l.cat] = (c[l.cat] || 0) + 1; });
    return c;
  }, []);

  function pickRandom() {
    const pool = filtered.length > 1 ? filtered.filter(l => l.id !== randomId) : filtered;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setRandomId(pick.id);
    setTimeout(() => document.getElementById(`lib-${pick.id}`)?.scrollIntoView({ behavior:"smooth", block:"center" }), 60);
  }

  function openAll() {
    filtered.slice(0, 10).forEach((lib, i) => {
      setTimeout(() => window.open(`https://${lib.url}`, "_blank"), i * 120);
    });
  }

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

  function handleVisit(lib) {
    addRecent(lib);
    setRecent(getRecent());
  }

  function handleSuggest() {
    if (!siteName.trim() || !siteUrl.trim()) return;
    const s = x => x.trim();
    const rawUrl = s(siteUrl).startsWith("http") ? s(siteUrl) : `https://${s(siteUrl)}`;
    const subject = encodeURIComponent(`UI Library Suggestion: ${s(siteName)}`);
    const body = encodeURIComponent(`Hi,\n\nI'd like to suggest a resource.\n\nName: ${s(siteName)}\nURL:  ${rawUrl}\n${s(reason)?`\nWhy it's useful:\n${s(reason)}\n`:""}${s(name)?`\nSuggested by: ${s(name)}`:""}\n\nThanks!`);
    window.open(`mailto:${RECIPIENT}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
    setTimeout(() => { setSent(false); setName(""); setSiteName(""); setSiteUrl(""); setReason(""); }, 3000);
  }

  // ── Theme tokens ───────────────────────────────────────────────
  const t = {
    bg:         D?"#0c0c13"                        :"#f4f5f8",
    hBg:        D?"rgba(12,12,19,0.88)"            :"rgba(255,255,255,0.93)",
    hBorder:    D?"rgba(255,255,255,0.09)"         :"rgba(0,0,0,0.09)",
    card:       D?"#13131f"                        :"#ffffff",
    cBorder:    D?"rgba(255,255,255,0.09)"         :"rgba(0,0,0,0.09)",
    cHover:     D?"#1c1c30"                        :"#eef1ff",
    cHBorder:   D?"rgba(167,139,250,0.5)"          :"rgba(99,102,241,0.45)",
    cFocus:     D?"rgba(167,139,250,0.85)"         :"rgba(99,102,241,0.85)",
    hlBg:       D?"rgba(167,139,250,0.1)"          :"rgba(99,102,241,0.07)",
    hlBorder:   D?"rgba(167,139,250,0.65)"         :"rgba(99,102,241,0.65)",
    title:      D?"#f0f4ff"                        :"#0f172a",
    desc:       D?"#9baacf"                        :"#374151",
    url:        D?"#4a5a74"                        :"#9ca3af",
    eyebrow:    D?"#7c8db5"                        :"#6b7280",
    tabBg:      D?"rgba(255,255,255,0.06)"         :"rgba(0,0,0,0.05)",
    tabABg:     D?"rgba(167,139,250,0.18)"         :"rgba(99,102,241,0.12)",
    tabC:       D?"#7c8db5"                        :"#4b5563",
    tabAC:      D?"#d4bbff"                        :"#3730a3",
    tabAB:      D?"rgba(167,139,250,0.5)"          :"rgba(99,102,241,0.5)",
    sBg:        D?"rgba(255,255,255,0.06)"         :"#ffffff",
    sBorder:    D?"rgba(255,255,255,0.12)"         :"rgba(0,0,0,0.13)",
    sColor:     D?"#f0f4ff"                        :"#0f172a",
    sPh:        D?"#4a5a74"                        :"#9ca3af",
    arrow:      D?"#3d4f63"                        :"#c8cdd6",
    foot:       D?"#4a5a74"                        :"#9ca3af",
    h1:         D?"linear-gradient(135deg,#ffffff 0%,#c4b5fd 100%)":undefined,
    h1C:        D?undefined                        :"#0f172a",
    glow:       D?"radial-gradient(ellipse 70% 35% at 50% -5%,rgba(139,92,246,0.15) 0%,transparent 70%)":"none",
    ctrl:       D?"rgba(255,255,255,0.05)"         :"rgba(0,0,0,0.04)",
    ctrlB:      D?"rgba(255,255,255,0.1)"          :"rgba(0,0,0,0.1)",
    div:        D?"rgba(255,255,255,0.06)"         :"rgba(0,0,0,0.07)",
    copyBg:     D?"rgba(255,255,255,0.06)"         :"rgba(0,0,0,0.04)",
    float:      D?"#7c3aed"                        :"#4f46e5",
    stBg:       D?"rgba(255,255,255,0.07)"         :"rgba(0,0,0,0.05)",
    stTx:       D?"#64748b"                        :"#6b7280",
    suggBg:     D?"#13131f"                        :"#ffffff",
    suggB:      D?"rgba(255,255,255,0.09)"         :"rgba(0,0,0,0.09)",
    suggHBg:    D?"rgba(139,92,246,0.08)"          :"rgba(99,102,241,0.05)",
    suggHB:     D?"rgba(139,92,246,0.2)"           :"rgba(99,102,241,0.13)",
    fade:       D?"linear-gradient(to right,transparent,rgba(12,12,19,0.9))":"linear-gradient(to right,transparent,rgba(244,245,248,0.9))",
    iBg:        D?"rgba(255,255,255,0.05)"         :"#f9fafb",
    iBorder:    D?"rgba(255,255,255,0.12)"         :"rgba(0,0,0,0.12)",
    iColor:     D?"#f0f4ff"                        :"#0f172a",
    label:      D?"#b0bedd"                        :"#374151",
    acc:        D?"#a78bfa"                        :"#6366f1",
    submit:     D?"#7c3aed"                        :"#4f46e5",
    nBg:        D?"rgba(52,211,153,0.12)"          :"rgba(4,120,87,0.09)",
    nTx:        D?"#6ee7b7"                        :"#065f46",
    hlMark:     D?"rgba(167,139,250,0.25)"         :"rgba(99,102,241,0.15)",
    recentBg:   D?"rgba(255,255,255,0.03)"         :"rgba(0,0,0,0.02)",
    recentB:    D?"rgba(255,255,255,0.07)"         :"rgba(0,0,0,0.07)",
  };

  const iStyle = { width:"100%", padding:"0.52rem 0.8rem", background:t.iBg, border:`1px solid ${t.iBorder}`, borderRadius:9, color:t.iColor, fontSize:13.5, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
  const ctrlBtn = (active=false, extra={}) => ({
    display:"flex", alignItems:"center", gap:"0.3rem", padding:"0.28rem 0.62rem",
    borderRadius:7, border:`1px solid ${active ? t.tabAB : t.ctrlB}`,
    background: active ? t.tabABg : t.ctrl,
    color: active ? t.tabAC : t.tabC,
    fontSize:11.5, fontWeight:500, cursor:"pointer", whiteSpace:"nowrap", ...extra
  });

  const activeFilters = (active !== "all" ? 1 : 0) + (fw !== "all" ? 1 : 0) + (query ? 1 : 0);

  return (
    <div style={{ minHeight:"100vh", background:t.bg, color:t.title, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif", transition:"background 0.25s,color 0.25s", paddingBottom: floatVis ? "5.5rem" : "2rem" }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blob1   { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.15)} 66%{transform:translate(-40px,30px) scale(0.92)} }
        @keyframes blob2   { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,50px) scale(1.1)} 66%{transform:translate(50px,-30px) scale(0.95)} }
        @keyframes blob3   { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,60px) scale(0.9)} 66%{transform:translate(-50px,-40px) scale(1.12)} }
        ::-webkit-scrollbar { display:none }
        * { box-sizing:border-box }
        .lib-card { transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.14s, border-color 0.14s; }
        .lib-card:not([data-pinned]):hover { transform: translateY(-2px); }
        .lib-card[data-pinned] { transform: none !important; }
        .lib-card a:focus { outline: none; }
        .lib-card:focus-within:not([data-pinned]) { outline: 2px solid var(--focus-color, #a78bfa); outline-offset: 2px; }
        mark { background: transparent; }
        @media (max-width: 600px) {
          .header-inner { flex-direction: column !important; align-items: stretch !important; }
          .ctrl-row { justify-content: flex-start !important; flex-wrap: wrap !important; }
          .search-box { width: 100% !important; }
        }
      `}</style>

      {/* Aurora */}
      {D && (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:t.glow }} />
          <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.13) 0%,transparent 70%)", top:"-15%", left:"20%", animation:"blob1 18s ease-in-out infinite", willChange:"transform" }} />
          <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", top:"30%", right:"-10%", animation:"blob2 22s ease-in-out infinite", willChange:"transform" }} />
          <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(167,139,250,0.08) 0%,transparent 70%)", bottom:"5%", left:"10%", animation:"blob3 26s ease-in-out infinite", willChange:"transform" }} />
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header style={{ background:t.hBg, borderBottom:`1px solid ${t.hBorder}`, padding:"0 1.25rem", position:"sticky", top:0, zIndex:50, backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)" }}>
        <div style={{ maxWidth:860, margin:"0 auto", padding:"1rem 0 0.8rem" }}>

          {/* top row */}
          <div className="header-inner" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem" }}>
            <div style={{ minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", marginBottom:"0.2rem" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:t.acc, boxShadow:D?`0 0 8px ${t.acc}`:"none", flexShrink:0 }} />
                <span style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:t.eyebrow, fontWeight:600 }}>Free & Open Source</span>
              </div>
              <h1 style={{ fontSize:"clamp(1.15rem,4vw,1.75rem)", fontWeight:800, margin:0, letterSpacing:"-0.03em", lineHeight:1.1, ...(D?{background:t.h1,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:t.h1C}) }}>
                UI Component Libraries
              </h1>
              <p style={{ marginTop:"0.2rem", color:t.desc, fontSize:"0.75rem", lineHeight:1.5 }}>
                {LIBS.length} curated free resources — verified {VERIFIED_DATE}
              </p>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"0.3rem", alignItems:"flex-end", flexShrink:0 }}>
              {/* control buttons */}
              <div className="ctrl-row" style={{ display:"flex", gap:"0.25rem", flexWrap:"wrap", justifyContent:"flex-end" }}>
                <button onClick={() => setDark(d => !d)} style={ctrlBtn()}>
                  {D ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                     : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
                  {D?"Light":"Dark"}
                </button>
                <select value={sort} onChange={e => setSort(e.target.value)} style={{ ...ctrlBtn(), appearance:"none", paddingRight:"0.5rem" }}>
                  <option value="default">Default</option>
                  <option value="alpha">A → Z</option>
                  <option value="new">New first</option>
                </select>
                <button onClick={pickRandom} style={ctrlBtn()} title="Random library (highlights it in the list)">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                  Random
                </button>
                <button onClick={openAll} style={ctrlBtn()} title={`Open all ${filtered.length} results in new tabs (max 10)`}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Open all
                </button>
                {/* Share filtered view */}
                <button onClick={shareFilter} style={ctrlBtn(copiedShare)} title="Copy link to current filtered view">
                  {copiedShare
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
                  {copiedShare ? "Copied!" : "Share"}
                </button>
              </div>
              {/* search */}
              <div className="search-box" style={{ position:"relative", width:210 }}>
                <svg style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:t.sPh, pointerEvents:"none" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input ref={searchRef} type="text" placeholder="Search… ( press / )" value={query} onChange={e => { setQuery(e.target.value); setFocusIdx(-1); }}
                  style={{ width:"100%", padding:"0.38rem 1.75rem 0.38rem 1.85rem", background:t.sBg, border:`1px solid ${t.sBorder}`, borderRadius:7, color:t.sColor, fontSize:11.5, outline:"none", fontFamily:"inherit", transition:"border-color 0.15s" }}
                  onFocus={e => e.target.style.borderColor = t.acc}
                  onBlur={e => e.target.style.borderColor = t.sBorder}
                />
                {query && <button onClick={() => setQuery("")} style={{ position:"absolute", right:7, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:t.sPh, padding:2, fontSize:10, lineHeight:1 }}>✕</button>}
              </div>
            </div>
          </div>

          {/* ── Framework filter pills ── */}
          <div style={{ display:"flex", gap:"0.22rem", marginTop:"0.75rem", overflowX:"auto", scrollbarWidth:"none", paddingBottom:"1px" }}>
            {FRAMEWORKS.map(f => {
              const on = fw === f.id;
              return (
                <button key={f.id} onClick={() => { setFw(f.id); setFocusIdx(-1); }}
                  style={{ ...ctrlBtn(on), fontSize:10.5, padding:"0.2rem 0.55rem", borderRadius:999, flexShrink:0 }}>
                  {f.label}
                </button>
              );
            })}
            {/* active filter count + clear all */}
            {activeFilters > 0 && (
              <button onClick={() => { setQuery(""); setFw("all"); setActive("all"); }}
                style={{ fontSize:10.5, padding:"0.2rem 0.55rem", borderRadius:999, border:`1px solid rgba(239,68,68,0.3)`, background:"rgba(239,68,68,0.08)", color:"#f87171", cursor:"pointer", flexShrink:0, fontWeight:500 }}>
                ✕ Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
              </button>
            )}
          </div>

          {/* ── Category tabs ── */}
          <div style={{ position:"relative", marginTop:"0.5rem" }}>
            <div style={{ display:"flex", gap:"0.2rem", overflowX:"auto", paddingBottom:"2px", scrollbarWidth:"none" }}>
              {CATEGORIES.map(cat => {
                const on = active === cat.id;
                return (
                  <button key={cat.id} onClick={() => changeActive(cat.id)}
                    style={{ padding:"0.25rem 0.62rem", borderRadius:6, border:"none", cursor:"pointer", fontSize:10.5, fontWeight:500, transition:"background 0.15s,color 0.15s,box-shadow 0.15s,outline-color 0.15s", background:on?t.tabABg:t.tabBg, color:on?t.tabAC:t.tabC, outline:on?`1px solid ${t.tabAB}`:"1px solid transparent", whiteSpace:"nowrap", flexShrink:0, boxShadow:on?`0 2px 10px rgba(139,92,246,0.22)`:"none" }}>
                    {cat.label}
                    <span style={{ marginLeft:3, fontSize:9, opacity:0.5 }}>{counts[cat.id]||0}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ position:"absolute", right:0, top:0, bottom:0, width:28, background:t.fade, pointerEvents:"none" }} />
          </div>
        </div>
      </header>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <main style={{ maxWidth:860, margin:"0 auto", padding:"1rem 1.25rem 1.5rem", position:"relative", zIndex:1 }}>

        {/* ── Recently viewed ── */}
        {recent.length > 0 && !query && active === "all" && fw === "all" && (
          <div style={{ marginBottom:"1.25rem", padding:"0.75rem 1rem", background:t.recentBg, border:`1px solid ${t.recentB}`, borderRadius:12 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.5rem" }}>
              <span style={{ fontSize:10.5, fontWeight:600, color:t.eyebrow, letterSpacing:"0.08em", textTransform:"uppercase" }}>Recently Visited</span>
              <button onClick={() => { localStorage.removeItem("uidir-recent"); setRecent([]); }} style={{ fontSize:10, color:t.foot, background:"none", border:"none", cursor:"pointer" }}>Clear</button>
            </div>
            <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
              {recent.map(r => (
                <a key={r.id} href={`https://${r.url}`} target="_blank" rel="noopener noreferrer" onClick={() => handleVisit(r)}
                  style={{ fontSize:11, padding:"0.2rem 0.6rem", borderRadius:6, background:t.ctrl, border:`1px solid ${t.ctrlB}`, color:t.desc, textDecoration:"none", display:"flex", alignItems:"center", gap:"0.3rem" }}>
                  {r.name}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {filtered.length === 0 ? (
          <EmptyState query={query || fw} onClear={() => { setQuery(""); setFw("all"); setActive("all"); }} color={t.foot} />
        ) : (
          <div ref={listRef} key={`${active}-${sort}-${fw}`} style={{ display:"flex", flexDirection:"column", gap:"0.4rem", animation:"fadeIn 0.18s ease" }}>
            {/* result count when filters active */}
            {activeFilters > 0 && (
              <div style={{ fontSize:11, color:t.foot, marginBottom:"0.15rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
                {filtered.length > 1 && (
                  <button onClick={openAll} style={{ fontSize:10.5, color:t.acc, background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>
                    Open all in new tabs {filtered.length > 10 ? "(first 10)" : ""}
                  </button>
                )}
              </div>
            )}

            {filtered.map((lib, idx) => {
              const m      = CAT_META[lib.cat] || CAT_META["dev-tools"];
              const bg     = D ? m.dBg  : m.lBg;
              const tx     = D ? m.dTx  : m.lTx;
              const dot    = D ? m.dDot : m.lDot;
              const isRand = randomId === lib.id;
              const isCopy = copiedId === lib.id;
              const isNew  = NEW_IDS.has(lib.id);
              const stacks = LIB_STACKS[lib.id] || [];

              return (
                <div key={lib.id} id={`lib-${lib.id}`} className="lib-card"
                  data-pinned={isRand ? "" : undefined}
                  style={{
                    display:"flex", alignItems:"center", gap:"0.65rem",
                    padding:"0.8rem 0.9rem",
                    background: isRand ? t.hlBg : t.card,
                    border: `1px solid ${isRand ? t.hlBorder : t.cBorder}`,
                    borderRadius:11,
                    boxShadow: isRand
                      ? `0 0 0 2px ${t.hlBorder}, 0 8px 32px rgba(139,92,246,0.18)`
                      : "0 1px 3px rgba(0,0,0,0.07)",
                    "--focus-color": t.cFocus,
                  }}
                  onMouseEnter={e => { if(!isRand){ e.currentTarget.style.background=t.cHover; e.currentTarget.style.borderColor=t.cHBorder; e.currentTarget.style.boxShadow=`0 6px 24px rgba(0,0,0,0.18), 0 0 0 1px ${t.cHBorder}`; }}}
                  onMouseLeave={e => { if(!isRand){ e.currentTarget.style.background=t.card; e.currentTarget.style.borderColor=t.cBorder; e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.07)"; }}}
                >
                  <span style={{ width:7, height:7, borderRadius:"50%", background:dot, flexShrink:0, boxShadow:isRand?`0 0 10px ${dot}`:"none", marginTop:1 }} />

                  <a href={`https://${lib.url}`} target="_blank" rel="noopener noreferrer"
                    data-card="true"
                    tabIndex={0}
                    onClick={() => handleVisit(lib)}
                    style={{ flex:1, minWidth:0, textDecoration:"none", outline:"none" }}
                  >
                    {/* name row */}
                    <div style={{ display:"flex", alignItems:"center", gap:"0.3rem", flexWrap:"wrap", marginBottom:"0.15rem" }}>
                      <span style={{ fontSize:"0.88rem", fontWeight:700, color:t.title, letterSpacing:"-0.015em" }}>
                        <Highlight text={lib.name} query={query} color={t.hlMark} />
                      </span>
                      <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"0.09rem 0.4rem", borderRadius:4, background:bg, color:tx }}>{m.label}</span>
                      {isNew && <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", padding:"0.09rem 0.4rem", borderRadius:4, background:t.nBg, color:t.nTx }}>New</span>}
                      {stacks.map(s => (
                        <span key={s} onClick={e => { e.preventDefault(); e.stopPropagation(); setFw(f => f === s ? "all" : s); }}
                          style={{ fontSize:9, fontWeight:500, padding:"0.07rem 0.35rem", borderRadius:4, background: fw === s ? t.tabABg : t.stBg, color: fw === s ? t.tabAC : t.stTx, border:`1px solid ${fw === s ? t.tabAB : t.div}`, cursor:"pointer" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    {/* description with highlight */}
                    <div style={{ fontSize:12.5, color:t.desc, lineHeight:1.6 }}>
                      <Highlight text={lib.desc} query={query} color={t.hlMark} />
                    </div>
                    {/* url + verified */}
                    <div style={{ marginTop:"0.18rem", fontSize:10, color:t.url, fontFamily:"'SF Mono','Fira Code',monospace", display:"flex", alignItems:"center", gap:"0.35rem", flexWrap:"wrap" }}>
                      <span>{lib.url}</span>
                      <span style={{ color:t.div }}>·</span>
                      <span style={{ color:t.foot }}>Verified {VERIFIED_DATE}</span>
                    </div>
                  </a>

                  {/* copy + arrow */}
                  <div style={{ display:"flex", alignItems:"center", gap:"0.28rem", flexShrink:0 }}>
                    <button onClick={e => copyUrl(lib.url, lib.id, e)} title="Copy URL"
                      style={{ display:"flex", alignItems:"center", justifyContent:"center", width:24, height:24, borderRadius:6, border:`1px solid ${t.div}`, background:isCopy?t.nBg:t.copyBg, cursor:"pointer", color:isCopy?t.nTx:t.url, transition:"all 0.15s" }}>
                      {isCopy
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                    </button>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.arrow} strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SUGGESTION BOX ──────────────────────────────── */}
        <div style={{ marginTop:"1.5rem", borderRadius:13, border:`1px solid ${t.suggB}`, background:t.suggBg, overflow:"hidden" }}>
          <button onClick={() => setSuggOpen(o => !o)}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem", padding:"0.8rem 1rem", background:t.suggHBg, border:"none", borderBottom:suggOpen?`1px solid ${t.suggHB}`:"1px solid transparent", cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <span style={{ fontSize:13 }}>💡</span>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:12, fontWeight:650, color:t.title }}>Know a useful open-source resource?</div>
                <div style={{ fontSize:10.5, color:t.desc, marginTop:1 }}>Send us a suggestion — we review and add the best ones.</div>
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
                  <div style={{ fontSize:11, marginTop:3, color:t.desc }}>Thank you!</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.label, marginBottom:"0.22rem" }}>Your name <span style={{ opacity:0.5, fontWeight:400 }}>(optional)</span></label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" style={iStyle} onFocus={e=>e.target.style.borderColor=t.acc} onBlur={e=>e.target.style.borderColor=t.iBorder} />
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.label, marginBottom:"0.22rem" }}>Website name <span style={{ color:"#ef4444" }}>*</span></label>
                      <input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="e.g. ShadcnBlocks" style={iStyle} onFocus={e=>e.target.style.borderColor=t.acc} onBlur={e=>e.target.style.borderColor=t.iBorder} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.label, marginBottom:"0.22rem" }}>Website URL <span style={{ color:"#ef4444" }}>*</span></label>
                    <input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} placeholder="e.g. shadcnblocks.com" style={iStyle} onFocus={e=>e.target.style.borderColor=t.acc} onBlur={e=>e.target.style.borderColor=t.iBorder} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.label, marginBottom:"0.22rem" }}>Why should it be listed? <span style={{ opacity:0.5, fontWeight:400 }}>(optional)</span></label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Briefly describe what makes it useful…" rows={3}
                      style={{ ...iStyle, resize:"vertical", minHeight:60, lineHeight:1.55 }}
                      onFocus={e=>e.target.style.borderColor=t.acc} onBlur={e=>e.target.style.borderColor=t.iBorder} />
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.4rem" }}>
                    <p style={{ margin:0, fontSize:10.5, color:t.desc }}>Opens your default email app with details pre-filled.</p>
                    <button onClick={handleSuggest} disabled={!siteName.trim()||!siteUrl.trim()}
                      style={{ display:"flex", alignItems:"center", gap:"0.3rem", padding:"0.42rem 0.85rem", borderRadius:7, border:"none", background:(!siteName.trim()||!siteUrl.trim())?"rgba(139,92,246,0.18)":t.submit, color:(!siteName.trim()||!siteUrl.trim())?t.acc:"#fff", fontSize:12, fontWeight:600, cursor:(!siteName.trim()||!siteUrl.trim())?"not-allowed":"pointer", opacity:(!siteName.trim()||!siteUrl.trim())?0.6:1 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      Send suggestion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <div style={{ marginTop:"1.1rem", paddingTop:"1rem", borderTop:`1px solid ${t.div}`, display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"0.5rem" }}>
          <div>
            <p style={{ margin:"0 0 0.18rem", fontSize:11.5, fontWeight:600, color:t.desc }}>UI Component Libraries Directory</p>
            <p style={{ margin:0, fontSize:10.5, color:t.foot, lineHeight:1.6, maxWidth:420 }}>
              Community-maintained list of free, open-source UI resources. All links hand-verified — {VERIFIED_DATE}.
            </p>
          </div>
          <span style={{ fontSize:10.5, color:t.foot }}>{filtered.length} of {LIBS.length} shown</span>
        </div>
      </main>

      {/* ── FLOATING BUTTONS ─────────────────────────────── */}
      {showTop && (
        <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} title="Back to top"
          style={{ position:"fixed", bottom:"5.25rem", right:"1.25rem", zIndex:100, width:36, height:36, borderRadius:"50%", border:`1px solid ${t.ctrlB}`, background:t.ctrl, color:t.tabC, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.2)", backdropFilter:"blur(8px)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
        </button>
      )}
      {floatVis && (
        <button onClick={() => { setSuggOpen(true); setTimeout(() => window.scrollTo({ top:document.body.scrollHeight, behavior:"smooth" }), 80); }}
          style={{ position:"fixed", bottom:"1.25rem", right:"1.25rem", zIndex:100, display:"flex", alignItems:"center", gap:"0.35rem", padding:"0.5rem 0.85rem", borderRadius:999, border:"none", background:t.float, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", boxShadow:"0 4px 18px rgba(139,92,246,0.4)", backdropFilter:"blur(8px)", transition:"transform 0.18s ease,box-shadow 0.18s ease" }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px) scale(1.04)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(139,92,246,0.55)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 18px rgba(139,92,246,0.4)"; }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Suggest
        </button>
      )}
    </div>
  );
}
