# Components — Qovery Console

All shared components live in `libs/shared/ui/src/lib/components/`. Check here before building anything new.

## Reuse and Extend Shared UI

Before creating a component or custom markup, inspect `shared/ui` and existing callers for a suitable component. Reuse it when its behavior fits the need; visual similarity alone does not justify substituting a component with different interaction semantics.

Do not place new UI in `shared/console-shared`, which is being phased out. Keep generic presentation in `shared/ui`, business UI with its owning domain, or consider a dedicated library for a cohesive concept reused across domains. Choose the owner from dependencies and responsibilities rather than moving business logic into the design system just to avoid `console-shared`.

Extend shared components only for a concrete need their current API cannot cover. Keep extensions generic, preserve existing callers, and verify relevant behavior in other flows. Avoid adding unused props or styling tokens in anticipation of future needs.

For components with multiple styling variants, follow the existing CVA and `twMerge` patterns when they clarify the implementation; simple conditions do not automatically need a variant abstraction. Add or update Storybook stories for new shared components and meaningful visual states or variants.

Use `clsx` to compose conditional classes rather than nested template strings or manual string concatenation. Use `twMerge` from `@qovery/shared/util-js` when combining Tailwind classes that may conflict, such as defaults and a caller's `className`. These solve different needs; use both together only when conditional composition and conflict resolution are needed.

## Verify the Interaction

Check the states affected by the change: loading, failure, validation, and saving should give clear feedback. Make clickable controls recognizable and distinguish checking a draft from having changes ready to save.

For editable flows, verify that read-only fields remain read-only in nested editors and dialogs, and that leaving with unsaved changes has deliberate behavior. Preserve navigation within a draft when adding leave-page protection.

Exercise the actual keyboard focus target for tooltips and popovers, including controls nested in clickable rows or links. A hover tooltip does not become keyboard-accessible just because its parent is focusable.

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
