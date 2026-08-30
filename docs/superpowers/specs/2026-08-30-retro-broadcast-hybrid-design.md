# Valley Natives Retro Broadcast Hybrid Design

## Goal
Make the site feel fun, exciting, and premium by replacing bland visuals with a 90s-inspired SportsCenter-style design system that uses GenAI-created graphic assets, while preserving current data behavior and usability.

## Approved Direction
- Primary style: **Broadcast Hybrid**
- Crest style lane: **Retro athletic patch**
- Crest centerpiece: **Town-signage**
- Texture finish: **Clean vintage**

## Scope
- Visual system overhaul only (no data model, API, route, or stat logic changes).
- Replace current photo-led identity with graphic-led identity.
- Introduce GenAI-generated crest and broadcast chrome assets.
- Ensure strong mobile and desktop presentation.

Out of scope:
- New analytics/stat features
- Backend changes
- Navigation structure changes unrelated to visual treatment

## Experience Architecture
1. Keep existing tab structure and page flows.
2. Shift to a sports-broadcast visual shell:
   - title plates
   - ticker rails
   - stat ribbons
   - section dividers
3. Use a **town-signage retro patch crest** as the hero identity anchor.
4. Keep content regions (tables/cards/charts) cleaner and calmer than hero chrome for readability.

## GenAI Asset System
### Asset Pack A: Crest Pack (priority)
- Primary league crest (full lockup)
- Compact crest (small placements/nav)
- Monochrome crest variant
- Championship seal

### Asset Pack B: Broadcast UI Pack
- Lower-third/ticker rail backgrounds
- Section title plates
- Divider bars
- Stat-chip backplates

### Production constraints
- Favor transparent-background exports for composability.
- Keep assets responsive and performant (optimized dimensions, compressed web assets).
- Define predictable naming/token mapping for components.

## Style Guardrails
- Base palette: deep charcoal/navy
- Text: warm off-white
- Accents: red/teal/gold used selectively for contrast and hierarchy
- Fun/exciting comes from shape language and graphics, not excessive gradients
- At most one primary hero graphic and one secondary accent graphic per section

## Motion and Interaction
- Optional subtle motion in broadcast chrome only (ticker drift/pulse).
- No heavy movement in table-heavy data areas.
- Focus and hover states remain crisp and accessible.

## Mobile + Desktop Rules
- Desktop: full broadcast chrome treatment with wider title plates/ticker zones.
- Mobile: collapse chrome density, shorten ticker lines, preserve headline and primary stat callouts.
- Keep touch targets and typography legible first; decorative layers are secondary.

## Accessibility and Reliability
- Decorative assets do not block understanding of data content.
- Maintain contrast and keyboard-focus visibility.
- Provide static fallbacks if any optional graphic/motion layer fails.

## Rollout Sequence
1. Implement visual system foundation and crest/ticker components.
2. Convert Home + Records + Seasons first for style validation.
3. Apply pattern to remaining tabs.
4. Final consistency pass and polish across breakpoints.

## Validation
- Existing lint/test/build pipeline remains the validation baseline.
- Visual QA emphasis:
  - excitement/personality increase
  - reduced “shoehorned” feel
  - desktop/mobile consistency
  - unchanged data behavior

