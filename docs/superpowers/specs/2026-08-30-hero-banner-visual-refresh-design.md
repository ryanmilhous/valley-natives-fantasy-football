# Valley Natives Hero Banner Visual Refresh Design

## Goal
Replace the current boxed, shoehorned photo treatment and bland visual layer with a cleaner, bolder, premium sports presentation that feels intentional on both desktop and mobile.

## Scope
- Presentation-only redesign for the existing frontend pages/tabs.
- Remove current glyph/photo badge hero elements.
- Introduce full-width banner heroes with open-license San Lorenzo Valley imagery.
- Refresh color/graphic system for more visual energy while preserving readability.

Out of scope:
- Route changes
- Data model/API logic changes
- Historical stat/calculation behavior changes

## Design Principles
1. **Cinematic headline, clean body**: bold hero impact at top, restrained content surfaces below.
2. **Local authenticity**: SLV/redwood/town imagery, not generic stock motifs.
3. **Mobile parity**: no desktop-only treatments; all hero/content behavior responsive by default.
4. **Legibility first**: image overlays and text contrast always prioritize readability.

## Visual Architecture
### 1) Full-width hero banners (all tabs)
- Add a shared hero banner component that spans the content width and replaces boxed image badges.
- Banner height scales by breakpoint (rough target: ~280px mobile, ~320px tablet, ~360px desktop).
- Each banner includes:
  - background image
  - dark gradient readability overlay
  - accent stripe/glow tied to page category
  - title/subtitle/actions content

### 2) Cleaner content surfaces
- Keep tables/cards/panels flatter and cleaner beneath the hero.
- Reduce competing gradients and noisy decorative elements.
- Strengthen hierarchy with typography scale and spacing instead of extra ornaments.

### 3) Bold-sports color refresh
- Keep core valley palette but increase accent clarity and contrast.
- Reserve strongest accents for headers, key labels, and active controls.
- Avoid muddy mid-tone stacking by simplifying layered backgrounds.

## Imagery Strategy
- Use open-license/publicly reusable imagery from trusted sources (e.g., Wikimedia Commons).
- Maintain a centralized per-page hero image map with:
  - `src`
  - `alt`
  - `focalPosition` (object-position hints)
  - `theme` (accent token key)
- Add image fallback behavior:
  - if image fails to load, hero renders with branded gradient background and no broken media UI.

## Component and File Design
- Introduce `HeroBanner` component in `frontend/src/components/ui/`.
- Introduce banner configuration in `frontend/src/theme/heroBanners.js`.
- Remove `ValleyPhotoBadge` integration from nav/hero areas.
- Delete `ValleyGlyph`/badge-era references no longer used.
- Update page hero usage in:
  - `Draft.jsx`
  - `Trades.jsx`
  - `Matchups.jsx`
  - `HeadToHead.jsx`
  - `Rosters.jsx`
  - `Teams.jsx`
  - `Playoffs.jsx`
  - plus existing top pages as needed for visual consistency.

## Responsive Behavior
- Hero content reflows to one-column on mobile with reduced copy density.
- Text block width constrained for readable line length.
- Background image focal points tuned per page so important subject matter remains visible on narrow screens.
- Vertical rhythm and spacing normalized across tabs for consistent scanability.

## Accessibility
- Decorative media remains non-essential to understanding content.
- Every hero image has meaningful alt text where semantically useful; purely decorative instances use empty alt.
- Overlay contrast keeps headings and metadata readable against all banner images.
- Existing keyboard/focus behavior remains intact.

## Risks and Mitigations
- **Risk:** Inconsistent source image quality/aspect ratio across pages.  
  **Mitigation:** Curate image set with consistent minimum dimensions and explicit focal positions.

- **Risk:** Over-stylization harms data readability in table-heavy pages.  
  **Mitigation:** Keep hero high-impact but body sections subdued and contrast-checked.

- **Risk:** Network dependency on external images.  
  **Mitigation:** Use robust URLs, lazy loading where appropriate, and gradient fallbacks.

## Validation Plan
- Run existing frontend lint/test/build commands.
- Review each tab at mobile and desktop breakpoints for:
  - banner readability
  - visual consistency
  - non-regression of filters/tables/navigation.

