# Spacing & Layout — Qovery Console

## Philosophy

This is a dense product UI. Whitespace serves hierarchy and legibility, not aesthetics. Don't add padding to make something "feel premium" — add it when the content needs room to breathe for readability.

Spacing follows a **4px grid as the default** — most gaps, padding, and margins should be a multiple of 4px. The grid is a guideline, not a law.

**Fine-grained exceptions (2px, 6px) are allowed when they look and feel better.** Typical cases:

- **6px instead of 8px** when 8px feels loose between tightly-related elements — use `gap-1.5`, `p-1.5`, `px-1.5`
- **2px** for the smallest visual nudges — icon-to-label gaps, chip internal padding, optical alignment fixes

Trust your eye. If 6px reads better than 8px, use 6px. If you can't articulate why an off-grid value is better, snap back to the grid.

**Before adding spacing, ask:** does removing it break legibility or make a target too small to hit? If not, remove it.

---

## Visual Rhythm

Spacing is how you communicate relationships. Elements close together belong together. Space between groups signals a shift in topic.

- **Tight grouping for related elements:** 8–12px between siblings
- **Generous separation between distinct sections:** 24-32px
- **Vary spacing within sections** — not every row needs the same gap

**Established conventions from real usage:**

| Context                                   | Value              | Notes                                                                                     |
| ----------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| Title (`text-sm`) + subtitle (`text-ssm`) | `gap-0.5`          | Always. The two sizes are one step apart — `gap-0.5` (2px) keeps them reading as one unit |
| H1 (`text-2xl`) + description (`text-sm`) | `gap-2`            | Always. The size jump is large enough that anything tighter looks crammed                 |
| Label-to-value inline                     | `gap-2`            |                                                                                           |
| Content rows within a card                | `gap-3` or `gap-4` |                                                                                           |
| Small card internal padding               | `p-3` or `p-4`     |                                                                                           |
| Standard card internal padding            | `p-4` or `p-6`     |                                                                                           |
| Fields within a form                      | `gap-4`            |                                                                                           |
| Field groups within a form                | `gap-6`            |                                                                                           |

---

## Card Grid Monotony

Don't default to card grids for everything — spacing and alignment create visual grouping naturally without wrapping everything in a container.

Use cards only when content is truly distinct and actionable. **Never nest cards inside cards.** If a card needs internal sections, use dividers or spacing — not another card layer.

---

## Card with Attached Section

A pattern where the **primary content** sits in its own outlined card, and a secondary section — header row with title and actions, footer with status, summary strip — sits next to it inside a shared outer container. The outer container's border ties them together visually; the inner card's outline makes the primary content read as the focal element.

**Two borders, two roles, two surfaces:**

- **Outer container** — `border border-neutral rounded-lg bg-surface-neutral-subtle` with internal padding (`p-3` or `p-4`). The tinted background is what makes the attached sections recede.
- **Inner card** — its own `border border-neutral` and a stronger surface (`bg-surface-neutral-component`, or plain white in light mode) so it pops against the tinted container. This is the primary, focused content.
- **Attached section(s)** — header above and/or footer below the inner card, inside the same outer container, separated from it by `gap-3` / `mt-3` etc. They have no border and no background of their own — they inherit the outer container's tinted surface, which is what makes them read as "attached" rather than as additional cards.

```tsx
// Header + primary card + attached footer (matches the ArgoCD example)
<div className="flex flex-col gap-3 rounded-lg border border-neutral bg-surface-neutral-subtle p-3">
  {/* Header row — title + actions, inherits the tinted container surface */}
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-medium">ArgoCD running on …</h3>
    <div className="flex gap-2">{/* edit + delete buttons */}</div>
  </div>

  {/* Inner card — own border + stronger surface so it pops against the container */}
  <div className="rounded border border-neutral bg-surface-neutral-component p-3">
    {/* cluster name, metadata */}
  </div>

  {/* Attached footer — inherits the tinted container surface, no border */}
  <div className="flex items-center gap-2 text-xs">
    <Badge color="green">Connected</Badge>
    <span className="text-neutral-subtle">Last update 3 min ago</span>
  </div>
</div>
```

**Rules:**

- Only the **outer container** and the **inner card** carry borders. Header and footer never have their own border or background — that's what makes them read as attached rather than as additional cards.
- The **outer container** gets the tinted surface (`bg-surface-neutral-subtle`); the **inner card** gets a stronger surface (`bg-surface-neutral-component`) so it pops. Don't flip them.
- Use the same border token (`border-neutral`) on both layers — different shades break the visual relationship.
- Spacing between the inner card and the header/footer is `gap-3` (or the parent flex gap of the outer container). Going tighter makes them look fused; going wider makes them feel like separate cards.

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

- Use arbitrary mid-range spacing values (e.g. `gap-5`, `p-5`) — 2px and 6px are the only allowed off-grid exceptions, and only for fine-tuning small elements
- Make all spacing equal — variety creates hierarchy
- Wrap everything in cards — not everything needs a container
- Nest cards inside cards — use spacing and dividers for internal hierarchy
- Default to identical card grids (icon + heading + text, repeated)
- Center everything — left-aligned with asymmetry feels more designed
- Default to the hero metric layout (big number, small label, stats, gradient) as a template — if showing real user data a prominent metric can work, but it must display actual data, not decorative numbers
- Default to CSS Grid when Flexbox would be simpler — use the simplest tool for the job
