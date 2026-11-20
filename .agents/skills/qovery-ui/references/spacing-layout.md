# Spacing and layout — Qovery Console

Use this reference when building or changing page composition, spacing, or alignment.

## Start with the page pattern

Inspect the closest established page before composing a new layout. Reuse its section structure, content widths, and spacing rhythm. The examples below identify layout patterns, not permission to copy unrelated typography, colors, or behavior.

### Overview pages

Use the environment, organization, and service overviews as composition references:

- **Environment overview:** page header, operational sections, and Services/Pipeline views.
- **Organization overview:** page header followed by primary content and a secondary column.
- **Service overview:** service header followed by distinct operational sections.

These pages commonly use **`gap-8` / 32px between main sections**, with tighter spacing inside each section.

- A section heading and its content belong together.
- Related controls belong together.
- Independent sections need a consistent, larger separation.
- Elements at the same level should follow the same spacing pattern.

Do not add a bordered container merely to establish a section. A heading and spacing may provide enough structure.

### Settings pages

Follow the established settings composition:

1. Setting section title.
2. Concise description underneath.
3. Optional action alongside the heading area.
4. Divider.
5. Setting-specific sections.

Reuse `SettingsHeading` and comparable settings implementations. Its existing spacing provides:

- **8px** between title and description.
- **24px** below the heading content before the divider.
- **32px** between the divider and following content.

Keep form widths and content alignment consistent with other settings pages. Do not stretch a settings form across the available viewport simply because there is room.

## Usual spacing

Use these values as starting points. When a shared component already owns the spacing, preserve its defaults rather than adding another layer.

| Relationship                      | Usual spacing                    | Application                                                                                                                                               |
| --------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Main section → next main section  | `gap-8` — **32px**               | Environment, organization, and service overview sections                                                                                                  |
| Section heading → section content | `gap-3` to `gap-4` — **12–16px** | Services section uses 12px; catalog sections commonly use 16px. Keep equivalent sections consistent.                                                      |
| Compact title → description       | `gap-1` to `gap-2` — **4–8px**   | Catalog headings and cards. Settings heading uses 8px. Match the relevant pattern.                                                                        |
| Icon → regular `text-sm` label    | `gap-1.5` — **6px**              | Compact inline groups, as in breadcrumbs and cluster links in the credentials modal. Larger avatars and other compositions may require different spacing. |
| Consecutive form fields           | **12–16px**                      | General settings use `mb-3`; stacked forms also use `gap-4`. Follow one pattern within the form.                                                          |
| Sibling cards in a catalog grid   | `gap-3` — **12px**               | Service catalog grids                                                                                                                                     |
| Icon block → card text block      | `gap-3` — **12px**               | Blueprint and service catalog cards                                                                                                                       |
| Card body → bottom action area    | `gap-4` — **16px**               | Catalog cards; `mt-auto` keeps the bottom area aligned across cards.                                                                                      |

These values serve different relationships. Do not choose independently between 12px and 16px for every section or field. Choose the matching established pattern and repeat it consistently.

### Button groups

Use the same spacing between buttons of the same size, whether the group appears in a toolbar, footer, or card:

| Button size | Gap between buttons |
| ----------- | ------------------- |
| `sm`        | `gap-1` — **4px**   |
| `md`        | `gap-2` — **8px**   |
| `lg`        | `gap-3` — **12px**  |

This is the target convention for new or updated button groups; existing usages are not yet fully harmonized. It describes the gap between buttons, not the icon-to-label gap inside a button.

### Container padding

Padding separates content from a surface edge; gaps separate siblings.

Common examples:

- **Catalog cards:** `p-4` — 16px.
- **Settings block content:** `p-4` — supplied by `BlockContent`.
- **Settings page:** `px-8 pt-6 pb-8` — 32px horizontal, 24px top, 32px bottom.
- **Secret-manager dialog:** 20px horizontal content inset; footer uses 20px horizontal and 16px vertical padding.

Do not add page padding if the surrounding layout already supplies it. Keep headers, content, and footers aligned to the same horizontal inset within a surface.

## Alignment

- Align section headings and their content to the same left edge.
- Vertically center header actions against the heading block in ordinary section headers. For settings, preserve the established settings-header arrangement.
- Align related controls on the same horizontal axis.
- Center checkboxes and row actions against the complete row content, including descriptions.
- Use consistent column and card alignment rather than manual offsets.

For repeated cards, keep their internal structure consistent. Allow the content area to grow and anchor the bottom area with layout, rather than inserting arbitrary margins.

## Established references

Paths are repository-relative. Inspect the current source.

| Reference                    | What to inspect                                                              | Source                                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Environment overview         | Section hierarchy, heading-to-content spacing, Services/Pipeline arrangement | `apps/console/src/routes/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview/route.tsx` |
| Organization overview        | Main and secondary columns, consistent section spacing                       | `libs/domains/organizations/feature/src/lib/organization-overview/organization-overview.tsx`                                           |
| Service overview             | Operational section spacing                                                  | `libs/domains/services/feature/src/lib/service-overview/service-overview.tsx`                                                          |
| Settings heading             | Title, description, action slot, divider, following spacing                  | `libs/shared/console-shared/src/lib/settings-heading/settings-heading.tsx`                                                             |
| Environment general settings | Page insets, form width, field spacing                                       | `libs/domains/environments/feature/src/lib/settings-general/settings-general.tsx`                                                      |
| Service catalog              | Section and grid gaps                                                        | `libs/domains/services/feature/src/lib/service-new/service-new.tsx`                                                                    |
| Blueprint card               | Internal spacing and bottom action alignment                                 | `libs/domains/services/feature/src/lib/service-new/blueprint-card/blueprint-card.tsx`                                                  |
| Secret-manager dialog        | Consistent header, body, and footer insets                                   | `libs/domains/clusters/feature/src/lib/secret-manager-modals/secret-manager-integration-modal.tsx`                                     |
| Breadcrumbs                  | Compact icon-and-label spacing                                               | `apps/console/src/app/components/header/breadcrumbs/breadcrumb-item.tsx`                                                               |
| Credentials cluster links    | Avatar beside a regular text label                                           | `libs/domains/clusters/feature/src/lib/credentials-list-clusters-modal/credentials-list-clusters-modal.tsx`                            |

## Don't

- **Don't improvise a new page composition** before inspecting the corresponding overview or settings pattern.
- **Don't use the same gap everywhere.** Separate sections more clearly than elements within a section.
- **Don't vary spacing between equivalent sections** without a structural reason.
- **Don't inflate section gaps to 48–96px by default.** Established overview pages commonly use 32px.
- **Don't accumulate parent gaps and child margins** that unintentionally double the intended separation.
- **Don't wrap every section in a card** or add another padded border around an existing component.
- **Don't override component-owned padding and gaps** merely to make one instance look different.
- **Don't use arbitrary pixel offsets to repair alignment** before fixing the layout structure.
- **Don't hide overflow to conceal a sizing problem.**
- **Don't introduce asymmetry or varying card sizes just for visual variety.**
- **Don't impose arbitrary limits on fields, cards, or navigation items as a spacing rule.** Organize the actual content using the appropriate page pattern.
