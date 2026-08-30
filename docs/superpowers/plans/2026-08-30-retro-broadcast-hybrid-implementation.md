# Retro Broadcast Hybrid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current visual treatment with a fun 90s-inspired broadcast hybrid system using a town-signage retro patch crest plus broadcast UI chrome, while preserving existing data behavior.

**Architecture:** Keep all existing page data flows and routes, and introduce a visual layer composed of reusable crest/chrome assets and banner wrappers. Centralize visual configuration so each page references a shared theme map instead of hardcoding styling decisions. Apply high-energy graphics primarily to hero and section framing while keeping table/chart regions clean for readability.

**Tech Stack:** React, existing `PageHero` abstraction, CSS component layer in `frontend/src/index.css`, Vitest, Testing Library

---

### Task 1: Add retro broadcast asset manifest and enforce full coverage

**Files:**
- Create: `frontend/src/theme/retroAssets.js`
- Create: `frontend/src/theme/retroAssets.test.js`
- Modify: `frontend/src/theme/heroBanners.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest'
import { retroAssets } from './retroAssets'

describe('retroAssets', () => {
  it('defines crest and chrome assets for all hero pages', () => {
    const expectedPages = [
      'home', 'records', 'seasons', 'playoffs', 'draft',
      'trades', 'teams', 'headToHead', 'matchups', 'rosters',
    ]

    expectedPages.forEach((key) => {
      expect(retroAssets[key]).toBeTruthy()
      expect(retroAssets[key].crest.primary).toMatch(/^https?:\/\//)
      expect(retroAssets[key].chrome.tickerRail).toMatch(/^https?:\/\//)
      expect(retroAssets[key].chrome.titlePlate).toMatch(/^https?:\/\//)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test -- src/theme/retroAssets.test.js --run`  
Expected: FAIL with module-not-found for `retroAssets`.

- [ ] **Step 3: Write minimal implementation**

```js
// frontend/src/theme/retroAssets.js
export const retroAssets = {
  home: {
    crest: { primary: '/assets/retro/crest-home-primary.png', compact: '/assets/retro/crest-home-compact.png' },
    chrome: { tickerRail: '/assets/retro/ticker-home.png', titlePlate: '/assets/retro/title-home.png' },
  },
  records: {
    crest: { primary: '/assets/retro/crest-records-primary.png', compact: '/assets/retro/crest-records-compact.png' },
    chrome: { tickerRail: '/assets/retro/ticker-records.png', titlePlate: '/assets/retro/title-records.png' },
  },
  seasons: {
    crest: { primary: '/assets/retro/crest-seasons-primary.png', compact: '/assets/retro/crest-seasons-compact.png' },
    chrome: { tickerRail: '/assets/retro/ticker-seasons.png', titlePlate: '/assets/retro/title-seasons.png' },
  },
  playoffs: {
    crest: { primary: '/assets/retro/crest-playoffs-primary.png', compact: '/assets/retro/crest-playoffs-compact.png' },
    chrome: { tickerRail: '/assets/retro/ticker-playoffs.png', titlePlate: '/assets/retro/title-playoffs.png' },
  },
  draft: {
    crest: { primary: '/assets/retro/crest-draft-primary.png', compact: '/assets/retro/crest-draft-compact.png' },
    chrome: { tickerRail: '/assets/retro/ticker-draft.png', titlePlate: '/assets/retro/title-draft.png' },
  },
  trades: {
    crest: { primary: '/assets/retro/crest-trades-primary.png', compact: '/assets/retro/crest-trades-compact.png' },
    chrome: { tickerRail: '/assets/retro/ticker-trades.png', titlePlate: '/assets/retro/title-trades.png' },
  },
  teams: {
    crest: { primary: '/assets/retro/crest-teams-primary.png', compact: '/assets/retro/crest-teams-compact.png' },
    chrome: { tickerRail: '/assets/retro/ticker-teams.png', titlePlate: '/assets/retro/title-teams.png' },
  },
  headToHead: {
    crest: { primary: '/assets/retro/crest-headtohead-primary.png', compact: '/assets/retro/crest-headtohead-compact.png' },
    chrome: { tickerRail: '/assets/retro/ticker-headtohead.png', titlePlate: '/assets/retro/title-headtohead.png' },
  },
  matchups: {
    crest: { primary: '/assets/retro/crest-matchups-primary.png', compact: '/assets/retro/crest-matchups-compact.png' },
    chrome: { tickerRail: '/assets/retro/ticker-matchups.png', titlePlate: '/assets/retro/title-matchups.png' },
  },
  rosters: {
    crest: { primary: '/assets/retro/crest-rosters-primary.png', compact: '/assets/retro/crest-rosters-compact.png' },
    chrome: { tickerRail: '/assets/retro/ticker-rosters.png', titlePlate: '/assets/retro/title-rosters.png' },
  },
}
```

```js
// frontend/src/theme/heroBanners.js
// keep existing banner URLs and add an `assetKey` per page:
home: { imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/0/04/HenryCowell1.jpg', imageAlt: 'Redwood grove in Henry Cowell Redwoods State Park', imagePosition: 'center 44%', accent: 'teal', assetKey: 'home' }
records: { imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Downtown_Felton%2C_California.JPG', imageAlt: 'Downtown Felton in San Lorenzo Valley', imagePosition: 'center 38%', accent: 'coral', assetKey: 'records' }
seasons: { imageSrc: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Boulder_Creek%2C_California.jpg', imageAlt: 'Boulder Creek in San Lorenzo Valley', imagePosition: 'center 44%', accent: 'gold', assetKey: 'seasons' }
```

- [ ] **Step 4: Run targeted tests and commit**

Run: `cd frontend && npm run test -- src/theme/retroAssets.test.js --run`  
Expected: PASS

```bash
git add frontend/src/theme/retroAssets.js frontend/src/theme/retroAssets.test.js frontend/src/theme/heroBanners.js
git commit -m "Add retro broadcast asset manifest with page coverage test"
```

### Task 2: Extend PageHero to support crest + broadcast chrome slots

**Files:**
- Modify: `frontend/src/components/ui/PageHero.jsx`
- Modify: `frontend/src/components/ui/PageHero.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import PageHero from './PageHero'

describe('PageHero retro slots', () => {
  it('renders optional crest and ticker rail graphics', () => {
    const { container } = render(
      <PageHero
        title="League Records"
        imageSrc="https://upload.wikimedia.org/example.jpg"
        crestSrc="https://assets.example/crest.png"
        tickerRailSrc="https://assets.example/ticker.png"
      />,
    )
    expect(container.querySelector('.vn-page-hero__crest')).toBeTruthy()
    expect(container.querySelector('.vn-page-hero__ticker-rail')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test -- src/components/ui/PageHero.test.jsx --run`  
Expected: FAIL because `.vn-page-hero__crest` and `.vn-page-hero__ticker-rail` do not exist.

- [ ] **Step 3: Write minimal implementation**

```jsx
// add props
crestSrc,
crestAlt = '',
tickerRailSrc,
titlePlateSrc,

// render new elements before content
{tickerRailSrc ? <img src={tickerRailSrc} alt="" aria-hidden="true" className="vn-page-hero__ticker-rail" /> : null}
{titlePlateSrc ? <img src={titlePlateSrc} alt="" aria-hidden="true" className="vn-page-hero__title-plate" /> : null}
{crestSrc ? <img src={crestSrc} alt={crestAlt} className="vn-page-hero__crest" loading="lazy" decoding="async" /> : null}
```

- [ ] **Step 4: Run tests and commit**

Run: `cd frontend && npm run test -- src/components/ui/PageHero.test.jsx --run`  
Expected: PASS

```bash
git add frontend/src/components/ui/PageHero.jsx frontend/src/components/ui/PageHero.test.jsx
git commit -m "Add crest and broadcast chrome slots to PageHero"
```

### Task 3: Implement retro broadcast styling contracts

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Write a failing component-style test**

```jsx
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import PageHero from './PageHero'

describe('PageHero style hooks', () => {
  it('renders retro class hooks for crest and chrome', () => {
    const { container } = render(
      <PageHero title="Seasons" crestSrc="https://assets.example/crest.png" tickerRailSrc="https://assets.example/ticker.png" />,
    )
    expect(container.querySelector('.vn-page-hero__crest')).toBeTruthy()
    expect(container.querySelector('.vn-page-hero__ticker-rail')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test -- src/components/ui/PageHero.test.jsx --run`  
Expected: FAIL for missing rendered nodes.

- [ ] **Step 3: Add CSS for broadcast hybrid presentation**

```css
.vn-page-hero__ticker-rail { position: absolute; left: 0; right: 0; bottom: 0.4rem; height: 2.1rem; object-fit: cover; opacity: 0.92; z-index: 1; }
.vn-page-hero__title-plate { position: absolute; top: 0.9rem; left: 1rem; width: min(72vw, 28rem); opacity: 0.9; z-index: 1; }
.vn-page-hero__crest { position: absolute; right: 1rem; top: 1rem; width: clamp(4.5rem, 14vw, 8rem); z-index: 2; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35)); }
```

```css
@media (max-width: 640px) {
  .vn-page-hero__ticker-rail { height: 1.6rem; bottom: 0.25rem; }
  .vn-page-hero__crest { width: clamp(3.4rem, 20vw, 4.5rem); top: 0.75rem; right: 0.75rem; }
}
```

- [ ] **Step 4: Run focused tests and commit**

Run: `cd frontend && npm run test -- src/components/ui/PageHero.test.jsx --run`  
Expected: PASS

```bash
git add frontend/src/index.css
git commit -m "Add retro broadcast CSS contracts for hero chrome"
```

### Task 4: Wire retro assets into Home, Records, and Seasons (validation slice)

**Files:**
- Modify: `frontend/src/pages/Home.jsx`
- Modify: `frontend/src/pages/Records.jsx`
- Modify: `frontend/src/pages/Seasons.jsx`
- Modify: `frontend/src/pages/Home.test.jsx`
- Modify: `frontend/src/pages/Records.test.jsx`
- Modify: `frontend/src/pages/Seasons.test.jsx`

- [ ] **Step 1: Write failing page-level test assertions**

```jsx
expect(container.querySelector('.vn-page-hero__crest')).toBeTruthy()
expect(container.querySelector('.vn-page-hero__ticker-rail')).toBeTruthy()
```

- [ ] **Step 2: Run targeted tests to verify failure**

Run: `cd frontend && npm run test -- src/pages/Home.test.jsx src/pages/Records.test.jsx src/pages/Seasons.test.jsx --run`  
Expected: FAIL because pages do not pass retro props into `PageHero`.

- [ ] **Step 3: Implement page wiring**

```jsx
import { retroAssets } from '../theme/retroAssets'

<PageHero
  imageSrc={heroBanners.home.imageSrc}
  imageAlt={heroBanners.home.imageAlt}
  imagePosition={heroBanners.home.imagePosition}
  accent={heroBanners.home.accent}
  crestSrc={retroAssets.home.crest.primary}
  crestAlt="Valley Natives retro patch crest"
  tickerRailSrc={retroAssets.home.chrome.tickerRail}
  titlePlateSrc={retroAssets.home.chrome.titlePlate}
  eyebrow="League history"
  title={metadata?.league_name || 'Fantasy Football League'}
  subtitle={`${metadata?.first_season}-${metadata?.latest_season} • ${metadata?.total_seasons} seasons • ${metadata?.total_owners} owners`}
/>
```

- [ ] **Step 4: Run tests and commit**

Run: `cd frontend && npm run test -- src/pages/Home.test.jsx src/pages/Records.test.jsx src/pages/Seasons.test.jsx --run`  
Expected: PASS

```bash
git add frontend/src/pages/Home.jsx frontend/src/pages/Records.jsx frontend/src/pages/Seasons.jsx frontend/src/pages/Home.test.jsx frontend/src/pages/Records.test.jsx frontend/src/pages/Seasons.test.jsx
git commit -m "Wire retro crest and ticker chrome into top three pages"
```

### Task 5: Roll retro assets across remaining tabs

**Files:**
- Modify: `frontend/src/pages/Playoffs.jsx`
- Modify: `frontend/src/pages/Draft.jsx`
- Modify: `frontend/src/pages/Trades.jsx`
- Modify: `frontend/src/pages/Teams.jsx`
- Modify: `frontend/src/pages/HeadToHead.jsx`
- Modify: `frontend/src/pages/Matchups.jsx`
- Modify: `frontend/src/pages/Rosters.jsx`

- [ ] **Step 1: Write one failing integration assertion in `App.shell.test.jsx`**

```jsx
it('shows retro hero chrome in routed pages', () => {
  const { container } = render(<App />)
  expect(container.querySelector('.vn-page-hero')).toBeTruthy()
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd frontend && npm run test -- src/App.shell.test.jsx --run`  
Expected: FAIL because routed pages do not yet pass `crestSrc` and `tickerRailSrc` into `PageHero`.

- [ ] **Step 3: Implement tab wiring**

```jsx
<PageHero
  imageSrc={heroBanners.playoffs.imageSrc}
  imageAlt={heroBanners.playoffs.imageAlt}
  imagePosition={heroBanners.playoffs.imagePosition}
  accent={heroBanners.playoffs.accent}
  crestSrc={retroAssets.playoffs.crest.primary}
  tickerRailSrc={retroAssets.playoffs.chrome.tickerRail}
  titlePlateSrc={retroAssets.playoffs.chrome.titlePlate}
  eyebrow="Hall of Champions"
  title="Championship History"
  subtitle={`${playoffs.length} seasons of glory`}
/>
```

- [ ] **Step 4: Run app/page tests and commit**

Run: `cd frontend && npm run test -- src/App.shell.test.jsx src/pages/Home.test.jsx src/pages/Records.test.jsx src/pages/Seasons.test.jsx --run`  
Expected: PASS

```bash
git add frontend/src/pages/Playoffs.jsx frontend/src/pages/Draft.jsx frontend/src/pages/Trades.jsx frontend/src/pages/Teams.jsx frontend/src/pages/HeadToHead.jsx frontend/src/pages/Matchups.jsx frontend/src/pages/Rosters.jsx frontend/src/App.shell.test.jsx
git commit -m "Apply retro broadcast hero treatment across all remaining tabs"
```

### Task 6: Final polish and production readiness

**Files:**
- Modify: `frontend/src/App.jsx` (update footer attribution for generated asset pack)
- Modify: `frontend/src/index.css` (final responsive tuning for crest/chrome density)

- [ ] **Step 1: Write final non-regression checks**

```bash
cd frontend/src && grep -R "ValleyPhotoBadge\\|ValleyGlyph\\|valleyPhotos" .
```

Expected: no matches.

- [ ] **Step 2: Run full validation**

Run: `cd frontend && npm run lint && npm run test -- --run && npm run build`  
Expected: lint, tests, and build all succeed.

- [ ] **Step 3: Commit final polish**

```bash
git add frontend/src/App.jsx frontend/src/index.css
git commit -m "Polish retro broadcast visual system for mobile and desktop"
```

- [ ] **Step 4: Push and open PR**

```bash
git push -u origin feature/valley-natives-all-tabs-pop
gh pr create --base main --head feature/valley-natives-all-tabs-pop --title "Retro broadcast hybrid visual refresh with GenAI crest system" --body "Implements town-signage retro patch crest identity and broadcast hybrid chrome across all tabs while preserving existing data behavior."
```
