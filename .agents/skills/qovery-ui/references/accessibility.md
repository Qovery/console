# Accessibility — Qovery Console

## Non-Negotiables

These are blocking issues in design review. Every component must pass them.

1. **No color-only state.** Status, errors, and interactive states must combine color with an icon, text, or shape change.
2. **Visible focus ring on every interactive element.** The design system provides this via `focus-visible:outline-2`. Never suppress it.
3. **Icon-only controls have text alternatives.** The requirement depends on whether the element is interactive: **interactive controls** (buttons, links) always require `aria-label` — a tooltip alone is not sufficient because it doesn't provide an accessible name. **Non-interactive status icons** (decorative or informational): tooltip is sufficient as the text alternative.
4. **Keyboard navigation works without a mouse.** All interactive elements are reachable and operable via keyboard.

---

## Color-Only State — The Rule and Its Fixes

Users with color vision deficiencies can't distinguish red from green from gray. Every status signal must pair color with at least one other cue: an icon, a text label, or — when space is too tight for either — a tooltip.

**When space allows:** prefer icon + color, or text + color. Both are fully sufficient.  
**When space is constrained** (e.g., a status column in a dense table): icon + color + tooltip is acceptable. The tooltip becomes the text alternative and must be present on both hover and keyboard focus.

| Pattern                                         | Fix                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Red text error below a field                    | Keep the text — it's sufficient on its own.                                                |
| A colored dot indicating running / stopped      | Use `<StatusChip>` — it includes an icon SVG and has a built-in tooltip.                   |
| A green badge for "healthy"                     | `<Badge color="green">Healthy</Badge>` — the text carries meaning, color reinforces it.    |
| A yellow border on a form to indicate "warning" | Add a `<Callout>` or a text hint — the border alone is invisible to some users.            |
| An icon-only status in a tight table cell       | Wrap in `<Tooltip>` with the status name as content — the tooltip is the accessible label. |

```tsx
// When you only have room for an icon, add a tooltip
<Tooltip content="Deployment failed">
  <Icon iconStyle="solid" iconName="circle-xmark" className="text-negative" />
</Tooltip>
```

**StatusChip is the system's single source of truth for status.** It already bundles the icon, color, and tooltip — never create a custom colored indicator for deployment, build, or cluster state.

---

## Focus Management

| Situation                     | How to handle                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Button or interactive control | `ButtonPrimitive` provides `focus-visible:outline-2` automatically. Never override with `focus:outline-none`. |
| Custom interactive element    | Add `focus-visible:outline-2 focus-visible:outline-brand-strong` via Tailwind directly.                       |
| Modal or drawer               | `<Modal>` traps focus via Radix Dialog. Don't build custom modals — they'll miss this.                        |
| Route change                  | TanStack Router handles scroll and focus reset. Don't suppress it.                                            |

---

## ARIA

| Situation                   | What to do                                                                     |
| --------------------------- | ------------------------------------------------------------------------------ |
| Icon-only button            | `aria-label="Action name"` on the button                                       |
| Button with tooltip         | `<Tooltip>` handles `aria-describedby` — no manual wiring needed               |
| Loading state               | `aria-busy="true"` on the region being loaded                                  |
| Error message below a field | `<InputText>` handles `aria-describedby` linking to the hint — don't bypass it |
| Expandable row or section   | `aria-expanded={isExpanded}` on the trigger                                    |
| Live status chip            | `role="status"` if the value updates dynamically                               |
| Selectable list             | Use Radix components — don't build custom `role="listbox"`                     |
| `<button>` element          | No `role="button"` — it's redundant                                            |
| Element with visible text   | No `aria-label` — the text is sufficient                                       |
| Interactive element         | Never `aria-hidden="true"` — it removes it from keyboard navigation            |

---

## Keyboard Navigation

### Minimum requirement

Every interactive element reachable by `Tab` key. Tab order follows visual order (left-to-right, top-to-bottom). No keyboard traps outside of intentional modal overlays.

### Dropdowns and menus

Use `<DropdownMenu>` — it inherits Radix's keyboard nav (arrows, Enter, Escape). Don't build custom dropdown menus; they won't handle keyboard correctly.

---

## Motion and Reduced Motion

Any decorative animation must include a `prefers-reduced-motion: reduce` fallback. See `references/motion.md` for patterns. Functional motion (e.g., focus indicator appearance) is exempt.
