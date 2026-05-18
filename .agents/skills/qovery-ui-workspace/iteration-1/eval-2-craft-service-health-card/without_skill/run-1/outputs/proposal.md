# Service Health Summary — Card Design Proposal

## 1. Context and constraints

The Service Health Summary is one of three sibling cards arranged horizontally on a Kubernetes-platform project dashboard. Each card occupies roughly one-third of the row at desktop widths (~360–420 px wide, ~140–160 px tall). The card must therefore feel **compact, glanceable, and informationally dense**, not act as a hero unit. It is a read-only surface: users scan it, then drill into the Services list for action.

Three jobs to be done, in priority order:

1. Answer "is anything on fire right now?" in under one second.
2. Surface the magnitude of any problem (how many services are degraded vs. stopped).
3. Provide temporal context — when did things last go wrong?

The visual hierarchy must therefore lead with **status**, not with the total count. A user with 47 services where 2 are degraded should see the "2 degraded" before they see the 47.

---

## 2. Layout

### Anatomy (top to bottom)

| Zone | Height (approx.) | Content |
|---|---|---|
| Header row | 24 px | Card title on the left, optional kebab/overflow action on the right |
| Primary metric row | 40 px | Total service count + tiny "services" label + status pill aligned right |
| Breakdown row | 28 px | Three inline status segments: running / degraded / stopped |
| Footer row | 20 px | "Last incident · 2h ago" caption with a leading muted dot |

Total card height stays under ~150 px, matching peer cards in the row.

### Spacing

- Outer card padding: `16 px` all sides (matches the project's standard `--spacing-4` card padding).
- Vertical rhythm between rows: `12 px` between header and metric, `8 px` between metric and breakdown, `12 px` before the footer (a slightly larger gap, or a `1 px` divider at neutral-150, to separate the "now" zone from the "recently" zone).
- Horizontal gap between the three breakdown segments: `16 px`.

### Grid behavior in the dashboard row

- At ≥ 1280 px viewport: three equal columns, `gap-4` (16 px) between cards.
- At 1024–1279 px: still three columns, gap reduces to `12 px`; breakdown segments wrap to two lines if needed (running on row 1, degraded+stopped on row 2) before the card itself wraps.
- At < 1024 px: cards stack to a single column; the card retains the same internal layout (no need for a separate mobile spec — it scales naturally).

### Status pill placement

The overall-status pill sits on the right of the primary metric row, vertically centered with the count. This keeps the most-scanned signal (color + word) on the same eye-line as the headline number, while keeping the title row visually clean.

---

## 3. Component choices

Reusing the shared component library wherever possible:

| Slot | Component | Why |
|---|---|---|
| Card container | `Section` / `Card` (standard project card with `rounded-lg`, `border`, `bg-neutral-50` or `bg-white`) | Consistent with peer dashboard cards; do not introduce a new container variant. |
| Title | `Heading` size `text-sm font-medium` (or existing `CardTitle`) | Matches sibling cards' header treatment. |
| Overflow action | `DropdownMenu` triggered by an `Icon` button (kebab), only if there are real actions (e.g., "View all services", "Filter by status"). Omit entirely if there are none — empty affordances are clutter. | |
| Headline number | Plain `<span>` with display typography token | Counts should not look like links or badges. |
| Overall status pill | `Badge` (existing component) with semantic color variants `green` / `yellow` / `red` / `neutral` | Already in the design system; do not invent a new pill. |
| Status segment dot | `Indicator` / colored `div` (8 px circle) inline before each label | Lightweight, no component needed; matches Qovery's existing status-dot pattern in the Services list. |
| Footer timestamp | `Tooltip` wrapping a muted `<time>` | The relative string ("2h ago") is shown; absolute ISO timestamp surfaces on hover. |
| Empty state | Same card, but headline becomes `0`, pill is hidden, breakdown row replaced with a single muted line "No services in this project yet" and a small inline `Button size="sm" variant="ghost"`: "Create a service" | Compact, no illustration — the card must not balloon. |

No new components are required. The shared `Badge` and existing dashboard `Card` cover this card's needs.

---

## 4. Typography

Using the project's existing type tokens (Tailwind / shared scale):

| Element | Token | Rendered | Weight | Color token |
|---|---|---|---|---|
| Card title ("Service health") | `text-sm` | 14 / 20 | `font-medium` (500) | `text-neutral-400` |
| Headline number ("47") | `text-3xl` | 30 / 36 | `font-semibold` (600), tabular numerals | `text-neutral-400` |
| "services" suffix | `text-sm` | 14 / 20 | `font-normal` (400) | `text-neutral-350` |
| Overall status pill text ("Degraded") | `text-xs` | 12 / 16 | `font-medium` (500) | semantic on tint |
| Breakdown segment count + label ("42 running") | `text-sm` | 14 / 20 | count `font-medium`, label `font-normal` | count `text-neutral-400`, label `text-neutral-350` |
| Footer caption ("Last incident · 2h ago") | `text-xs` | 12 / 16 | `font-normal` | `text-neutral-350` |

Two enforced details:

- **Tabular numerals** (`font-variant-numeric: tabular-nums`) on every numeric token. Counts changing from `9` to `10` should not cause horizontal jitter.
- **No more than two type sizes drawing the eye**: only the headline `text-3xl` and the title `text-sm`. The footer is intentionally `text-xs` so it recedes.

---

## 5. Color decisions

### Semantic palette (reusing existing tokens)

| Status | Pill background | Pill text | Dot fill | Meaning |
|---|---|---|---|---|
| All healthy | `bg-green-50` | `text-green-600` | `bg-green-500` | 100% of services running |
| Degraded | `bg-yellow-50` | `text-yellow-700` | `bg-yellow-500` | At least one service in a non-fatal unhealthy state (crash-looping, partial replicas, warning probes) |
| Critical | `bg-red-50` | `text-red-600` | `bg-red-500` | At least one service fully stopped/failed when it should be running |
| Empty / unknown | `bg-neutral-100` | `text-neutral-400` | `bg-neutral-300` | No services yet, or status not reportable |

### Overall pill selection logic

The pill reflects the **worst** status present, in this order: Critical > Degraded > Healthy. This matches Kubernetes operator mental models (one red pod ruins the deployment) and aligns with how the Services list already aggregates.

### Restraint rules

- Color is used **only** on the status pill, the three status dots, and (optionally) the headline number when the overall state is critical. Everywhere else: neutrals.
- Do **not** tint the entire card background based on status. A row of three cards each shouting in a different hue is hostile; color belongs on the smallest meaningful element.
- The status dot for a count of `0` is rendered at `bg-neutral-200` regardless of semantic — a zero degraded count should not glow yellow.
- Dark mode: swap the `-50` tint backgrounds for `/15` alpha variants of the same hue against `bg-neutral-700`, keep dot fills at the same `-500` value (they remain legible on dark).

### Accessibility

- All text/background combinations clear WCAG AA at the rendered sizes (the project's existing semantic tokens are already audited).
- The status is never communicated by color alone: the pill always carries a text label ("Degraded"), and each breakdown segment shows its count and word.

---

## 6. Copy

### Tone

Operator-grade, terse, lowercase status words, no exclamation. Strict word economy — every character competes for ~360 px of width.

### Strings

| Slot | Copy | Notes |
|---|---|---|
| Card title | **Service health** | Two words. Avoid "Service Health Summary" — the word "Summary" is implied by the card format and wastes space. |
| Headline suffix | `services` (lowercase, singular form `service` when count is 1) | Pluralization handled at render time. |
| Overall pill (all green) | **Healthy** | Not "All good", not "OK" — matches Kubernetes vocabulary. |
| Overall pill (some degraded) | **Degraded** | |
| Overall pill (any stopped/failed) | **Critical** | Stronger than "Issues" or "Problems"; engineers expect this word. |
| Overall pill (empty) | _hidden_ | Do not show a neutral "No data" pill — absence is the signal. |
| Breakdown segment — running | `42 running` | |
| Breakdown segment — degraded | `3 degraded` | |
| Breakdown segment — stopped | `2 stopped` | Prefer "stopped" over "down" or "failed" — it matches the verb users see on the Services list (Stop / Restart). |
| Footer (with incident) | `Last incident · 2h ago` | Middle-dot separator. Use relative time up to 30 days, then fall back to `May 14`. Tooltip shows full ISO timestamp. |
| Footer (no incident in window) | `No incidents in the last 30 days` | Positive framing, bounded so it doesn't read as "ever". |
| Footer (brand-new project) | `No incidents yet` | |
| Empty state body | `No services in this project yet` + ghost button `Create a service` | |
| Overflow menu items (if shown) | `View all services`, `Filter by status` | |

### Microcopy rules applied

- Numerals before words ("3 degraded", not "Degraded: 3") — scanning eyes catch the count first.
- No trailing punctuation in any of these strings.
- Avoid the word "currently" — implied by the card.
- Avoid "Total:" prefix on the headline — the size already says "this is the total".

---

## 7. Interaction notes (light)

- The whole card is **not** a single link. Instead, the title is a quiet link to the full Services list (hover underline only), and each breakdown segment is a link that pre-filters the Services list by that status. This keeps the card scannable while making the numbers actionable.
- Hover on the timestamp reveals the absolute ISO time via tooltip.
- Loading state: replace the headline, pill, and breakdown row with shimmer skeletons of the same dimensions; do not collapse the card. The footer skeleton is a 120 × 12 bar.
- Error state (API failure): keep the title, replace the body with a single muted line "Couldn't load service health" and an inline ghost `Retry` button. No red card border, no toast — this card is one of three and must fail quietly.

---

## 8. Why this design holds up next to two sibling cards

The three-card row works only if the cards are visually **isomorphic**: same height, same padding, same title treatment, same footer slot. This proposal deliberately mirrors a generic dashboard-card skeleton (title → big number → secondary breakdown → footnote) so that whichever two cards sit alongside it — deployments-per-day, cost, cluster CPU, whatever — the row reads as a single unit rather than three competing posters. Color and emphasis are spent only where they earn their keep: the status pill and the status dots. Everything else stays neutral so the eye can find the one thing that matters when something is wrong.
