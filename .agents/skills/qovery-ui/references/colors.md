# Colors — Qovery Console

Use the existing semantic tokens. Choose colors by their role, not by their appearance in one theme.

When using a shared component, select its supported variant and color rather than overriding its internal colors.

## Backgrounds and surfaces

| Token                                | Use                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `bg-background`                      | Main page background                                                   |
| `bg-background-secondary`            | Secondary canvas layer, following the surrounding layout               |
| `bg-surface-neutral`                 | Any content surface sitting above the page background                  |
| `bg-surface-neutral-subtle`          | Subtle separation within a surface or a secondary panel                |
| `bg-surface-neutral-component`       | Contained elements that need separation from their surrounding surface |
| `bg-surface-neutral-componentHover`  | Hover treatment for neutral interactive elements                       |
| `bg-surface-neutral-componentActive` | Pressed or active treatment for neutral interactive elements           |
| `bg-background-overlay`              | Modal backdrop, supplied by the modal infrastructure                   |

Apply `bg-surface-neutral` explicitly to content surfaces above the page background so they remain distinct in dark mode. Match the surrounding page and established component usage; do not add a different background to every nested element.

## Text and icons

| Token                                                         | Use                                                  |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| `text-neutral`                                                | Titles, primary labels, and ordinary content         |
| `text-neutral-subtle`                                         | Descriptions and supporting information              |
| `text-neutral-disabled`                                       | Disabled or unavailable controls                     |
| `text-brand`                                                  | Interactive text and elements only                   |
| `text-positive`, `text-warning`, `text-negative`, `text-info` | Text and icons communicating the corresponding state |

Use the same semantic color for an icon and its associated message unless the shared component defines a different combination. Do not use the disabled color merely to make information less prominent.

## Borders

| Token                                          | Use                                                 |
| ---------------------------------------------- | --------------------------------------------------- |
| `border-neutral`                               | Standard surface boundaries and dividers            |
| `border-neutral-component`                     | Stronger component boundaries                       |
| `border-neutral-componentHover`                | Hovered component boundaries                        |
| `border-brand-strong`, `outline-brand-outline` | Focus treatment where defined by the shared control |
| Semantic status border                         | Boundaries communicating the corresponding state    |

Preserve shared-component focus styling. Do not use colored borders for decorative emphasis.

## Brand and interaction colors

Reserve brand violet for primary actions, active navigation, selection, and focus. `text-brand` is only for interactive text and elements.

Use the shared button variants described in [Components](components.md), rather than manually recoloring buttons. Neutral controls can remain neutral; not every clickable element needs brand color.

## Semantic colors

| Family     | Meaning                               |
| ---------- | ------------------------------------- |
| `positive` | Success, healthy state, or completion |
| `warning`  | Risk or something requiring attention |
| `negative` | Error, failure, or destructive action |
| `info`     | Informational notice                  |

Within each family:

- `text-*` colors the message or status icon.
- `bg-surface-*-subtle` provides a subtle status background.
- `bg-surface-*-component` provides a contained status element's background.
- `bg-surface-*-solid` provides a solid fill.
- `border-*-subtle` and `border-*-component` provide matching boundaries.

Prefer the supported variants of `StatusChip`, `Callout`, and `Badge` for these combinations. Pair color with a label or recognizable status icon so color is not the only indication.

## Inverted surfaces

Use matched inverted tokens:

- `bg-surface-neutralInvert` or `bg-surface-neutralInvert-component` for the surface.
- `text-neutralInvert` for primary text.
- `text-neutralInvert-subtle` for supporting text.
- `border-neutralInvert` when a border is needed.

Tooltips and neutral filled buttons already define these combinations; prefer the shared components. Inverted does not mean always dark: the values change with the theme.

## Charts

Reuse the corresponding observability chart's palette and series conventions. Use semantic colors for semantic states; otherwise follow the existing chart palette without assigning arbitrary status meanings.

## Implementation

Use semantic Tailwind classes. When a library requires a color value, use the existing theme CSS variable. Do not hardcode separate light and dark colors.

Token sources:

- `tailwind-workspace-preset.js`
- `libs/shared/ui/src/lib/styles/base/themes.scss`

## Don't

- Hardcode hex, RGB, or HSL colors in product UI.
- Use raw palette colors or legacy numbered neutrals when a semantic token exists.
- Use status colors as decoration.
- Add brand backgrounds or borders merely to highlight a section.
- Use arbitrary opacity to invent another text or surface shade.
- Manually define light/dark pairs already handled by tokens.
- Give accent tokens a new meaning without established usage.
- Add a new token when an existing role covers the need.
