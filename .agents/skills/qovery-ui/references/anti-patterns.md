# Anti-Patterns — Qovery Console

Match-and-refuse. If you're about to do any of these, stop and redesign the element.

---

## Absolute Bans

**Side-stripe accent borders.**
A `border-left` or `border-right` thicker than 1px used as a colored highlight on a card, list item, callout, or alert. It signals hierarchy without creating it. Replace with a full border, a background tint, or nothing.

**Status colors used decoratively.**
Green for a "Pro" badge. Red to make a destructive section feel edgy. Yellow on a marketing callout. The four semantic colors — `positive`, `warning`, `negative`, `info` — communicate system state. The moment they appear elsewhere, users lose the ability to trust them. Use `neutral` or `brand` for anything that isn't a live status.

**Brand violet as a page wash.**
Covering a section, panel, or header in brand color to create visual emphasis. Brand violet is earned by interactive affordances and active states, not applied as decoration. Emphasis comes from hierarchy, not hue.

**Hardcoded color values.**
Any `#hex`, `rgb()`, or `rgba()` that isn't a CSS token. Breaks light/dark parity automatically. There is always a semantic token for the intended color — find it.

**Custom status indicators.**
A colored dot, a manually colored icon, a bespoke badge to represent deployment, build, or cluster state. `StatusChip` is the single source of truth for every known state. Custom indicators will be wrong, inconsistent, and inaccessible.

**Whitespace inflation.**
Padding added to make a surface feel "clean" or "premium" in a tool where users are scanning dense data. Whitespace serves legibility and hierarchy, not aesthetics. If removing half the padding doesn't break readability, it shouldn't be there.

**Modals as the first answer.**
A modal for a confirmation, a setting, a form, a detail view. Modals are the lazy path. First ask: can this be inline, in a side panel, in a page of its own, or in a popover? Reach for a modal only after exhausting those options. Never nest modals.

**Identical card grids.**
A grid of same-sized cards each containing icon + heading + description. It is the default AI-generated dashboard layout. If the content can be expressed as a table, a list, or a richer layout — it should be.

**The hero-metric block.**
A large number, a small label, with optional supporting stats and a gradient accent underneath. It's the SaaS dashboard cliché. Acceptable only when the metric is the primary reason a user opens the page.

**Emoji as icons.**
Random emoji in place of real iconography. Mixed emoji styles (flat + 3D + skeuomorphic) in the same surface. Emoji carry platform-specific rendering, inconsistent sizing, and no semantic meaning in a design system context. Use `<Icon>` from the FA Pro kit.

**Fake handwriting and forced authenticity.**
Script fonts used to signal warmth or humanity. "Made with ❤" footers. Tilted cards, taped-on aesthetics, or deliberate imperfection at scale. These patterns read as AI-generated cosplay of human design, not actual craft. Qovery's character comes from precision and calm, not performative personality.
