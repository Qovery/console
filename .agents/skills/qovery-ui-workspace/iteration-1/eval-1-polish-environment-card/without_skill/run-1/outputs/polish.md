# Polish Review: `EnvironmentCard`

The component is functional and tidy, but a handful of small refinements would
give it a more polished, "shipped" feel: a clearer visual hierarchy between the
title and supporting metadata, a more inviting hover/focus state, balanced
internal spacing, and keyboard accessibility for what is effectively an
interactive card. None of these change behavior — they sharpen perception.

## Recommended Refinements

| # | Before | After | Why |
|---|---|---|---|
| 1 | `<div onClick={onSelect} ...>` | `<div role="button" tabIndex={0} onClick={onSelect} onKeyDown={(e) => (e.key === 'Enter' \|\| e.key === ' ') && onSelect()} ...>` | The whole card is clickable but invisible to keyboard users. Adding `role`, `tabIndex`, and key handling makes the affordance match the visual without altering behavior. |
| 2 | `border border-neutral` | `border border-neutral-200` | `border-neutral` resolves to a heavy mid-tone in this palette; `neutral-200` is the standard card-border token and gives a softer, less boxed-in edge that matches sibling surfaces in the console. |
| 3 | `cursor-pointer` (no hover/focus styles) | `cursor-pointer transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2` | A clickable card with zero feedback feels inert. A subtle border/bg shift on hover and a visible focus ring add polish and accessibility in one stroke. |
| 4 | `rounded-lg` | `rounded` (or `rounded-md`) | Qovery surfaces standardize on a 4 px radius for cards/inputs. `rounded-lg` (8 px) reads slightly out-of-system here. |
| 5 | `p-5` | `p-4` | 16 px padding aligns with the rest of the console's card density; 20 px makes the card feel underfilled given the short content. |
| 6 | `flex flex-col gap-3` | `flex flex-col gap-2` | With only a header row, a one-line description, and a button row, 12 px gaps read airy. 8 px tightens the cluster and lets `mt-2` on the button row create the deliberate break. |
| 7 | `<h3 className="text-sm font-medium text-neutral-700">{name}</h3>` | `<h3 className="text-sm font-medium text-neutral-400">{name}</h3>` (the darkest text token) | Headings should sit on the darkest neutral; `neutral-700` is a body-text shade in this palette. Bumping the title to `neutral-400` (the high-contrast token) establishes hierarchy against the description below. |
| 8 | `<span className="text-xs text-neutral-600">{serviceCount} services</span>` | `<span className="text-xs text-neutral-350 tabular-nums">{serviceCount} <span className="text-neutral-300">{serviceCount === 1 ? 'service' : 'services'}</span></span>` | Two small wins: `tabular-nums` keeps counts from jittering when the value changes, and pluralization avoids "1 services". Slightly lighter color de-emphasizes metadata vs. title. |
| 9 | `<p className="text-xs text-neutral-500">{description}</p>` | `<p className="text-sm text-neutral-350 line-clamp-2">{description}</p>` | Promote description to `text-sm` so it reads as content rather than caption, and clamp to 2 lines to keep card heights uniform in a grid. |
| 10 | `<div className="flex gap-3 mt-2">` | `<div className="flex gap-2 mt-1">` | 12 px between sibling buttons is loose; 8 px is the standard inline-button spacing. Reducing the top margin lets `gap-2` on the wrapper carry the rhythm. |
| 11 | `<Button variant="surface" ...>View</Button>` + `<Button variant="outline" ...>Deploy</Button>` | Reverse the emphasis: `<Button variant="solid" color="brand" size="sm">Deploy</Button>` first, then `<Button variant="surface" color="neutral" size="sm">View</Button>` | Deploy is the primary intent on an environment card; it should carry the visual weight and lead the row. Two equally neutral buttons leave the user guessing which is the default action. |
| 12 | Click on card AND click on button both trigger flows | Add `onClick={(e) => e.stopPropagation()}` on the button row wrapper | Without this, clicking Deploy also fires `onSelect`. Stopping propagation preserves the card-level click without changing either handler. |
| 13 | No leading icon | Add a small status dot before the name: `<span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />` (color driven by environment state when wired up) | Environment cards in the console typically lead with a status signal. Even a placeholder dot gives the header row a visual anchor and breaks the all-text monotony. |

## Suggested Result

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={onSelect}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
  className="flex flex-col gap-2 p-4 rounded border border-neutral-200 bg-white cursor-pointer transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
      <h3 className="text-sm font-medium text-neutral-400">{name}</h3>
    </div>
    <span className="text-xs text-neutral-350 tabular-nums">
      {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
    </span>
  </div>
  <p className="text-sm text-neutral-350 line-clamp-2">{description}</p>
  <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
    <Button variant="solid" color="brand" size="sm">Deploy</Button>
    <Button variant="surface" color="neutral" size="sm">View</Button>
  </div>
</div>
```

## Summary of Themes

- **Hierarchy.** Strengthen the title, soften the metadata, promote the description, and let the primary CTA (Deploy) carry the action.
- **System fit.** Swap ad-hoc tokens (`border-neutral`, `rounded-lg`, `p-5`, `gap-3`) for the console's standard card values.
- **Interaction feedback.** A clickable card needs hover, focus, and keyboard support — quick wins with outsized polish payoff.
- **Robustness.** Tabular numerals, pluralization, line clamping, and click-propagation guards remove the small papercuts that show up only once real data lands.
