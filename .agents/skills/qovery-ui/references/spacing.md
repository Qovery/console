# Spacing & Layout — Qovery Console

## Philosophy

This is a dense product UI. Whitespace serves hierarchy and legibility, not aesthetics. Don't add padding to make something "feel premium" — add it when the content needs room to breathe for readability.

Spacing follows a **4px grid** — every gap, padding, and margin should be a multiple of 4px.

**Before adding spacing, ask:** does removing it break legibility or make a target too small to hit? If not, remove it.

---

## Visual Rhythm

Spacing is how you communicate relationships. Elements close together belong together. Space between groups signals a shift in topic.

- **Tight grouping for related elements:** 8–12px between siblings
- **Generous separation between distinct sections:** 48–96px
- **Vary spacing within sections** — not every row needs the same gap
- **Asymmetric compositions** — break the predictable centered-content pattern when it makes sense

**Established conventions from real usage:**

| Context                                   | Value              | Notes                                             |
| ----------------------------------------- | ------------------ | ------------------------------------------------- |
| Title (`text-sm`) + subtitle (`text-ssm`) | `gap-1`            | Tightest readable gap between stacked label sizes |
| Label-to-value inline                     | `gap-2`            |                                                   |
| Content rows within a card                | `gap-3` or `gap-4` |                                                   |
| Small card internal padding               | `p-3` or `p-4`     |                                                   |
| Standard card internal padding            | `p-4` or `p-6`     |                                                   |
| Fields within a form                      | `gap-4`            |                                                   |
| Field groups within a form                | `gap-6`            |                                                   |

---

## Card Grid Monotony

Don't default to card grids for everything — spacing and alignment create visual grouping naturally without wrapping everything in a container.

Use cards only when content is truly distinct and actionable. **Never nest cards inside cards.** If a card needs internal sections, use dividers or spacing — not another card layer.

Vary card sizes, span columns, or mix cards with non-card content to break repetition. A grid of identical cards (icon + heading + text, repeated) is the most recognizable sign of an undesigned layout.

---

## Card with Attached Section

A card where a secondary section — filter row, status bar, summary strip — is visually fused to the top or bottom of the card. Both appear as one bordered unit with a single continuous outline.

**The technique: `overflow-hidden` on the parent card.** This clips children to the card's border radius automatically. You never manually set inner radii, and the shared border collapses into one visual line.

```tsx
// Section attached at the bottom (e.g. "3 issues affecting services")
<div className="rounded-lg border border-neutral overflow-hidden">
  <div className="p-4">
    {/* main card content */}
  </div>
  <div className="border-t border-neutral bg-surface-negative-subtle px-4 py-3">
    3 issues affecting services
  </div>
</div>

// Section attached at the top (e.g. filter badges above a table)
<div className="rounded-lg border border-neutral overflow-hidden">
  <div className="border-b border-neutral bg-surface-neutral-subtle px-3 py-2">
    {/* badges, filters, tabs */}
  </div>
  <div>{/* main content */}</div>
</div>
```

**Rules:**

- The attached section shares the same `border-neutral` color as the card — reads as one border, not two
- `overflow-hidden` on the parent is required — without it, the child's background bleeds past the card radius
- Don't manually add `rounded-t-*` or `rounded-b-*` to the child — `overflow-hidden` handles it
- The attached section background can be any surface token depending on context

---

## Concentric Border Radius

The most common "feels off" tell.

**Rule: outer radius = inner radius + padding.**

Example: a card with `rounded-2xl` (16px) and `p-2` (8px) padding → the inner element should be `rounded-lg` (8px). Mismatched nested radii break the visual relationship between surfaces.

---

## Optical vs. Geometric Alignment

Geometric centering often looks off. Adjust for perceived visual weight.

- **Play triangle in a circle:** nudge right — the triangle's visual center is not its geometric center.
- **Button with icon + text:** use slightly less padding on the icon side. Rule of thumb: icon-side padding = text-side padding − 2px.

```tsx
<button className="flex items-center gap-2 pl-4 pr-3.5">
  <span>Continue</span>
  <ArrowRightIcon />
</button>
```

- **Asymmetric icons** (stars, arrows, carets): best fixed in the SVG directly. Fallback: `margin-left: 1px` or similar.
- **Heavy glyph next to a light one:** optical baseline shift.

When in doubt, trust your eye over the math.

---

## The Working Memory Rule

Humans can hold ≤4 items in working memory at once (Miller's Law, revised by Cowan 2001).

At any decision point, count the distinct options, actions, or pieces of information a user must simultaneously consider:

| Items | Status               | Response                                    |
| ----- | -------------------- | ------------------------------------------- |
| ≤4    | Within limits        | Manageable as-is                            |
| 5–7   | Pushing the boundary | Consider grouping or progressive disclosure |
| 8+    | Overloaded           | Users will skip, misclick, or abandon       |

**Practical applications:**

- **Navigation menus:** ≤5 top-level items — group the rest under clear categories
- **Form sections:** ≤4 fields visible per group before a visual break
- **Action buttons:** 1 primary, 1–2 secondary, group the rest in a menu
- **Dashboard widgets:** ≤4 key metrics visible without scrolling
- **Pricing tiers:** ≤3 options — more causes analysis paralysis

---

## Never

- Use arbitrary spacing values outside the 4px grid
- Make all spacing equal — variety creates hierarchy
- Wrap everything in cards — not everything needs a container
- Nest cards inside cards — use spacing and dividers for internal hierarchy
- Default to identical card grids (icon + heading + text, repeated)
- Center everything — left-aligned with asymmetry feels more designed
- Default to the hero metric layout (big number, small label, stats, gradient) as a template — if showing real user data a prominent metric can work, but it must display actual data, not decorative numbers
- Default to CSS Grid when Flexbox would be simpler — use the simplest tool for the job
