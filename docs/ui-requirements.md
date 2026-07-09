# DoomPiles — UI Requirements

## Visual Language

- **Background:** dark charcoal — warm enough not to feel cold-tech (target ~#1C1C1C)
- **No gradients.** No rounded shiny things. No bubble UI elements.
- **Typography:** handwritten-style face for all labels, headers, and names. Courier/monospace for body text, metadata, and data values. Two typefaces only.
- **Handwritten face direction:** scratchy printed block lettering — sketchbook annotation, architect's margin notes, field notebook. NOT cursive, NOT semi-cursive journal style. Think pencil-scratched all-caps with uneven baseline and slightly stressed strokes.
- **Font candidates to experiment with** (all Google Fonts, free): Architects Daughter (closest to the target), Kalam (slightly more informal but still printed), Special Elite (typewriter-rough, worth a try), Permanent Marker (bolder, more aggressive), Rubik Dirt (textured/stressed, most stylized of the set). Pick after live experimentation — they read very differently at different sizes.
- **Icons:** hand-drawn SVG paths with intentional wobble and variable line widths. No icon fonts. No pixel-perfect geometry. Every icon should look like it was sketched.
- **Accent color:** muted, worn — not neon, not acid. Yellow-gold or similar. Used sparingly.

## Navigation

- No nested menus. All major areas of the app reachable in one tap/click from any screen.
- Profile / account settings accessible from the upper-right corner on every screen — where people expect it.
- Labels must be short. If a label needs more than 3–4 words it should be reconsidered.
- Any icon with no label must be unambiguous without hovering or clicking. Mouseover tooltips are acceptable as supplementary information, not as the primary way to understand an icon.

## Capture Button

- The snap-a-pile capture button is the primary action of the app.
- It must be visually prominent and centred in the navigation.
- On mobile: floats above the bottom nav bar, breaking out of the nav vertically to emphasize primacy.
- On desktop: prominent placement in the top content area, always visible without scrolling.
- No other element should compete with it visually.

## Feedback & Rewards

- Small status-change animation fires on every pile milestone step — lightweight, immediate, not lingering.
- Pile resolution (Doom Pile Defeated) triggers the graveyard — a scrollable record of defeated piles, each with an auto-generated epitaph from the vision API's item list.
- **Graveyard:** not a top-level navigation item. Accessible via a tombstone icon within the Piles view. Intentionally subtle — it's a reward you discover, not a feature you navigate to. A new user with zero defeated piles should not encounter it as an empty menu item creating confusion.
- **Graveyard empty state:** needs a cheeky placeholder (e.g. "nothing defeated yet. get to work.") — not a blank screen.
- **Graveyard feature flow:** pile reaches milestone 5 → entry auto-generated with tombstone, pile name, date, and epitaph from vision API item list → pile disappears from active list → graveyard is scrollable and read-only, no editing or deleting.
- **General principle:** features that would be empty and confusing to a new user should not be prominent until there is something in them. Graveyard, accountability buddy setup, and outgoing haul tracking all follow this model — they reveal themselves through use, not onboarding.

## Rainbow Mode

- Unlocks after defeating N doom piles (target 7–10, TBD). The only unlock in the app — and it's purely cosmetic chaos.
- Implementation: CSS class swap on root element (`dark-mode` → `rainbow-mode`), separate CSS variable set replacing the charcoal palette. Lightweight — no architectural changes needed.
- Unlock notification should be unhinged in tone, not utilitarian. ("you have defeated 10 doom piles. you have earned the chaos.")
- Toggle lives in settings once unlocked. Fully reversible — you can always go back to dark.
- A small rainbow icon appears on the graveyard view once unlocked, hinting at it before settings explains it.
- Rainbow theme should be genuinely chaotic and fun, not tasteful. It's a joke reward. Lean into it.
- Notifications exist to close a real-world loop, not to bring the user back to the app.

## Notifications Philosophy

- Every notification must be actionable or time-sensitive. "You haven't opened DoomPiles in 3 days" is not acceptable.
- Escalation reminders become more specific over time, not just louder/more frequent.
- Accountability buddy notifications require opt-in from the buddy before they are active.

## Accessibility Baseline

- Keyboard navigable.
- Sufficient contrast on charcoal background for all text and icon states.
- Reduced motion respected (CSS `prefers-reduced-motion` — skip or simplify animations).
- Touch targets minimum 44×44px on mobile.

## What to Avoid

| Avoid | Because |
|---|---|
| Gradients | Conflicts with hand-drawn, low-fi aesthetic |
| Rounded shiny buttons | Same — looks like a generic SaaS app |
| Nested menus | Hides key areas, requires more taps |
| Long labels | Breaks the spare visual tone |
| Badge systems | Engagement loops are explicitly out of scope |
| Icon fonts | Hand-drawn SVGs only |
| Cold/blue-tinted dark mode | Should feel warm and slightly worn, not tech-sterile |
| Open-ended chat UI in the AI diagnosis feature | Explicitly out of scope — bounded presets only |

## Open Visual Decisions

- Consistent animation style for milestone steps vs. randomised/silly — not yet decided
- Mobile vs. desktop layout primary: Variant A (mobile-first, bottom nav) vs. Variant B (desktop split with collapsing rail) — both mocked up, decision pending
- Whether the graveyard lives as a permanent tab or appears as a panel on the main dashboard (Variant B shows it as a panel)
