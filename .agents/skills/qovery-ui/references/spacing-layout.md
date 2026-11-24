# Spacing and layout — Qovery Console

Use this reference when building or changing page composition, spacing, or alignment.

## Start with the page pattern

Inspect the closest established page before composing a new layout or adding a sibling view. Reuse its complete structure: section grouping, content widths, spacing rhythm, toolbar placement, separators, content boundaries, and action placement. Reusing the same components inside a different arrangement is not enough to preserve the pattern. The examples below identify layout patterns, not permission to copy unrelated typography, colors, or behavior.

Before placing components, identify the main sections and which elements belong together. Infer the grouping from the task and the closest established page; ask for clarification only when an ambiguity would materially change the composition.

Use tighter spacing within a group and a larger, consistent gap between independent sections. For example, summary metrics and the chart explaining them belong in one group; a detailed table is a separate section.

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

`SettingsHeading` already supplies this separation through `mb-8`. Do not add another `gap-8` between it and the next block. Put the subsequent sections in their own spaced container so their gaps do not double the heading margin.

Reuse the closest existing settings page as a complete composition: form width, section containers, field arrangement, and save-action placement.

For standard settings forms, use `max-w-content-with-navigation-left` and `BlockContent`, following General settings or Deployment rules. Keep the save actions below the form, aligned to its right edge. Do not introduce a wider form, preview sidebar, or sticky action bar without an established matching pattern.

Keep supporting summaries within the relevant section when they can be expressed concisely. A summary does not automatically need its own card or column.

## Usual spacing

Use these values as starting points. Inspect component margins and padding before adding surrounding spacing. Each separation should have one owner: do not stack a parent gap and a component margin for the same space. Check the resulting distance, not just the individual utility values.

| Relationship                      | Usual spacing                    | Application                                                                                                                                               |
| --------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Main section → next main section  | `gap-8` — **32px**               | Environment, organization, and service overview sections                                                                                                  |
| Section heading → section content | `gap-3` to `gap-4` — **12–16px** | Services section uses 12px; top-level catalog sections use 16px. Blueprint category headings use 8px (`gap-2`).                                           |
| List-item title → supporting text | `gap-1` — **4px**                | Closely related `text-sm` lines within a row or compact item. Do not use the section or settings-heading gap here.                                        |
| Icon → regular `text-sm` label    | `gap-1.5` — **6px**              | Compact inline groups, as in breadcrumbs and cluster links in the credentials modal. Larger avatars and other compositions may require different spacing. |
| Consecutive form fields           | **12–16px**                      | General settings use `mb-3`; stacked forms also use `gap-4`. Follow one pattern within the form.                                                          |
| Sibling cards in a catalog grid   | `gap-3` — **12px**               | Service catalog grids                                                                                                                                     |
| Icon block → card text block      | `gap-3` — **12px**               | Blueprint and option cards; preserve the existing gap for other catalog variants                                                                          |
| Card body → bottom action area    | `gap-4` — **16px**               | Blueprint and option cards with a separate action area; `mt-auto` aligns that area across sibling cards.                                                  |

For two closely related lines within a list item, start with normal line-height and no extra gap; use `gap-1` (4px) if they need separation. Do not automatically add `gap-2` (8px) between a `text-sm` title and its metadata. Settings title/description spacing remains 8px as specified above.

Group a compact item's title and supporting text together before spacing that group from its actions or other content. For example, use 0–4px inside the text group and 12px between that group and an inline action below it. Do not apply `space-y-3` to the title, description, and action as three equal siblings: it also inserts 12px between the closely related text lines. A separate card footer follows the card-body-to-action-area spacing above.

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

- **Blueprint and option cards:** `p-4` — 16px. Other catalog variants define their own padding; preserve it.
- **Settings block content:** `p-4` — supplied by `BlockContent`.
- **Settings page:** `px-8 pt-6 pb-8` — 32px horizontal, 24px top, 32px bottom.
- **Secret-manager dialog:** 20px horizontal content inset; footer uses 20px horizontal and 16px vertical padding.

Do not add page padding if the surrounding layout already supplies it. Keep headers, content, and footers aligned to the same horizontal inset within a surface.

Apply that content inset to nested elements such as chart legends as well as headings and body content. Inspect shared components' own padding: add the missing inset where needed without doubling an inset they already supply. Check the rendered alignment of the whole surface, not only each component in isolation.

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
