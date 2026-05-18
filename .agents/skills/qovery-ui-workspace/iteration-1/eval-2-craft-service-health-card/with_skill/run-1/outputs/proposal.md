# Service Health Summary — Design Proposal

A compact dashboard card showing project-wide service health: total count, status breakdown (running / degraded / stopped), and the timestamp of the last incident. The card lives in a three-column row at the top of the project dashboard, so it must read as a peer — not a hero unit. The user goal is a five-second glance: "Is my project healthy right now, and when did it last hurt?"

---

## 1. Layout Skeleton

A single `<Card>` primitive — no nested cards, no internal sub-cards. Standard small-card padding (`p-4`) keeps it dense alongside its siblings.

Vertical rhythm, three zones, stacked top to bottom:

1. **Header row** — section title on the left, total count on the right (label/value inline). Both on the same optical baseline. `text-base font-medium` for the title; the count sits to the right using `font-mono` because it is a tabular value.
2. **Status breakdown row** — three inline status entries (running / degraded / stopped) laid out as a flex row with `gap-4`. Each entry is a `<StatusChip>`-style indicator paired with a mono-aligned count. This is the "data spine" of the card.
3. **Footer meta** — single line of `text-xs` metadata: "Last incident · 2 hours ago". Separated from the breakdown by `gap-3` so it reads as supporting context, not a fourth peer.

Hierarchy goes: title + total (anchor) → breakdown (signal) → meta (context). Three levels, three sizes — within the typography budget.

No big hero number. The "total" sits inline next to the title because the breakdown is the real signal — the total alone doesn't tell you whether the project is healthy.

**Working memory check:** four distinct facts visible at once (total, running, degraded, stopped) plus one meta line. We are at the edge of Miller's 4-item limit. Mitigation: the three status entries read as one grouped row (a single chunk via spatial grouping), not three independent decisions — keeping the cognitive load at ~3 chunks.

---

## 2. Component Choices

| UI need                       | Component                                                        | Why                                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card container                | `<Card>` (or a `rounded-lg border border-neutral` wrapper)       | Shared primitive; distinct actionable content in a dashboard row.                                                                                                    |
| Status indicators per state   | `<StatusChip status="..." />` in monochrome / icon-only variant  | Canonical component for system state. Exhaustively matches Qovery service states. Never roll a custom colored dot — `<StatusChip>` already handles tooltip + a11y.   |
| Last-incident timestamp       | Plain text + `<Tooltip>` wrapping the relative time              | Tooltip surfaces the full ISO timestamp on hover; the visible label stays compact ("2 hours ago"). No new component needed.                                          |
| Loading state                 | `<Skeleton>` mirroring the three-zone layout                     | Matches the shape so the card doesn't shift when data arrives.                                                                                                       |
| Empty state (no services yet) | `<EmptyState size="sm">` (small variant)                         | Card-sized empty state; small variant fits the compact footprint. Skip the full hero treatment.                                                                      |
| "View all" affordance         | None inside the card — the card itself is the link, or omit it   | Avoids a fourth interactive choice. If the card is clickable, the whole surface routes to the services list; no extra button needed.                                 |

Deliberately **not** used: `<Badge>` for the status row (a `<StatusChip>` is the right semantic), `<Callout>` for the incident line (it would imply an active alert, which this isn't), `<Tag>` (deprecated).

---

## 3. Typography

Three sizes total — within the per-surface budget.

| Element                  | Size + weight                       | Notes                                                                                  |
| ------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------- |
| Card title               | `text-base font-medium`             | Section-title role. "Service health".                                                  |
| Total count value        | `text-base font-medium font-mono`   | Same size as the title — anchored to the header baseline. Mono so the digit aligns.    |
| Status row label         | `text-sm font-normal`               | Body default. "Running", "Degraded", "Stopped".                                        |
| Status row count         | `text-sm font-medium font-mono`     | Medium weight on a small numeric is the legibility exception called out in the type rules. Mono for column-style alignment when counts are read across. |
| Footer meta              | `text-xs font-normal`               | Caption tier. "Last incident · 2 hours ago".                                           |
| Footer timestamp value   | `text-xs font-normal font-mono`     | Mono for the time portion — it's data.                                                 |

No `text-2xl` hero number. No intermediate sizes. The title and the total share a size to read as a unit; the breakdown drops one step; the footer drops one more.

---

## 4. Color Decisions

Semantic tokens only. Status colors do exactly one job: communicate status.

| Surface / element                | Token                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| Card background                  | default surface (no token override — sits on the page canvas)                               |
| Card border                      | `border-neutral`                                                                            |
| Card title                       | `text-neutral`                                                                              |
| Total count                      | `text-neutral`                                                                              |
| "Running" indicator              | `<StatusChip>` resolves to positive — equivalent to `text-positive` / `bg-surface-positive-solid` dot |
| "Degraded" indicator             | `<StatusChip>` resolves to warning — equivalent to `text-warning`                            |
| "Stopped" indicator              | `<StatusChip>` resolves to neutral — equivalent to `text-neutral-subtle` (stopped is intentional, not an error) |
| Status row labels                | `text-neutral-subtle`                                                                       |
| Status row counts                | `text-neutral`                                                                              |
| Footer meta label                | `text-neutral-subtle`                                                                       |
| Footer timestamp                 | `text-neutral` (slightly stronger than the label to make the value scannable)               |
| Hover (if card is clickable)     | `hover:bg-surface-neutral-subtle`, no border color change                                   |
| Focus ring (if clickable)        | default ring — never suppressed                                                             |

**Stopped is neutral, not negative.** A stopped service is a user-initiated state, not a failure. Color it as negative and every paused-on-purpose service will look like a fire.

**Brand violet does not appear on this card.** It's read-only summary content; there's no primary action to anchor.

If "Last incident" needs to draw the eye when recent (< 1 h), escalate via a small `<StatusChip>` with the warning status inline before the timestamp — not by tinting the whole footer. Color-only state is banned regardless.

---

## 5. Copy Suggestions

| Slot                       | Copy                                          | Notes                                                                                  |
| -------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Card title                 | Service health                                | Sentence case, no period. Names the topic, not the action.                             |
| Total count label          | (inline with count) — e.g. `12 services`      | Pluralize correctly. Singular form: `1 service`.                                       |
| Status labels              | Running · Degraded · Stopped                  | Sentence case. Match the vocabulary `<StatusChip>` already uses elsewhere.             |
| Footer meta                | Last incident · 2 hours ago                   | Use a middle dot `·` as the separator, not a hyphen. Relative time, no period.         |
| Footer meta — never        | Last incident · 2025-05-15T14:32:00Z          | Don't show raw ISO inline. Put it in the tooltip.                                      |
| Tooltip on timestamp       | May 15, 2026 at 14:32 UTC                     | One line, no period (per tooltip rule).                                                |
| No-incidents state         | No incidents in the last 30 days              | States the window so the absence has meaning. Don't say "All good!" — too cheerful.    |
| Empty state — heading      | No services yet                               | Names the missing thing.                                                               |
| Empty state — body         | Deploy a service to start tracking its health.| What's missing + why it matters + how to fix it, in one line.                          |
| Empty state — CTA          | Create service                                | Verb + object, 2 words.                                                                |
| Loading                    | (no text — `<Skeleton>` only)                 | Don't show "Loading…" copy; the skeleton is the affordance.                            |

**Avoid:** "Service Health Summary" as a visible title — title case, redundant "Summary". "All systems operational" — borrowed from status pages, too marketing-flavored for an in-product card. "0 errors" framed as a positive — count what exists (running services), not what's absent.

---

## Constraints Re-checked

- **Compact, not hero:** no oversized number, no gradient, no decorative iconography. Card padding stays at `p-4`. Three siblings in a row will read as peers.
- **Three sizes only:** `text-base`, `text-sm`, `text-xs`.
- **Semantic color discipline:** positive / warning used only on `<StatusChip>` indicators. Stopped is neutral. No brand violet.
- **Working memory:** four data points, grouped spatially into ~3 chunks (title+total / breakdown row / meta).
- **A11y:** `<StatusChip>` carries label + tooltip, so status is never color-only. Tooltip on the relative timestamp exposes the full value. If the card is clickable, focus ring stays default.

---

## Open Questions for Design Review

1. **Is the card clickable as a whole?** If yes, it routes to a filtered services view. If no, drop the hover state entirely and reduce the card to a pure summary surface.
2. **Should "degraded" include both `WARNING` and `DEPLOYING` states, or just runtime degradation?** Affects what `<StatusChip>` statuses get rolled into the count.
3. **Last-incident window** — last 24 h, 7 d, 30 d? The empty-state copy assumes 30 d. Pick one and label it (e.g. "Last incident · 30 d").
4. **Trend over time** — out of scope for this card per the brief, but worth a follow-up: a tiny sparkline of incident frequency could fit in the footer without breaking the compact constraint.
