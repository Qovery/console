# Motion — Qovery Console

## Philosophy

Motion should earn its presence. Every animation must reduce cognitive load, confirm an action, or orient the user in space — not decorate. In a high-frequency operational interface, gratuitous motion is noise that slows expert users down.

**Default: no motion.** Add only when it serves a clear purpose.

---

## Should This Animate at All?

Ask: how often will users see this?

| Frequency                                                                         | Decision                     |
| --------------------------------------------------------------------------------- | ---------------------------- |
| 100+ times/day (keyboard shortcuts, command palette, repeated table interactions) | No animation. Ever.          |
| Tens of times/day (hover effects, dropdowns, list navigation)                     | Remove or drastically reduce |
| Occasional (modals, drawers, toasts, page section reveals)                        | Standard animation           |
| Rare / first-time (onboarding, celebrations, feedback moments)                    | Can add delight              |

**Never animate keyboard-initiated actions.** These are repeated hundreds of times daily. Animation makes them feel slow and disconnected from the user's input.

Every animation must have a clear answer to "why does this animate?". Valid reasons:

- **Spatial orientation** — a modal entering tells the user a new layer appeared
- **State feedback** — a button scaling down on press confirms the interface heard the user
- **Preventing jarring cuts** — elements appearing or disappearing without transition feel broken
- **Status change** — a deployment transitioning from building → deployed should register, not snap

If the answer is "it looks cool" and users will see it often, don't animate.

---

## What Easing Should I Use?

Is the element **entering or exiting**?

- Yes → **ease-out** (starts fast, feels immediately responsive)

Is it **moving or morphing** while already on screen?

- Yes → **ease-in-out** (natural acceleration and deceleration)

Is it a **hover or color change**?

- Yes → **ease** (gentle, symmetrical)

Is it **constant motion** (progress bar, spinner)?

- Yes → **linear**

Default → **ease-out**

**Never use ease-in for UI animations.** It starts slow — the exact moment the user is watching most closely — making the interface feel sluggish. A dropdown with `ease-in` at 300ms _feels_ slower than `ease-out` at the same 300ms.

**Use strong custom curves, not default CSS easings.** The built-ins are too weak. These curves are defined in `tailwind-workspace-preset.js` as Tailwind utilities, and available by cubic-bezier value in Framer Motion:

| Tailwind class   | Value                                   | Use                                                  |
| ---------------- | --------------------------------------- | ---------------------------------------------------- |
| `ease-out-quart` | `cubic-bezier(0.165, 0.84, 0.44, 1)`    | Slide-in entrances, modals, drawers, content reveals |
| `ease-out-quad`  | `cubic-bezier(0.25, 0.46, 0.45, 0.94)`  | Fade-out, exit animations                            |
| `ease-in-quad`   | `cubic-bezier(0.55, 0.085, 0.68, 0.53)` | Fade-in, content appearing                           |

---

## Duration Guide

| Element                      | Duration  |
| ---------------------------- | --------- |
| Hover color / border         | 100–120ms |
| Button press feedback        | 100–160ms |
| Tooltips, small popovers     | 125–200ms |
| Dropdowns                    | 150–250ms |
| Toasts, slide-fade entrances | 300–400ms |
| Modals, drawers              | 350–500ms |

**Keep UI animations under 300ms where possible.** A 180ms dropdown feels more responsive than a 400ms one. Speed directly affects perceived performance — not just feel.

**Scale duration to element size.** A small tooltip can disappear in 150ms and feel crisp. A full-width drawer needs 350–400ms — at 150ms it would feel jarring because the visual weight of the element hasn't had time to land. When an animation feels clunky, the duration is usually too short for the element's size. The larger the element, the longer it needs to feel controlled rather than abrupt.

**Asymmetric enter/exit.** Exits should be faster than entrances. The user triggered the close — the system should respond snappily. A modal can enter at 400ms and exit at 200ms.

---

## Reduced Motion

Reduced motion means fewer and gentler animations — not zero. Keep opacity and color transitions that aid comprehension. Remove position and scale animations.

```css
@media (prefers-reduced-motion: reduce) {
  .animate-slidein-up-sm-faded {
    animation: none;
  }
}
```

In Framer Motion, use `useReducedMotion()` and remove transform-based motion while keeping opacity fades.

Functional motion (focus ring appearance, error state reveal) is exempt — it communicates critical information.
