# Qovery Console — Design Context

## Product context

Qovery is an operational interface for managing infrastructure. Users need to scan information, understand system state, and act confidently. Favor clarity and consistency with established Console patterns.

Keep the interface information-rich without clutter. Page structure should make related information easy to understand and the available actions easy to find.

## Implementation context

| Layer      | Existing foundation                           |
| ---------- | --------------------------------------------- |
| Framework  | React + TypeScript                            |
| Styling    | Tailwind CSS + SCSS                           |
| Variants   | CVA + `twMerge` from `@qovery/shared/util-js` |
| Primitives | Radix UI                                      |
| Icons      | FontAwesome Pro Kit through `Icon`            |

Shared UI components live in `libs/shared/ui/src/lib/components/` and are exported through `@qovery/shared/ui`. Established page implementations live in `apps/console/src/routes/` and `libs/domains/`.

## Design conventions

Use [qovery-ui](../.agents/skills/qovery-ui/SKILL.md) for UI work. Its reference selection covers components, spacing and layout, typography, and colors. Those references own the detailed conventions; this file provides product and implementation context.
