# Typography — Qovery Console

## Base Rules

- **One font family:** Roboto. No decorative typefaces, no system font fallbacks in product UI.
- **Base body size:** `text-sm` (0.875rem / 14px). The entire console defaults to this — it is not a "small" size, it is the normal size.
- **Common weights:** 400 (`font-normal`) for body, captions, and legends; 500 (`font-medium`) for buttons, titles, badges, and smaller copy that needs weight to stay legible.
- **Monospace:** preserve shared component defaults. Use `font-code` for code and commands; a table, URL, ID, or timestamp does not by itself require monospace.
- **Icons match adjacent text size:** an icon sitting next to `text-sm` gets `text-sm`, next to `text-xs` gets `text-xs`. FontAwesome icons are sized via `font-size`, so the Tailwind text size class controls the icon size directly. Mismatched sizes break the visual baseline and make the icon feel either too heavy or too timid relative to the label.

---

## Type Scale

Use the existing type scale and shared component defaults. The following are common examples, not an exhaustive list.

| Role                 | Class       | Size | Weight        | When to use                                                  |
| -------------------- | ----------- | ---- | ------------- | ------------------------------------------------------------ |
| Page title (H1)      | `text-2xl`  | 24px | `font-medium` | Page-level headings — one per page                           |
| Section title (H2)   | `text-base` | 16px | `font-medium` | Card headers, section breaks                                 |
| Body / default       | `text-sm`   | 14px | `font-normal` | All running content, labels, inputs                          |
| Secondary descriptor | `text-ssm`  | 13px | `font-normal` | Subtitle or supporting text directly below a `text-sm` label |
| Caption / meta       | `text-xs`   | 12px | `font-normal` | Secondary metadata, hints, timestamps                        |
| Table header         | `text-xs`   | 12px | `font-medium` | Column headers in `<TablePrimitives>`                        |

**Jump in size creates hierarchy.** If two labels feel like the same level of importance, they should be the same size — differentiate with weight or color instead of introducing an in-between size.

**The `text-sm` + `text-ssm` pairing** is the most common two-level label pattern in the console: a `text-sm font-medium` primary label above a `text-ssm font-normal` secondary descriptor, separated by `gap-1`. Use this instead of reaching for `text-xs` when the secondary text is still meaningful content rather than pure metadata.

---

## Weight & Contrast

Common weights in the console:

- **`font-normal` (400):** body text, captions, legends, running content
- **`font-medium` (500):** buttons, section titles, badges, and small copy (`text-xs`) that would otherwise feel too light at its size

`font-medium` on `text-sm` running text adds visual noise without improving readability. Reserve it for structural anchors (headings, button labels) and for small text where normal weight reads as whisper.

Match the shared component and comparable usages rather than imposing a blanket weight restriction.

---

## Roboto Mono

Use `font-code` for code and commands. Preserve the typography supplied by shared table components rather than adding monospace to headers, values, or metadata by default.

For ordinary names, labels, descriptions, URLs, and timestamps, follow comparable Console usages.

---

## Scale & Hierarchy

Fewer distinct sizes, more contrast between them.

**The anti-pattern:** three adjacent sizes — `text-sm`, `text-[15px]`, `text-base` — that read as the same level. This creates visual noise without establishing hierarchy.

**The rule:**

- Adjacent levels in a hierarchy should be at least one step apart on the scale
- Use weight or color to differentiate elements at the same size level
- Keep the hierarchy clear and consistent with comparable surfaces

Review whether each size communicates a distinct role rather than enforcing a fixed number of sizes.

---

## Readability & Measure

**Line length:** 60–80 characters for reading text. Dense UI labels don't need this, but descriptions, callout text, and modal body copy should not run to the edge of their container.

**Light-on-dark compensation:** dark mode text at `text-sm` can feel thinner. Lean on `font-medium` for critical labels on dark backgrounds rather than increasing size.

**Paragraph rhythm:** `leading-normal` (1.5) for body copy in descriptions, modals, and empty state copy. `leading-tight` for stacked UI labels — `gap-1` between them is enough.

---

## Typographic Characters

Use the correct typographic characters — not ASCII substitutes.

| Use this               | Not this                  | Context                                                        |
| ---------------------- | ------------------------- | -------------------------------------------------------------- |
| `…` (ellipsis)         | `...` (three dots)        | Truncated text, loading states                                 |
| `"` `"` (curly quotes) | `"` `"` (straight quotes) | Prose, descriptions, modal copy                                |
| `–` (en dash)          | `-` (hyphen)              | Ranges: "3–5 services", "Jan–Mar"                              |
| non-breaking space ` ` | regular space             | Number + unit: "3 GB", "500 ms" — prevents awkward line breaks |

In JSX, use Unicode directly (`…`, ` `) or HTML entities in template strings. Never escape characters that don't need escaping.

---

## Never

- Introduce a font family other than Roboto or Roboto Mono
- Use `text-xs font-normal` for primary interactive labels — too light to anchor attention
- Add intermediate sizes (`text-[15px]`, `text-[13px]`) to split a difference — work within the scale
