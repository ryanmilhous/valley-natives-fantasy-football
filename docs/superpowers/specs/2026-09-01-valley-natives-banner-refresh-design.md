# Valley Natives League History Banner Refresh Design

**Date:** 2026-09-01  
**Scope:** Replace hero banner images across all 10 top-level tabs/pages in the Valley Natives redesign worktree.

## Goal

Update all page hero banners to use the new locally provided SLV images, with intentional image reuse on specific tabs:

- `images-4.jpg` on tabs 1 and 10
- `images.jpg` on tabs 2 and 9
- Each of the remaining six images used exactly once across tabs 3 through 8

## Architecture and File Layout

Banner wiring remains centralized in:

- `frontend/src/theme/heroBanners.js`

New banner assets are served as static files from:

- `frontend/public/images/banners/`

Planned files:

- `images.jpg`
- `images-1.jpg`
- `images-2.jpg`
- `images-3.jpg`
- `images-4.jpg`
- `Big+Basin+Redwoods.webp`
- `Downtown+Boulder+Creek.webp`
- `Roaring+Camp.webp`

No page component, route, or backend changes are required.

## Tab-to-Image Mapping

Tab order is based on the app navigation/routes:

1. Home -> `images-4.jpg`
2. Records -> `images.jpg`
3. Seasons -> `images-1.jpg`
4. Champions (Playoffs) -> `images-2.jpg`
5. Draft -> `images-3.jpg`
6. Trades -> `Big+Basin+Redwoods.webp`
7. Owners (Teams) -> `Downtown+Boulder+Creek.webp`
8. H2H (HeadToHead) -> `Roaring+Camp.webp`
9. Matchups -> `images.jpg` (repeat)
10. Rosters -> `images-4.jpg` (repeat)

## Rendering/Data Flow

Each page already reads hero configuration from `heroBanners.<key>`. The update only changes banner content fields:

- `imageSrc` to local paths under `/images/banners/`
- `imageAlt` to concise, accurate descriptions

Existing display behavior is preserved:

- `accent` values remain unchanged
- `imagePosition` values remain unchanged unless manual adjustment is needed later
- `assetKey` values remain unchanged (to preserve retro asset chrome mapping)

## Error Handling and Safety

The `PageHero` component already has a fallback visual state when no image is present. This design does not change that behavior.

To minimize risk:

- Copy assets into `public/images/banners/` before changing banner URLs
- Keep edits constrained to asset files and `heroBanners.js`
- Avoid any changes to routes, API contracts, or page data logic

## Test Strategy

Existing test currently enforces all 10 banner images are unique:

- `frontend/src/theme/heroBanners.test.js`

That assertion will be updated to reflect intentional repeats and guard against accidental drift. Assertions will validate:

- 10 total hero image assignments
- `images-4.jpg` appears exactly 2 times
- `images.jpg` appears exactly 2 times
- each remaining image appears exactly 1 time

## Out of Scope

- Banner cropping/position tuning pass beyond existing `imagePosition` values
- Visual redesign of hero overlays, typography, or navigation
- Any backend/data pipeline changes

## Acceptance Criteria

- All 10 tabs display updated hero banner images from local static assets
- Reuse pattern exactly matches requested mapping
- Remaining six images are each used once
- Automated test reflects and enforces the new distribution
