# UI / FOLIO directory redesign research

## Design direction

The landing page is a protected visual baseline and must not be redesigned. The non-landing experience will use a calm editorial resource-catalog approach: a clear page title, one primary search field, a compact responsive filter system, explicit active-filter chips, neutral preview cards, and strong information hierarchy. The visual language should feel like a premium product catalog rather than a dashboard: precise typography, restrained borders, clear states, and deliberate blue action emphasis.

## Research findings

### Eleken — Filter UI examples for SaaS
Source: https://www.eleken.co/blog-posts/filter-ux-and-ui-for-saas

The article emphasizes the golden rule that users should only be offered filters for data actually displayed on screen. It also warns that multi-select logic must be explicit because users can otherwise produce confusing or empty results. The redesign will keep filter dimensions aligned with card metadata: category, technology, sort, and recent visits. It will show active selections close to the result count and provide a visible reset action.

### Pencil & Paper — Filter UX design patterns
Source: https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering

The article distinguishes live filtering from per-filter and batch filtering. For this small static catalog, live filtering is appropriate: selecting a category or technology should update results immediately. It recommends dropdown menus for top bars, expandable sections for sidebars, additive chips for active filters, search within large filter lists, and easily accessible Clear All behavior. On mobile, filters should be presented as a reachable drawer or full-width sheet rather than clipped horizontal controls. The redesign will use a mobile filter sheet with Apply and Reset actions, while desktop receives a persistent filter rail and a compact toolbar.

### Mobbin — mobile and web UI inspiration
Source: https://mobbin.com/

Mobbin is a relevant reference for browsing real product screens. Its useful pattern for this project is context-first browsing: a strong search/discovery entry point, category-oriented navigation, and dense but readable preview content. The redesign should prioritize the preview and resource identity before secondary metadata.

### Design Systems Repo — design system resources
Source: https://designsystemsrepo.com/design-systems/

A catalog-style resource site should make each item scannable as a reference entry: clear name, category, short description, technology labels, and direct visit action. The redesign will keep these fields visually separated and avoid turning every card into a decorative marketing tile.

## Implementation decisions

1. Preserve the current landing page component and its styles unchanged except for the already-required routing and functional fixes.
2. Rebuild the directory as a separate information architecture: mobile-safe header, clear search, responsive filter sheet/rail, compact result summary, and a consistent card grid.
3. Use immediate filtering for the static resource catalog, with active filter chips and a reset-all action.
4. Make every interactive control keyboard reachable, visibly focused, and at least 44 px on touch screens.
5. Keep preview images neutral and stable with a fixed landscape aspect ratio, lazy loading, skeleton/error fallback, and an explicit Visit website action.
6. Use short, literal labels rather than decorative or ambiguous terminology.
7. Verify direct `/directory` loads, filter selection, search, reset, mobile menu, keyboard Escape, and phone/tablet/desktop screenshots before pushing.


### Page Flows — inspiration-library discovery
Source: https://pageflows.com/

Page Flows puts global content types and platforms near the top of the experience, including iOS, Android, Web, and Emails, with a prominent search field whose placeholder explains exactly what can be searched. This supports a directory header that combines explicit search with simple scope/category choices rather than hiding discovery behind decorative navigation.

### Design Systems Repo — catalog presentation
Source: https://designsystemsrepo.com/design-systems/

The live catalog uses a straightforward top navigation, a descriptive page title, a short explanatory sentence, simple sorting controls such as A–Z and Most Recent, and two-column resource entries with organization, title, and description. This reinforces a clean reference-library model: utility first, editorial hierarchy second, and decorative treatment kept behind the content.

## Research synthesis

The new directory will combine Page Flows’ explicit search and content scopes, Design Systems Repo’s catalog clarity, and the filter guidance from Eleken and Pencil & Paper. The result will not imitate any single site. It will be an original, light-first “vehicle specification / design reference” interface: compact utility header, prominent search, filter rail on desktop, bottom-sheet-style filter panel on mobile, landscape preview cards, explicit resource metadata, and trustworthy states for loading, failure, empty results, and recently viewed items.


## First implementation review

The new directory now presents a large, readable masthead with a clear search field, a dedicated refine rail, a catalog result heading, and a neutral card grid. The phone capture shows a single-column full-width structure with the search field and filter controls stacked for touch access. The desktop capture shows the intended asymmetric catalog shell with a 278 px filter rail and a two-column preview grid. The protected landing page still uses its existing `VengeanceLanding` render path and the new directory classes are namespaced under `directory-*` to avoid changing the landing layout.


## Visual regression

The overhauled directory renders as a single-column, touch-first catalog at 375 px and as an asymmetric filter-rail plus two-column preview grid at 1440 px. Search, result count, filter controls, and card identity are visible in the first usable region of the page. The protected landing capture retains its original hero, marquee, headline, and primary CTA structure; only the shared mobile header menu affordance remains available so navigation is usable on small screens.


## Interaction validation

The updated directory DOM contains the new search input, three filter controls, reset action, recent action, grid/list toggle, explicit card links, and visit actions. A single simulated mobile-breakpoint interaction opened the navigation drawer with Directory, Inspiration, Libraries, and GitHub links. The Category control then opened a populated menu containing 24 category options. This confirms the state wiring for the previously reported mobile navigation and filter failures.
