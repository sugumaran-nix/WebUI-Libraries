# UI / FOLIO directory redesign specification

## Protected scope

The existing landing page remains the visual baseline. Its hero composition, marquee, typography, background treatment, and primary call-to-action are not redesigned in this pass. Only the directory experience and its supporting interactions change.

## Design concept: Precision Catalog

The directory will feel like a premium technical catalog: quiet light surfaces, a graphite navigation bar, one strong blue action color, hairline dividers, compact utility controls, and large landscape previews. This takes the discipline of automotive product configuration without copying a vehicle website. The system should communicate that each resource has been inspected, categorized, and is ready to evaluate.

## Information architecture

1. Header: brand lockup, route navigation, theme control, and resource-submission action. On mobile, a 44 px menu trigger opens a full-width, keyboard-safe menu.
2. Directory masthead: eyebrow, clear title, explanation, resource count, and primary search field.
3. Filter workspace: desktop filter rail with Category, Technology, and Sort controls; mobile filter button opens a full-width sheet/panel with Apply and Reset actions.
4. Result bar: current result count, active-filter chips, and grid/list preference.
5. Resource cards: landscape preview first, status/fallback treatment, copy-address action, category, title, description, technologies, and explicit Visit website action.
6. Secondary content: recently viewed resources and a calm suggestion panel with explicit form labels and success feedback.

## Responsive behavior

Phone layouts use a single column, full-width controls, a modal-like filter sheet, and 44 px minimum touch targets. Tablet layouts use two columns where content permits and retain a visible filter toolbar. Desktop layouts use a two-column shell with a fixed-width filter rail and an auto-fit card grid. No controls depend on hover, horizontal clipping, or precise pointer positioning.

## Color and typography

The directory uses white and warm-gray surfaces, graphite text, a single BMW-inspired blue action color, muted slate metadata, and restrained category markers. Preview images remain neutral and are never used as a text background. Typography uses a readable sans-serif for interface copy and the existing display treatment only where it improves hierarchy.

## State and accessibility rules

Search updates results immediately and preserves the query in the URL. Filter state is reflected in live result feedback and removable chips. Menus close on selection and Escape, retain focus-visible outlines, and use actual buttons or links. Preview failures explain the failure and provide a direct Visit website action. Empty results provide a clear reset path.


## Final separation check

At 375 px, the landing route shows the original UI / FOLIO marquee, UI / FOLIO wordmark, FIND BETTER / BUILD FASTER message, supporting copy, and Browse the directory CTA. The `/directory` route shows a distinct resource-directory masthead, search input, filter rail, and catalog results. The mobile menu trigger is rendered only on the browsing route, so it does not alter the landing page’s original header appearance.


## Marquee and density correction

The landing marquee was changed from square 1:1 tiles to explicit `16/10` desktop preview frames. The track now aligns items at the start and uses auto height so flexbox cannot stretch the tiles vertically. On phones, each tile uses a wide `clamp(210px,72vw,280px)` width; on larger screens it scales between 190 px and 320 px. The landing headline and content hierarchy remain unchanged. Directory spacing, card gaps, masthead padding, and search height were reduced to make the browsing experience more compact without shrinking touch targets.
