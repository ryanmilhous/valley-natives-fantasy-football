# Hero Banner Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace boxed image/glyph treatments with clean full-width SLV-themed banners and upgrade the visual system to a bold-sports style that works on mobile and desktop.

**Architecture:** Introduce a reusable `HeroBanner` component and a centralized `heroBanners` theme map, then migrate all page hero usage to this system while preserving existing page logic and data flows. Keep body surfaces cleaner (reduced visual noise) and reserve strong accents for hero and interactive highlights. Implement graceful image fallback in the hero component so pages remain polished if remote media fails.

**Tech Stack:** React, Tailwind utility classes, project CSS component layer (`index.css`), Vitest, Testing Library

---

### Task 1: Build the shared full-width HeroBanner component

**Files:**
- Create: `frontend/src/components/ui/HeroBanner.jsx`
- Create: `frontend/src/components/ui/HeroBanner.test.jsx`
- Modify: `frontend/src/components/ui/PageHero.jsx` (convert to thin wrapper that renders `HeroBanner` to avoid breaking any lingering imports)

- [ ] **Step 1: Write the failing test**

```jsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroBanner from './HeroBanner'

describe('HeroBanner', () => {
  it('renders title/subtitle over full-width media', () => {
    const { container } = render(
      <HeroBanner
        title="Draft History"
        subtitle="Snake era and auction era"
        imageSrc="https://example.com/redwoods.jpg"
        imageAlt="Redwood forest"
      />,
    )
    expect(screen.getByText('Draft History')).toBeTruthy()
    expect(screen.getByText('Snake era and auction era')).toBeTruthy()
    expect(container.querySelector('.vn-hero-banner')).toBeTruthy()
    expect(container.querySelector('.vn-hero-banner__image')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test -- src/components/ui/HeroBanner.test.jsx --run`  
Expected: FAIL with module/file-not-found for `HeroBanner`.

- [ ] **Step 3: Write minimal implementation**

```jsx
function HeroBanner({
  eyebrow,
  title,
  subtitle,
  imageSrc,
  imageAlt = '',
  imagePosition = 'center center',
  accent = 'teal',
  actions,
}) {
  return (
    <section className={`vn-hero-banner vn-hero-banner--${accent}`}>
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="eager"
        decoding="async"
        className="vn-hero-banner__image"
        style={{ objectPosition: imagePosition }}
      />
      <div className="vn-hero-banner__overlay" />
      <div className="vn-hero-banner__content">
        {eyebrow ? <p className="vn-hero-banner__eyebrow">{eyebrow}</p> : null}
        <h1 className="vn-hero-banner__title">{title}</h1>
        {subtitle ? <p className="vn-hero-banner__subtitle">{subtitle}</p> : null}
        {actions ? <div className="vn-hero-banner__actions">{actions}</div> : null}
      </div>
    </section>
  )
}

export default HeroBanner
```

- [ ] **Step 4: Add fallback test + fallback behavior**

```jsx
it('falls back to gradient mode if image fails', () => {
  const { container } = render(
    <HeroBanner title="Records" imageSrc="https://bad-url.invalid/image.jpg" />,
  )
  const image = container.querySelector('.vn-hero-banner__image')
  image.dispatchEvent(new Event('error'))
  expect(container.querySelector('.vn-hero-banner--fallback')).toBeTruthy()
})
```

```jsx
// inside HeroBanner
const [hasImageError, setHasImageError] = useState(false)
const bannerClass = `vn-hero-banner vn-hero-banner--${accent} ${hasImageError ? 'vn-hero-banner--fallback' : ''}`.trim()

<section className={bannerClass}>
  {!hasImageError ? (
    <img
      src={imageSrc}
      alt={imageAlt}
      loading="eager"
      decoding="async"
      className="vn-hero-banner__image"
      style={{ objectPosition: imagePosition }}
      onError={() => setHasImageError(true)}
    />
  ) : null}
</section>
```

- [ ] **Step 5: Run tests and commit**

Run: `cd frontend && npm run test -- src/components/ui/HeroBanner.test.jsx --run`  
Expected: PASS

```bash
git add frontend/src/components/ui/HeroBanner.jsx frontend/src/components/ui/HeroBanner.test.jsx
git commit -m "Create shared full-width hero banner component"
```

### Task 2: Create centralized banner theme config for all tabs

**Files:**
- Create: `frontend/src/theme/heroBanners.js`
- Create: `frontend/src/theme/heroBanners.test.js`
- Delete: `frontend/src/theme/valleyPhotos.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest'
import { heroBanners } from './heroBanners'

describe('heroBanners', () => {
  it('defines banner config for every route page', () => {
    const expectedKeys = [
      'home', 'records', 'seasons', 'playoffs',
      'draft', 'trades', 'teams', 'headToHead',
      'matchups', 'rosters',
    ]
    expectedKeys.forEach((key) => expect(heroBanners[key]).toBeTruthy())
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test -- src/theme/heroBanners.test.js --run`  
Expected: FAIL because `heroBanners` module does not exist.

- [ ] **Step 3: Implement configuration map**

```js
export const heroBanners = {
  home: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/0/04/HenryCowell1.jpg',
    alt: 'Redwood grove in Henry Cowell Redwoods State Park',
    imagePosition: 'center 42%',
    accent: 'teal',
  },
  records: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Downtown_Felton%2C_California.JPG',
    alt: 'Downtown Felton in San Lorenzo Valley',
    imagePosition: 'center 40%',
    accent: 'gold',
  },
  seasons: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dixiana_at_Roaring_Camp_water_tower%2C_June_2023.jpg/1280px-Dixiana_at_Roaring_Camp_water_tower%2C_June_2023.jpg',
    alt: 'Roaring Camp train near redwoods',
    imagePosition: 'center 45%',
    accent: 'coral',
  },
  playoffs: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/0/04/HenryCowell1.jpg',
    alt: 'Redwood grove in Henry Cowell Redwoods State Park',
    imagePosition: 'center 30%',
    accent: 'gold',
  },
  draft: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dixiana_at_Roaring_Camp_water_tower%2C_June_2023.jpg/1280px-Dixiana_at_Roaring_Camp_water_tower%2C_June_2023.jpg',
    alt: 'Roaring Camp in the redwoods',
    imagePosition: 'center 40%',
    accent: 'teal',
    eyebrow: 'Highway 9 Draft Archive',
  },
  trades: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Downtown_Felton%2C_California.JPG',
    alt: 'Downtown Felton in San Lorenzo Valley',
    imagePosition: 'center 42%',
    accent: 'coral',
  },
  teams: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Downtown_Felton%2C_California.JPG',
    alt: 'Downtown Felton in San Lorenzo Valley',
    imagePosition: 'center 35%',
    accent: 'teal',
  },
  headToHead: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/0/04/HenryCowell1.jpg',
    alt: 'Redwood grove in Henry Cowell Redwoods State Park',
    imagePosition: 'center 50%',
    accent: 'rose',
  },
  matchups: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/0/04/HenryCowell1.jpg',
    alt: 'Redwood grove in Henry Cowell Redwoods State Park',
    imagePosition: 'center 42%',
    accent: 'rose',
  },
  rosters: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dixiana_at_Roaring_Camp_water_tower%2C_June_2023.jpg/1280px-Dixiana_at_Roaring_Camp_water_tower%2C_June_2023.jpg',
    alt: 'Roaring Camp train near redwoods',
    imagePosition: 'center 38%',
    accent: 'teal',
  },
}
```

- [ ] **Step 4: Run tests and commit**

Run: `cd frontend && npm run test -- src/theme/heroBanners.test.js --run`  
Expected: PASS

```bash
git add frontend/src/theme/heroBanners.js frontend/src/theme/heroBanners.test.js
git rm frontend/src/theme/valleyPhotos.js
git commit -m "Add centralized hero banner configuration for all tabs"
```

### Task 3: Replace nav badge and remove boxed hero photo usage

**Files:**
- Modify: `frontend/src/App.jsx`
- Delete: `frontend/src/components/brand/ValleyPhotoBadge.jsx`
- Delete: `frontend/src/components/brand/ValleyGlyph.jsx`
- Modify: `frontend/src/App.shell.test.jsx`

- [ ] **Step 1: Write failing shell test for nav branding cleanup**

```jsx
it('renders brand without boxed photo badge in nav', () => {
  const { container } = render(<App />)
  expect(container.querySelector('.vn-photo-badge')).toBeNull()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test -- src/App.shell.test.jsx --run`  
Expected: FAIL because `.vn-photo-badge` still exists in nav.

- [ ] **Step 3: Implement nav cleanup**

```jsx
// App.jsx nav brand block
<Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
  <BrandWordmark />
</Link>
```

```jsx
// remove ValleyPhotoBadge imports/usages in App.jsx
// delete ValleyPhotoBadge and ValleyGlyph files
```

- [ ] **Step 4: Run test and commit**

Run: `cd frontend && npm run test -- src/App.shell.test.jsx --run`  
Expected: PASS

```bash
git add frontend/src/App.jsx frontend/src/App.shell.test.jsx
git rm frontend/src/components/brand/ValleyPhotoBadge.jsx
git commit -m "Remove boxed nav photo badge and simplify brand header"
```

### Task 4: Migrate page heroes to full-width HeroBanner

**Files:**
- Modify: `frontend/src/pages/Home.jsx`
- Modify: `frontend/src/pages/Records.jsx`
- Modify: `frontend/src/pages/Seasons.jsx`
- Modify: `frontend/src/pages/Playoffs.jsx`
- Modify: `frontend/src/pages/Draft.jsx`
- Modify: `frontend/src/pages/Trades.jsx`
- Modify: `frontend/src/pages/Teams.jsx`
- Modify: `frontend/src/pages/HeadToHead.jsx`
- Modify: `frontend/src/pages/Matchups.jsx`
- Modify: `frontend/src/pages/Rosters.jsx`

- [ ] **Step 1: Write one migration test on an updated page**

```jsx
// in frontend/src/pages/Home.test.jsx
expect(container.querySelector('.vn-hero-banner')).toBeTruthy()
expect(container.querySelector('.vn-photo-badge')).toBeNull()
```

- [ ] **Step 2: Run targeted test to verify it fails**

Run: `cd frontend && npm run test -- src/pages/Draft.test.jsx --run`  
Expected: FAIL because page still uses legacy hero child badge.

- [ ] **Step 3: Replace each page hero block**

```jsx
import HeroBanner from '../components/ui/HeroBanner'
import { heroBanners } from '../theme/heroBanners'

<HeroBanner
  {...heroBanners.draft}
  title="Draft History"
  subtitle="Snake era and auction era in one record book"
  actions={
    <>
      <span className="vn-hero-metric">{draft.length} picks</span>
      <StatBadge tone="top" label="Snake 2007-2011" />
      <StatBadge tone="champion" label="Auction 2012-present" />
    </>
  }
/>
```

- [ ] **Step 4: Run page tests and commit**

Run: `cd frontend && npm run test -- src/pages/Draft.test.jsx src/pages/Home.test.jsx src/pages/Records.test.jsx src/pages/Seasons.test.jsx --run`  
Expected: PASS

```bash
git add frontend/src/pages/Home.jsx frontend/src/pages/Records.jsx frontend/src/pages/Seasons.jsx frontend/src/pages/Playoffs.jsx frontend/src/pages/Draft.jsx frontend/src/pages/Trades.jsx frontend/src/pages/Teams.jsx frontend/src/pages/HeadToHead.jsx frontend/src/pages/Matchups.jsx frontend/src/pages/Rosters.jsx
git commit -m "Migrate all tab heroes to full-width banner layout"
```

### Task 5: Apply bold-sports visual system polish in CSS

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/components/ui/HeroBanner.jsx`
- Modify: `frontend/src/components/ui/HeroBanner.test.jsx`

- [ ] **Step 1: Write/extend a style contract test**

```jsx
it('renders accent stripe and overlay layers', () => {
  const { container } = render(
    <HeroBanner title="Seasons" imageSrc="https://example.com/banner.jpg" accent="gold" />,
  )
  expect(container.querySelector('.vn-hero-banner__overlay')).toBeTruthy()
  expect(container.querySelector('.vn-hero-banner__accent-stripe')).toBeTruthy()
})
```

- [ ] **Step 2: Run test to verify current gap**

Run: `cd frontend && npm run test -- src/components/ui/HeroBanner.test.jsx --run`  
Expected: FAIL because `.vn-hero-banner__accent-stripe` does not exist yet.

- [ ] **Step 3: Implement style updates**

```css
.vn-hero-banner { position: relative; border-radius: 1rem; overflow: hidden; min-height: 280px; border: 1px solid color-mix(in srgb, var(--vn-gold-500) 35%, transparent); }
.vn-hero-banner__image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.vn-hero-banner__overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10, 19, 16, 0.22) 0%, rgba(10, 19, 16, 0.82) 70%, rgba(10, 19, 16, 0.94) 100%); }
.vn-hero-banner__accent-stripe { position: absolute; inset: auto 0 0 0; height: 4px; background: linear-gradient(90deg, var(--vn-teal-500), var(--vn-coral-500), var(--vn-gold-500)); }
.vn-hero-banner__content { position: relative; z-index: 1; display: grid; gap: .75rem; padding: 1.25rem; }
@media (min-width: 640px) { .vn-hero-banner { min-height: 320px; } }
@media (min-width: 1024px) { .vn-hero-banner { min-height: 360px; } }
```

- [ ] **Step 4: Run full frontend checks and commit**

Run: `cd frontend && npm run lint && npm run test -- --run && npm run build`  
Expected: lint clean except pre-existing warnings, tests PASS, build succeeds.

```bash
git add frontend/src/index.css
git commit -m "Polish bold-sports color system and full-width hero styles"
```

### Task 6: Final consistency pass and ship prep

**Files:**
- Modify: `frontend/src/pages/Home.test.jsx`
- Modify: `frontend/src/pages/Records.test.jsx`
- Modify: `frontend/src/pages/Seasons.test.jsx`
- Modify: `frontend/src/components/ui/PageHero.jsx` (retain as a compatibility wrapper over `HeroBanner`)

- [ ] **Step 1: Remove dead imports/usages**

```bash
cd frontend/src && grep -R "ValleyPhotoBadge\\|ValleyGlyph" .
```

Expected: no matches except commit history files outside `frontend/src`.

- [ ] **Step 2: Ensure component usage consistency**

```bash
cd frontend/src && grep -R "HeroBanner" pages components
```

Expected: all main pages use `HeroBanner` for top-of-page hero.

- [ ] **Step 3: Run final validation**

Run: `cd frontend && npm run lint && npm run test -- --run && npm run build`  
Expected: PASS (with only known pre-existing non-blocking warnings if unchanged).

- [ ] **Step 4: Commit final cleanup**

```bash
git add frontend/src/components/ui/PageHero.jsx frontend/src/pages
git commit -m "Finalize hero-banner refresh consistency across all tabs"
```

- [ ] **Step 5: Push and open PR**

```bash
git push -u origin feature/valley-natives-all-tabs-pop
gh pr create --base main --head feature/valley-natives-all-tabs-pop --title "Hero banner refresh with bold sports visual polish" --body "Implements full-width SLV hero banners, removes boxed image treatment, and upgrades visual polish for mobile and desktop."
```
