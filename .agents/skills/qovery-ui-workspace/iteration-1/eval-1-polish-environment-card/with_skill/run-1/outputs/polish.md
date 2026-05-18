# /polish — EnvironmentCard

| Before | After | Why |
| --- | --- | --- |
| `p-5` | `p-4` | `p-5` (20px) is off the 4px grid. `p-4` is the canonical small-card padding per spacing-layout.md. |
| `bg-white` | `bg-surface-neutral-component` | Hardcoded color breaks light/dark parity. The semantic token for a card surface is the neutral component scale. |
| `text-neutral-700` (on title) | `text-neutral` | Legacy palette token used semantically. `text-neutral` is the default body/title text token. |
| `text-neutral-600` (on `{serviceCount} services`) | `text-neutral-subtle` | Legacy palette token; metadata/helper text uses `text-neutral-subtle` (`--neutral-11`). |
| `text-neutral-500` (on description) | `text-neutral-subtle` | Legacy palette token. Secondary descriptor still needs to clear 4.5:1 contrast — `-subtle` is the supported choice, not a lighter step. |
| `text-xs` on the description | `text-ssm` | The description is supporting prose under a `text-sm font-medium` title — this is the canonical `text-sm` + `text-ssm` pairing. `text-xs` is reserved for meta/timestamp-level caption text. |
| Three distinct text sizes on one card (`text-sm`, `text-xs` meta, `text-xs` description) | Two sizes: `text-sm` title, `text-ssm` description, `text-xs` for the `{serviceCount} services` meta only | Typography guide: at most 3 sizes per surface, and adjacent levels need real contrast. Collapsing the description up to `text-ssm` keeps a clean two-step hierarchy with `text-xs` reserved for the meta count. |
| `gap-3` on outer stack | `gap-2` between title-block and description, with the button row separated by the existing flex stack | `gap-3` (12px) is on-grid but uniform spacing flattens the hierarchy. Tightening the title→description gap to `gap-2` signals they belong to the same group, while the button row stays visually separated. |
| `<div className="flex gap-3 mt-2">` (button row) | `<div className="flex gap-2">` (rely on parent `gap-*`, drop `mt-2`) | Mixing `gap-3` on the parent with `mt-2` on a child stacks two spacing systems on top of each other. Let the parent flex gap own vertical rhythm. `gap-2` between the two sibling buttons is the established label-to-value/inline-controls value. |
| `border border-neutral` with no hover feedback on a `cursor-pointer` card | Add `hover:border-neutral-componentHover hover:bg-surface-neutral-componentHover transition-colors` | Interactive surfaces must give hover feedback — `cursor-pointer` alone is not a state. Uses the documented neutral hover tokens so light/dark parity stays automatic. |
| Two equally-weighted `variant="surface" color="neutral"` / `variant="outline" color="neutral"` buttons | Keep "View" as `variant="surface" color="neutral"`, promote "Deploy" to `variant="solid" color="brand"` (or keep outline but flip the order so the primary sits on the right) | Buttons of identical weight create a working-memory tie. Deploy is the primary action — brand violet on the actionable control is exactly what the brand token is reserved for. One primary, one secondary restores 60/30/10. |
| Card title `text-sm font-medium` directly above meta in the same row, both visually competing | Keep the row but drop the meta to `text-xs font-normal text-neutral-subtle` (already close) and ensure the title sits on the visual baseline | Differentiate same-row labels with weight and color, not size jumps — already mostly correct, just confirm meta stays `font-normal` so it reads as secondary. |

## Summary

Eleven refinements, all non-functional: snap to the 4px grid (`p-4`), replace legacy `text-neutral-{500,600,700}` and `bg-white` with semantic tokens, restore the `text-sm` + `text-ssm` pairing for title/description, unify spacing under a single flex gap, add a real hover state to the clickable surface, and break the visual tie between the two footer buttons so the primary action reads as primary.
