# UI Libraries — Free & Open Source Directory

> A hand-picked, verified directory of 105 free and open-source UI component libraries — animated kits, shadcn extensions, Tailwind blocks, headless primitives, design tools, and more.

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**[🚀 Live Site](https://components-lib-web-theta.vercel.app)**

---

## ✨ Features

- **105 curated resources** across 12 categories — animated, shadcn, Tailwind, React, Vue/Svelte, Angular, headless, CSS, collections, design tools, and dev tools
- **Live search** — instant filtering with query highlight, debounced at 150ms, `/` shortcut to focus
- **Category filter drawer** — slides up from bottom, badge count per category, shareable URL state
- **Recently visited** — last 5 opened libraries saved to localStorage with one-click clear
- **Copy URL** — copy any library link to clipboard with visual confirmation
- **Shareable filters** — category + search query encoded in URL params, share button copies current view
- **Suggest a resource** — inline form opens your email client with details pre-filled
- **Back to top** — appears after 500px scroll
- **Keyboard shortcuts** — `/` to search, `Escape` to clear / close
- **Zero dependencies** — no UI framework, no animation library, pure React + CSS

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Pure CSS (CSS custom properties, no Tailwind) |
| Fonts | DM Serif Display + DM Sans (Google Fonts) |
| Deployment | Vercel |

---

## 📁 Project Structure

```
WebUI-Libraries/
├── index.html          # Font imports, meta tags, Open Graph
├── vite.config.js      # Vite config
├── package.json
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── main.jsx        # React root
    └── App.jsx         # Entire app — data, components, styles
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/sugumaran-nix/WebUI-Libraries.git
cd WebUI-Libraries
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for production

```bash
npm run build
```

Output in `/dist` — 186KB bundle, 58KB gzip.

---

## ➕ Adding a Library

All library data lives in the `LIBS` array inside `src/App.jsx`. Each entry follows this shape:

```js
{
  id:   106,                          // unique number
  name: "Library Name",
  url:  "libraryname.com",            // no https://, no trailing slash
  cat:  "animated",                   // see CATEGORIES for valid ids
  desc: "One sentence description.",
  added:"2026-03",                    // YYYY-MM
}
```

Valid categories: `animated` · `shadcn` · `tailwind` · `react` · `vue-svelte` · `angular` · `headless` · `css` · `collections` · `design-tools` · `dev-tools`

Optionally add stack tags in `LIB_STACKS`:

```js
const LIB_STACKS = {
  106: ["React", "Tailwind"],
  ...
};
```

---

## 🌐 Deployment

Deployed on **Vercel** — auto-deploys on every push to `main`. No environment variables required.

---

## 📄 License

MIT
