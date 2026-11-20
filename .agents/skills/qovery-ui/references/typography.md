# Typography — Qovery Console

Use this reference when choosing text sizes, weights, font families, or establishing content hierarchy.

## Base typography

**`text-sm` (14px) is the default Console text size.** Use it for ordinary labels, descriptions, names, and page content.

Use the existing Roboto font. Do not introduce another font family to differentiate a feature or section.

## Sizes and hierarchy

| Level            | Usage                                            | Typography                                           |
| ---------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Page             | One page title                                   | `Heading` level 1: `text-2xl` / 24px, `font-medium`  |
| Section          | One heading per section                          | `Heading` level 2: `text-base` / 16px, `font-medium` |
| Within a section | Card titles, table content, labels, descriptions | `text-sm` / 14px                                     |

Within a section, titles and descriptions generally share the same size: **`font-medium` for titles, `font-normal` for descriptions and ordinary content**. Use the description's secondary text color to support this hierarchy.

Do not automatically shrink a description because it is secondary. Secondary information still needs to be readable.

Avoid introducing three or four sizes inside one card or component. Use the fewest sizes needed to express its structure.

### Small text

Do not introduce standalone `text-xs` labels, descriptions, timestamps, or metadata in page content.

Small text belongs in compact components that already define it, such as pills. Preserve the component's typography rather than reproducing its small-text treatment elsewhere.

Do not introduce `text-ssm` as an automatic intermediate size between a title and its description. Existing component variants may use it; ordinary content should default to `text-sm`.

### Heading semantics

Use the appropriate semantic heading level. A deeply nested heading should not become visually tiny simply because its component default maps that level to `text-xs`. Keep titles within ordinary cards and components at `text-sm` where appropriate.

## Weights

Use weight sparingly and consistently:

- **`font-normal` (400):** ordinary content and descriptions.
- **`font-medium` (500):** titles and the established shared button labels.

Do not substitute `font-medium`, `font-semibold`, and `font-bold` based on a general instruction to make something stronger.

Titles are the usual place for stronger weight. Compact `text-xs` components may also use stronger weight, but follow the specific component's convention; do not apply one weight to every pill.

Do not add weight variations throughout descriptions, metadata, or labels simply to create visual hierarchy. Avoid changing font weight between light and dark themes.

## Text density

Keep visible descriptions concise and direct. Do not compensate for excessive explanation by making the text smaller.

Consider an information-icon tooltip for supplementary explanations when displaying them permanently would overcrowd the interface.

Avoid adding explanatory text underneath every title by default.

## Component boundaries

Inspect the shared component's existing typography before applying an override. Do not independently restyle each instance.

Component-specific conventions belong in `references/components.md`. Table-row emphasis belongs under table usage, not in a global rule for names or copy.

## Source references

- **`Heading`** — heading sizes and exact weight variants: `libs/shared/ui/src/lib/components/heading/heading.tsx`
- **Button variants** — typography by button size: `libs/shared/ui/src/lib/components/button-primitive/button-primitive.tsx`
- **`Badge`** — compact component typography: `libs/shared/ui/src/lib/components/badge/badge.tsx`
- **Table** — component-owned column-heading typography: `libs/shared/ui/src/lib/components/table/table.tsx`

## Don't

- Don't use `font-code`, except for table headings already styled by the table component and commands intended to be copied.
- Don't use standalone `text-xs` to reduce the visual importance of page content.
- Don't automatically make descriptions smaller than their titles.
- Don't introduce three or four text sizes inside a simple card or component.
- Don't make every name or label heavier.
- Don't treat medium, semibold, and bold as equivalent.
- Don't introduce arbitrary sizes such as `text-[15px]`.
- Don't increase font weight specifically for dark mode.
- Don't shrink lengthy explanations to make them fit; shorten them or reconsider where they belong.
