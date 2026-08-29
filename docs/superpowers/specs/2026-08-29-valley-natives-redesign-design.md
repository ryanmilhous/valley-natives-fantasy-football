# Valley Natives Visual/UX Redesign Spec

**Date:** 2026-08-29  
**Project:** `natives-fantasy-football`  
**Theme:** *San Lorenzo Valley redwood culture meets retro sports almanac*  
**Scope Type:** Visual/UX redesign (not a data/model rebuild)

---

## 1. Objective

Redesign the Valley Natives league history site so it feels deeply tied to the San Lorenzo Valley (Boulder Creek, Ben Lomond, Brookdale, Felton, Highway 9, San Lorenzo River, redwoods) while staying stylish, modern, distinctive, and fun.

The experience should feel like an official historical archive for a long-running fantasy football league among lifelong friends.

Primary priority pages after global system work:
1. Home
2. Records
3. Seasons

---

## 2. Non-Negotiable Preservation Contract

This is a visual-system overlay. Existing functionality must remain intact.

Must preserve:
1. Existing routes/URLs:
   - `/`
   - `/records`
   - `/seasons`
   - `/draft`
   - `/trades`
   - `/head-to-head`
   - `/rosters`
   - `/teams`
   - `/wrapped/:ownerName`
2. Existing data source architecture (`frontend/src/services/api.js`) using static JSON files.
3. Existing calculations, standings logic, rankings, filter/sort behavior, and record computations.
4. Existing league data, schemas, historical records, and data models.
5. Existing navigation destinations and major page-level user flows.

Design changes should be incremental and behavior-safe. If a visual change conflicts with functionality, preserve functionality and choose another visual approach.

---

## 3. Current Architecture Audit (Baseline)

### Frontend shell and routing
- **Framework:** React + Vite + Tailwind
- **Router:** `react-router-dom`
- **Root shell:** `frontend/src/App.jsx` (navigation, routes, footer)

### Data access pattern
- **Single access layer:** `frontend/src/services/api.js`
- Static JSON fetches via `/data/*.json`
- Pages consume data through `apiService` methods

### Existing key pages and interactions
- **Home:** all-time standings, ranking methodology, trophy sections, sortable columns, tooltip interactions.
- **Records:** championship leaders, scoring records, season records, blowouts.
- **Seasons:** season selector, standings table, owner performance chart, playoff/championship context.
- **Draft:** year/position/owner filtering, sorting, auction vs snake logic, value pick side panels.
- **Trades:** year/owner filtering, trade cards, lopsided and keeper-flip summaries.
- **Head-to-Head:** owner selectors, matchup summary, full matrix.
- **Rosters:** year/owner filters, roster cards with position badges.
- **Teams:** owner profile with charts and season history table.
- **Owner Wrapped:** owner-specific route and long-form infographic-style component composition.

### Constraint from current state
- Working app includes uncommitted feature edits in progress. Redesign must avoid destructive conflicts and should keep changes scoped to visuals/systemization.

---

## 4. Experience Concept

**Narrative frame:** entering the Valley Natives Hall of Records in the redwoods.

Design tone:
- Serious about league history (archival, prestigious, stat-forward)
- Slightly self-important in a playful way
- Nostalgic but not old
- Local and specific without becoming kitschy

The site remains fantasy-football-first. Valley identity supplies atmosphere and brand language.

---

## 5. Visual System

### 5.1 Color tokens

Base and surfaces:
- `--vn-bg-900`: near-black evergreen (`#0A1310`)
- `--vn-bg-800`: deep forest (`#10221B`)
- `--vn-surface-700`: moss slate (`#183127`)
- `--vn-redwood-600`: bark brown (`#4A2F24`)

Text:
- `--vn-text-primary`: warm cream (`#EFE6D2`)
- `--vn-text-secondary`: muted parchment (`#CFC4AA`)

Accents:
- `--vn-gold-500`: muted gold (`#C8A55A`) for championships/legacy
- `--vn-teal-500`: electric teal (`#23B8B0`) for active and key metrics
- `--vn-coral-500`: sunset coral (`#FF6F61`) for competitive emphasis
- `--vn-rose-500`: dusk pink (`#E07AAE`) for secondary highlight moments
- `--vn-orange-500`: restrained warm orange (`#D98245`) for selective emphasis

Usage rule: bright accents are sparse and intentional (important stats, active states, links, chart focus, championships), not full-surface neon fills.

### 5.2 Typography

- **Display family:** curated web font with vintage California athletic/signage personality.
- **Body/data family:** highly readable sans optimized for dense statistical UI.
- **Numeric treatment:** clear tabular-friendly rhythm for standings/records comparison.

### 5.3 Texture and atmosphere

Subtle only:
- faint grain
- low-contrast redwood silhouette layers
- minimal topographic/tree-ring hints in section backgrounds

No heavy overlays that degrade readability or scan speed.

### 5.4 Motion

- restrained hover/focus transitions
- lightweight reveal effects for prestige moments (championship artifacts)
- full reduced-motion support for non-essential effects

---

## 6. Valley Natives Brand Identity System

### Primary mark (Phase 1 implementation)
- Build a **typographic wordmark** (“VALLEY NATIVES”) in code (no external artwork dependency).
- Direction: vintage athletic club + mountain-town signage.

### Secondary mark
- Introduce a reusable **VN monogram** for badges, nav stamp, and championship artifacts.

### Motifs (subtle)
- redwood silhouettes
- tree-ring circles
- mountain/river contour cues
- football insignia language

No overcomplicated logo construction.

---

## 7. Reusable UI Architecture (Styling Primitives)

Add shared primitives with minimal logic impact:

1. `BrandShell`  
   Global atmospheric background, spacing rhythm, and width behavior.

2. `PageHero`  
   Reusable hero/header pattern with title, subtitle, and section identity.

3. `Panel`  
   Consistent archival card/surface wrapper for content blocks.

4. `StatBadge`  
   Unified status chips (champion/top/neutral/warning/rivalry).

5. `DataTableShell`  
   Shared table shell with sticky header support, compact rows, responsive overflow behavior.

6. `FilterBar`  
   Unified select/filter controls for pages with selectors.

7. `BrandWordmark` + `VNMonogram`  
   Identity layer reused in nav, hero, and championship contexts.

These components are visual scaffolding; existing data and interaction logic remains where it is.

---

## 8. Page Design Direction

## 8.1 Home (Priority 1)
- Position as “Hall of Records” landing experience.
- Hero: atmospheric redwood/valley framing, clear league identity, limited vertical height.
- Keep all-time standings table as centerpiece with improved scan hierarchy and sticky affordances.
- Elevate championship/trophy storytelling with archival prestige visuals.

## 8.2 Records (Priority 2)
- Present records like a permanent record book.
- Strengthen hierarchy among championship leaders, scoring records, and blowouts.
- Improve table/list readability at desktop and mobile.

## 8.3 Seasons (Priority 3)
- Emphasize season timeline clarity and seasonal navigation.
- Preserve existing chart and standings logic while improving contrast, spacing, and result legibility.
- Integrate championship history section into common visual language.

---

## 9. Navigation + Information Architecture

Goals:
1. Keep existing destinations intact.
2. Improve discoverability and persistent orientation.
3. Make mobile navigation dramatically easier.

Phase 1 nav updates:
- stronger branded top nav shell
- clear active state and hierarchy
- cleaner mobile menu interaction and tap targets

No route/path changes.

---

## 10. Data Table and Stats Readability Requirements

Non-negotiable:
1. Maintain excellent contrast and number legibility.
2. Keep compact-but-readable row density.
3. Keep sorting/filter affordances obvious.
4. Use non-color indicators where necessary.
5. On mobile, transform table presentation intelligently (not just shrinking text).

---

## 11. Accessibility + Performance

Accessibility:
- keyboard-visible focus states
- sufficient contrast on all text/stat elements
- reduced-motion support
- avoid color-only semantic communication

Performance:
- avoid heavy dependencies
- prefer CSS-native effects over large media payloads
- preserve existing data-fetch/render behavior

---

## 12. Phased Implementation Plan

### Phase 1: Global design system foundation
1. Tokenize colors/typography/surfaces in `index.css`.
2. Redesign `App.jsx` shell (background, nav, footer, spacing rhythm).
3. Introduce shared visual primitives (hero/panel/table/filter/badges/wordmark).

### Phase 2: Priority page redesign
1. Home
2. Records
3. Seasons

### Phase 3: System rollout to remaining pages
- Draft, Trades, Head-to-Head, Rosters, Teams, Owner Wrapped

Each phase is incremental and should keep the app functional throughout.

---

## 13. Validation and Risk Controls

Primary risks:
1. Visual refactors accidentally affecting interaction logic.
2. Table-heavy views regressing on small screens.
3. Over-theming reducing readability.

Controls:
1. Keep logic and data code untouched unless absolutely required.
2. Apply styling in layers (shell -> shared primitives -> page-level restyles).
3. Validate core flows page-by-page after each major visual pass.

---

## 14. Out of Scope

- Data model/schema changes
- Historical record edits
- Backend API redesign
- Route/path restructuring
- Fabricating league lore/statistics not in existing data

---

## 15. Success Criteria

The redesign succeeds if:
1. A screenshot is recognizable as Valley Natives (not generic fantasy app/SaaS/outdoors template).
2. Home/Records/Seasons feel like a cohesive redwood-era league archive.
3. Existing functionality and data integrity remain intact.
4. Desktop and mobile are both clear, fast, and usable for stat-heavy browsing.
5. Championships feel prestigious; records feel permanent; rivalries feel alive.
