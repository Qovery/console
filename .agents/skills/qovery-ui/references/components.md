# Components — Qovery Console

Use this reference to choose components and integrate them consistently.

Shared components live in `libs/shared/ui/src/lib/components/` and are exported through `@qovery/shared/ui`.

For sizes, weights, and spacing, use the typography and spacing references.

## Choose an existing component first

Before implementing a control:

1. Find the shared component that supports the required interaction.
2. Inspect its API and an established working usage.
3. Reuse its variants and behavior before adding custom styling.

Choose by function, not visual resemblance. A select changes a value; a dropdown menu exposes actions; tabs switch views.

Correct local integration problems before changing a shared component. Extend shared behavior only when the existing API cannot meet the requirement, and check the impact on other callers.

## Repeated elements

Use one consistent presentation for a family of similar items: the same icon treatment, title alignment, typography, spacing, and action placement. Vary the design only when the difference communicates meaningful information. Do not decorate one item independently of its siblings.

## Buttons and links

Use `Button` for actions and `Link` for navigation. A link may have button styling through `as="button"`, but it remains navigation.

| Hierarchy | Treatment                           | Limit per page     |
| --------- | ----------------------------------- | ------------------ |
| Primary   | `variant="solid" color="brand"`     | At most one        |
| Secondary | `variant="solid" color="neutral"`   | At most one        |
| Tertiary  | `variant="outline" color="neutral"` | Multiple as needed |

Check existing actions before introducing another primary or secondary action. Apply the same hierarchy check inside dialogs and empty states. Reserve red action styling for destructive actions.

Use consistent button sizes within an action group. Follow the button-group spacing in `spacing-layout.md`.

Use `iconOnly` for icon-only buttons and provide an accessible name. Use `CopyButton` for copying content and its confirmation feedback.

**Don't:**

- Use `ButtonPrimitive` directly in product code.
- Recreate a button with a styled `div`.
- Add another brand primary button simply because an action appears in a separate section.

## Selects, menus, and tabs

| Need                                         | Component or pattern             |
| -------------------------------------------- | -------------------------------- |
| Select a form value                          | `InputSelect`                    |
| Compact selection beside filters or controls | `InputSelectSmall`               |
| Expose a list of actions                     | `DropdownMenu`                   |
| Switch between related views                 | Established `Navbar` tab pattern |

Use selects for filtering and grouping controls. Don't replace them with a custom segmented selector.

For view tabs, follow **Environment overview → List/Pipeline**. Prefer a meaningful icon alongside each tab label, as in Services and Variables; keep icon treatment consistent across sibling tabs. For tabs inside a setup dialog, follow **Secret-manager integration**.

Keep the selected value visible in its control. Avoid adding a second representation that merely repeats it.

Choose widths deliberately across a filter group. Leave enough space between the longest displayed value and the chevron, and verify selected values as well as the default labels. Reuse supported sizing options; inspect the shared select's padding and chevron positioning before adding local overrides. Using the shared select alone does not guarantee label clearance. If it is cramped, compare established working callers to distinguish a local sizing issue from a shared-component defect; assess other callers before changing shared defaults.

**Don't:**

- Use action menus as a substitute for value selection.
- Build tabs from individually styled buttons.
- Override each filter independently until the controls have different heights or alignment.

## Form controls

Use the shared input that matches the value:

| Value or interaction               | Component       |
| ---------------------------------- | --------------- |
| Single-line text                   | `InputText`     |
| Multiline text                     | `InputTextArea` |
| Search                             | `InputSearch`   |
| Selection                          | `InputSelect`   |
| Boolean setting                    | `InputToggle`   |
| Selection checkbox                 | `Checkbox`      |
| Mutually exclusive visible choices | `InputRadio`    |

Use compact input variants for compact control rows, not as a general replacement for standard form fields.

Use component-provided labels, hints, errors, and disabled states. Place supplementary field information, including character counts, in the field's hint area.

For a checkbox with a title and description, associate the label correctly and align the checkbox with the complete content block.

**Don't:**

- Use the deprecated `InputCheckbox` for new work.
- Rebuild floating labels or validation styling.
- Add a separate caption where the component already provides a hint.

## Tables

Use `TablePrimitives`. Use TanStack Table when sorting, selection, filtering, or other table behavior requires it.

Preserve the component's surface, cell spacing, and dividers. Use `text-xs` (12px) for column headers and `text-sm` (14px) for row content, retaining the component-owned code font in the header. `TablePrimitives` header cells currently inherit the table's text size: apply `text-xs` to `Table.Header` or its header row, not to `Table.Root`. Focus other custom work on the row content.

- Style the first identifying item in each row with `font-medium`. Keep supporting content at normal weight.
- Keep supporting text visually secondary without shrinking ordinary content.
- Give independently useful information its own column. Avoid packing the action, resource, type, and full resource hierarchy into one cell when users need to scan those separately.
- Align cell content with its heading and comparable rows.
- Vertically align row actions and selection controls.
- Keep nested actions from accidentally triggering row navigation.
- Use the existing pagination component when pagination is needed.

**Don't:**

- Rebuild the table's styling around the component.
- Wrap an already bordered table in another padded, bordered card.
- Apply monospace to cell values.
- Migrate an unrelated working table solely because it uses the legacy component.

### Tables with multiple views

When tabs switch between table views, reproduce the two-layer construction used by environment variables and the service List/Pipeline view. It is one integrated unit with **two visible rounded outlines**, not a single flat bordered rectangle.

1. **Back layer — tabs:** `rounded-t-lg border-x border-t border-neutral bg-surface-neutral-subtle`. Use `Navbar` and give its wrapper `pb-2` to accommodate the overlap.
2. **Front layer — content:** a sibling positioned with `relative -mt-2`, containing `overflow-hidden rounded-lg border border-neutral bg-surface-neutral`. Its rounded top corners overlap the bottom of the tab layer by 8px. Preserve the distinct tab background and the content's own top border and rounding.
3. **Inside the front layer:** view-specific filters/actions when needed, a divider, then the table header and rows. Pagination sits directly below the last row, with a divider and the same content background.

Keep both layers full-width and aligned at their outer edges. There is no padded gap around an inner table. Scope scrolling to the table content so controls remain accessible.

When the front layer already supplies the content border and rounding, use `Table.Root`'s `containerClassName="border-0 rounded-none"` to avoid a third outline. Remove only the table primitive's redundant wrapper styling, never the front layer's rounded corners.

Construction reference: `apps/console/src/routes/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/variables/route.tsx`. The service overview uses the same overlap with `relative -top-2` and `pb-2` on the tabs wrapper.

## Suggestions and recommended actions

Base recommendations on evidence in the displayed data. Do not infer a problem merely from an absent association or a zero count.

State the useful finding and next step concisely. When the product supports that next step, provide a relevant action or navigation target. If the entire suggestion is actionable, avoid repeating the same destination in a separate link. If an action updates another part of the page, make the result apparent by bringing the affected section into view or providing clear feedback.

## Statuses and pills

Use `StatusChip` for the deployment, build, service, and cluster states it supports. Pass the actual `status`; don't invent a new status mapping or colored dot.

Use `Badge` for compact categories and labels, following the small badge/pill typography in [Typography](typography.md). The current `Badge` supplies `text-xs` but no weight: add `className="font-medium"` at the usage. Choose color according to meaning.

**Don't:**

- Force unrelated business states into `StatusChip`.
- Use status colors as decoration.
- Use deprecated `Tag` for new work.
- Add a badge to information that does not benefit from being distinguished.

## Charts

Reuse the shared `Chart` tooltip wrapper and legend components with a comparable observability integration. Follow `libs/domains/observability/feature/src/lib/local-chart/tooltip.tsx` for tooltip content styling and the [Colors](colors.md) reference for its matched inverted tokens. Inspect `Chart.TooltipContent` before reusing it: its current normal solid background does not match that observability treatment. Do not assume a shared component already meets every convention, or fall back to the library's default tooltip content. A correctly styled hover cursor does not style the tooltip itself.

## Tooltips and callouts

Use `Tooltip` for short supplementary information. Consider an information-icon trigger when permanently displaying the explanation would overcrowd the interface.

Keep information necessary to complete the task visible. A tooltip should supplement the interface, not conceal essential instructions.

Use the compound `Callout` components for information that deserves persistent attention:

- `Callout.Root`
- `Callout.Icon`
- `Callout.Text`
- `Callout.TextHeading`
- `Callout.TextDescription`

Include only the parts the message needs. Keep the message concise. Choose the `Callout.Root` color according to context:

| Context                                           | `color`   |
| ------------------------------------------------- | --------- |
| Neutral guidance or contextual explanation        | `neutral` |
| Information the user should notice                | `sky`     |
| Warning, risk, or a condition requiring attention | `yellow`  |
| Error, failure, or blocking problem               | `red`     |
| Success or confirmation of a positive result      | `green`   |

**Don't:**

- Add a callout for every explanation.
- Recreate a callout using arbitrary borders and colors.
- Use `purple` without an established semantic purpose.
- Rely on hover alone for information attached to an interactive control.

## Dialogs and detail panels

Use the existing `Modal` infrastructure, including `useModal`, for focused tasks and forms.

For tabbed setup dialogs, follow the secret-manager integration's header, tabs, content, and footer arrangement.

For a side detail panel, follow the service catalog's blueprint details implementation. `Sheet` provides the panel presentation; it does not replace the surrounding dialog behavior.

Use the existing confirmation-modal utilities when confirmation is required.

**Don't:**

- Recreate overlay, dismissal, and focus behavior independently.
- Treat every dialog as the same width or composition.
- Copy only the visible panel styling and omit its interaction behavior.

## Loading, empty, and feedback states

Use:

- `Skeleton` for loading content with a known structure.
- `LoaderSpinner` or `LoaderDots` for an ongoing operation.
- `EmptyState` for an empty content area.
- `useToast` from `@qovery/shared/toast` for transient action feedback.

Distinguish loading, failure, no data, and no matching results. Choose the empty-state presentation appropriate to the available area; `EmptyState` provides standard and compact variants.

Apply the page's existing action hierarchy when adding an empty-state action.

## Established usage references

Paths are repository-relative.

| Pattern                     | Source                                                                                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| List/Pipeline tabs          | `apps/console/src/routes/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview/route.tsx` |
| Tabbed setup dialog         | `libs/domains/clusters/feature/src/lib/secret-manager-modals/secret-manager-integration-modal.tsx`                                     |
| Catalog detail panel        | `libs/domains/services/feature/src/lib/blueprint-details-panel/blueprint-details-panel.tsx`                                            |
| Variables table integration | `libs/domains/variables/feature/src/lib/variable-list/variable-list.tsx`                                                               |
| Table row composition       | `libs/domains/services/feature/src/lib/argocd-service-list/argocd-service-list.tsx`                                                    |

## Shared-component changes

Keep generic presentation in `shared/ui` and business-specific behavior in its domain. Do not add new components to legacy `shared/console-shared`.

When adding or extending a shared component, update its relevant stories and verify existing callers. Cover the interaction states affected by the change, including keyboard operation where applicable.
