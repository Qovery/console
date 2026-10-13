# Components — Qovery Console

All shared components live in `libs/shared/ui/src/lib/components/`. Check here before building anything new.

## Reuse and Extend Shared UI

- Check `shared/ui` and its existing callers first. Reuse a component when its **behavior** fits; visual similarity alone does not justify swapping in a component with different interaction semantics.
- Nothing new in `shared/console-shared` (legacy). Generic presentation goes to `shared/ui`, business UI stays in its domain. Do not move business logic into the design system just to avoid `console-shared`.
- Extend a shared component only for a concrete need its API cannot cover. Keep the extension generic and existing callers working.
- Multiple styling variants: follow the existing CVA pattern. Simple conditions do not need a variant.
- Classes: `clsx` for conditional composition, `twMerge` (`@qovery/shared/util-js`) when defaults can conflict with a caller's `className`. No nested template strings.
- Add or update Storybook stories for new shared components and new visual states or variants.

## Verify the Interaction

- Loading, failure, validation, and saving states give clear feedback.
- Clickable controls look clickable. "Draft being checked" is distinguishable from "changes ready to save".
- Read-only fields stay read-only in nested editors and dialogs.
- Leaving with unsaved changes has deliberate behavior; leave-page protection must not block navigation within the draft.
- Test tooltips and popovers from their actual keyboard focus target, including controls nested in clickable rows or links. A focusable parent does not make a hover tooltip keyboard-accessible.

---

## Decision Guide

### "I need a button"

Always use `<Button>`. `ButtonPrimitive` is the internal primitive it wraps — never use it directly in product code.

- `solid` + `brand` → primary CTA
- `outline` or `surface` + `neutral` → secondary / cancel
- `solid` + `red` → destructive actions only
- Icon-only buttons always need `aria-label`

### "I need to show a system status"

Use `<StatusChip status={...} />`. The prop is `status`, not `state`. Never build your own colored dot, badge, or custom indicator for deployment, build, or cluster state. It handles exhaustive matching across all known states via `ts-pattern` — includes optional tooltip and monochrome variant.

### "I need an inline status badge or tag"

Use `<Badge>`. `<Tag>` is deprecated — do not use it. Available colors: `brand`, `green`, `red`, `sky`, `yellow`, `neutral`, `purple`.

### "I need an alert / info box"

Use `<Callout>` — not a custom `div` with a colored border. Always pair it with an icon and a text description; a color-only callout conveys nothing to users with color vision deficiencies.

### "I need a modal / dialog"

Use `<Modal>` via the `useModal()` hook. It includes overlay, focus trap, and correct z-index. Don't wrap Radix Dialog directly — you'll miss the focus trap.

### "I need a tooltip"

Use `<Tooltip>`. For non-interactive status icons in tight spaces, the tooltip content serves as the text alternative. For icon-only buttons, a tooltip is a visual complement but `aria-label` on the button is still required for screen reader accessibility.

### "I need a dropdown menu"

Use `<DropdownMenu>` — wraps Radix Dropdown Menu with keyboard navigation and correct styling. Don't build custom dropdown menus; they won't handle keyboard correctly.

### "I need a form field"

Use components from `inputs/`:

- `<InputText>` — standard text field with floating label
- `<InputSelect>` — select with search
- `<InputTextArea>` — multiline
- `<InputToggle>` — boolean switch
- `<InputCheckbox>` — checkbox
- `<InputRadio>` — radio group

All handle focus state, error state, and label positioning consistently.

**Small variants (`<InputTextSmall>`, `<InputSelectSmall>`)** are for inline contexts where the standard 52px input height creates visual imbalance alongside buttons or other controls. Use only in those specific aligned layouts — not as a general size preference.

### "I need a table"

Use `<TablePrimitives>` — the modern replacement for the deprecated `<Table>`.

### "I need a loading state"

- `<Skeleton>` for content placeholders — mirror the shape and count of the content it replaces so layout doesn't shift when data arrives
- `<LoaderDots>` for inline process indicators
- `<LoaderSpinner>` for page or section loading

Wrap data-fetching components in `<Suspense>` with the skeleton as the fallback.

### "I need an empty state"

Use `<EmptyState>` only for cards or tables that have no data yet. For a search or filter that returns zero results, use inline copy within the list — not the full empty state component. Size the empty state to match what the filled component would occupy; use the small variant inside compact contexts.

### "I need to show a notification"

Use `useToast()` from `@qovery/shared/toast`.

---

## What Not to Use

| Component           | Status             | Replace with                  |
| ------------------- | ------------------ | ----------------------------- |
| `<Tag>`             | Deprecated         | `<Badge>`                     |
| `<Table>`           | Deprecated         | `<TablePrimitives>`           |
| `<IconFa>`          | Deprecated         | `<Icon iconStyle iconName />` |
| `<ButtonPrimitive>` | Internal primitive | `<Button>`                    |
