<p align="center">
  <img src="https://img.shields.io/badge/DESIGN%20GARAGE-FFD400?style=for-the-badge&labelColor=050505&color=FFD400" alt="Design Garage" />
  <img src="https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite%205-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/License-MIT-0047D4?style=for-the-badge" alt="MIT License" />
</p>

# Design Garage

> **A high-signal workshop for interface resources.**
>
> Discover the libraries, systems, tools, patterns, and references that help good frontend work move from idea to shipped interface.

<p align="center">
  <a href="https://components-lib-web-theta.vercel.app"><strong>Open the live garage →</strong></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://github.com/sugumaran-nix/WebUI-Libraries">View the source</a>
</p>

---

## The short version

Design Garage is a focused, independently maintained directory for designers and frontend developers. It turns a scattered search across component libraries, design systems, inspiration galleries, visual tools, and production resources into one readable browsing experience.

The product has two intentional surfaces:

| Surface | Purpose |
|---|---|
| `/` | The protected landing experience: a kinetic marquee that introduces the garage and its point of view. |
| `/directory` | The working catalog: search, filter, compare, copy, revisit, and open resources directly. |

The landing page sets the tone. The directory does the work.

## What is inside the garage?

The catalog spans the practical territory around interface production: React and Vue ecosystems, Tailwind and shadcn resources, animated UI, CSS and HTML experiments, headless primitives, design tools, icons, illustrations, typography, color, mockups, templates, email references, stock assets, collections, and developer tools.

The aim is not to collect everything. It is to make the useful things easier to find, compare, and return to.

## Designed like a workshop

Design Garage uses a deliberate **Pac-Man-inspired Neubrutalist system** rather than a generic dashboard treatment.

| Principle | Expression in the interface |
|---|---|
| **High signal** | Strong yellow, blue, cyan, and black surfaces create a clear visual hierarchy. |
| **Tactile controls** | Visible ink borders, offset shadows, compact press states, and slightly rounded 8px corners. |
| **Readable contrast** | Black text on yellow states, bright text on dark surfaces, and blue accents tuned for both themes. |
| **Editorial rhythm** | Label blocks, framed previews, short descriptions, metadata rows, and compact actions. |
| **Responsive by default** | Mobile Grid and List views are meaningfully different, with no forced desktop canvas on small screens. |
| **Quiet motion** | Hover lift and preview scaling are restrained; touch devices avoid hover-only movement. |

> The visual language is intentionally loud. The information architecture stays quiet.

## Directory capabilities

The browsing page is built around the actions that matter most when evaluating a resource:

- **Live search** across names, descriptions, and technology metadata.
- **Focused filters** for category, technology, and useful ordering options.
- **Grid and List views** for visual scanning or denser evaluation.
- **Direct source links** from preview images and resource titles.
- **Copy Address** for quickly saving a resource URL.
- **Recently visited** links stored locally for fast return visits.
- **Suggest a resource** form for improving the catalog from inside the product.
- **Persistent theme preference** with stable light and dark color roles.
- **Shareable URL state** so filtered directory views can be revisited and shared.

## Quality bar

The interface is designed and checked as a product, not just as a static collection of cards. The current release has been exercised across mobile and desktop layouts, light and dark themes, keyboard focus states, card actions, filters, search, copy feedback, and route refresh behavior.

The protected marquee landing composition is kept separate from the browsing experience so the working catalog can evolve without disturbing the original front door.

## Technology

| Layer | Choice |
|---|---|
| UI | React 18 |
| Build | Vite 5 |
| Language | JavaScript and JSX |
| Styling | Inline CSS template literal in `src/App.jsx` |
| Typography | DM Serif Display and DM Sans |
| Data | Static catalog and taxonomy in `src/data.js` |
| Deployment | Vercel-compatible SPA with `/directory` fallback |

There is no Tailwind layer and no component-library dependency in the product UI. The interface is intentionally authored from a small set of local React primitives and a shared visual vocabulary.

## Run it locally

```bash
git clone https://github.com/sugumaran-nix/WebUI-Libraries.git
cd WebUI-Libraries
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

To test the production artifact locally:

```bash
npm run build
npm run preview
```

## Project map

```text
WebUI-Libraries/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── DirectoryView.jsx   # Search, filters, results, recent links, suggestion form
│   │   ├── FilterPanel.jsx      # Category, technology, order, and recent controls
│   │   ├── Icon.jsx             # Shared inline SVG icon registry
│   │   └── ResourceCard.jsx     # Preview, metadata, copy, and resource links
│   ├── App.jsx                  # Routes, theme state, shared styles, and landing shell
│   ├── data.js                  # Catalog data, taxonomy, counts, and sort options
│   └── main.jsx                 # React entry point
├── index.html                   # Metadata, fonts, canonical URL, and social cards
├── vercel.json                  # SPA fallback for direct `/directory` refreshes
├── package.json
└── vite.config.js
```

## Updating the catalog

The catalog is intentionally simple to maintain. Add or edit resource records in `src/data.js`, keep category and technology identifiers aligned with the existing taxonomy, and run a production build before opening a pull request.

For a visual contribution, use the live **Suggest** flow first. For code, taxonomy, copy, or accessibility changes, open a focused pull request with a short explanation of the user problem being solved.

## Deployment

The project is a Vite SPA and is ready for Vercel-style deployment:

```bash
npm install
npm run build
```

The included `vercel.json` rewrites `/directory` and its nested paths to `index.html`, preventing a refresh from falling into a server-side 404.

## Design decisions worth preserving

The landing marquee is a protected baseline. Changes to the directory should not reshape the landing composition, card rhythm, or marquee behavior unless that protection is explicitly lifted.

The browsing page should remain compact and direct. New controls should replace an existing ambiguity rather than add another layer of navigation. New colors should maintain the established black-on-yellow and bright-on-dark contrast roles. New motion should respect reduced-motion preferences and should never be required to understand or operate the catalog.

## License

Released under the MIT License.

---

<p align="center"><strong>Make the next interface easier to find.</strong></p>
<p align="center"><a href="https://components-lib-web-theta.vercel.app">Enter Design Garage →</a></p>
