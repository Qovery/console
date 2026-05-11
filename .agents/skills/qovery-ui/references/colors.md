# Colors — Qovery Console

## The Rules

1. **Always prefer Tailwind utilities.** Use `bg-surface-brand-solid`, `text-negative`, `border-neutral` etc. wherever Tailwind classes are applicable. CSS variables (`var(--brand-9)`) are the fallback for contexts where Tailwind classes can't be used — inline styles, `keyframes`, SCSS, or dynamic JS values.
2. **Never hardcode hex or rgba.** Every color value must come from a Tailwind utility or a CSS token.
3. **Status colors are semantic only.** `positive`, `warning`, `negative`, `info` exist to communicate system state. Using them to make a header "pop" is a bug.
4. **Brand violet is concentrated.** It belongs on actionable controls and active-state markers. Not on decorative borders, not as a background wash.
5. **Light/dark parity is automatic.** If you use the right token, you get both themes for free. If you hardcode, you break one.

---

## Design System First

Before touching any color value, check for existing tokens, CSS variables, or theme config. Propose changes using the existing system — never override with one-off values, never add new tokens without a design decision behind them.

---

## Contrast

| Context                             | Minimum ratio              | Common failure                           |
| ----------------------------------- | -------------------------- | ---------------------------------------- |
| Body text                           | 4.5:1 (WCAG AA)            | Light gray on white                      |
| Large text (≥ 18.66px or 14px bold) | 3:1                        | Section headers on subtle backgrounds    |
| Interactive element boundary        | 3:1                        | Outline buttons on colored surfaces      |
| Focus ring                          | 3:1 against adjacent color | Brand ring on brand background           |
| Placeholder text                    | 4.5:1                      | Default gray placeholder — usually fails |

Gray text on colored backgrounds looks washed out. Use a darker shade of the background hue, or transparency — never a generic neutral lifted from the neutral scale.

Don't eyeball contrast. Test with Stark, Contrast app, or browser devtools.

---

## Accent Color & 60/30/10

One primary accent, used sparingly. An interface where everything pops has nothing that pops. Save the accent for the primary action and critical signals.

**60/30/10** (visual weight, not pixel count):

- **60%** — neutral backgrounds, base surfaces, white space
- **30%** — text, borders, inactive states
- **10%** — accent: CTAs, highlights, focus states

The common mistake is using brand violet everywhere because "it's the brand color." Overuse kills its power.

---

## Token Architecture

CSS custom properties live in `libs/shared/ui/src/lib/styles/base/themes.scss`.  
Tailwind utilities are wired in `tailwind-workspace-preset.js`.

### Scale Structure (Radix-style 1–12)

Each semantic color has a 12-step scale:

| Step | Purpose                                                            |
| ---- | ------------------------------------------------------------------ |
| 1    | App background tint                                                |
| 2    | Subtle surface                                                     |
| 3    | UI element background (component surface)                          |
| 4    | Hovered UI element                                                 |
| 5    | Active / pressed UI element                                        |
| 6    | Subtle border                                                      |
| 7    | Component border (alpha variant available)                         |
| 8    | Hovered border                                                     |
| 9    | **Solid background** (the canonical "brand-9", "positive-9", etc.) |
| 10   | Hovered solid background                                           |
| 11   | **Text / icon color** (readable on white or dark surfaces)         |
| 12   | High-contrast text                                                 |

**For status indicators:** use `-9` for solid fills, `-11` for text/icons on neutral backgrounds.

---

## Semantic Color Vocabulary

### Neutral (scaffolding)

```
bg-surface-neutral              → var(--neutral-1)   page background
bg-surface-neutral-subtle       → var(--neutral-2)   alternate panel / sidebar
bg-surface-neutral-component    → var(--neutral-3)   input backplate, card
bg-surface-neutral-componentHover → var(--neutral-4) hover state layer
text-neutral                    → var(--neutral-12)  default text
text-neutral-subtle             → var(--neutral-11)  metadata, helper
text-neutral-disabled           → var(--neutral-10)  disabled state
border-neutral                  → var(--neutral-6)   default border
border-neutral-component        → var(--neutral-7)   stronger component border
border-neutral-componentHover   → var(--neutral-8)   hover border
```

### Brand (action / active state)

```
bg-surface-brand-solid          → var(--brand-9)     primary button fill
bg-surface-brand-solidHover     → var(--brand-10)    primary button hover
bg-surface-brand-component      → var(--brand-3)     active nav item background
bg-surface-brand-subtle         → var(--brand-2)     subtle brand tint
text-brand                      → var(--brand-11)    brand text, active nav
border-brand-component          → var(--brand-alpha-7) brand component border
border-brand-subtle             → var(--brand-6)     subtle brand border
```

### Status Colors

```
Positive (green)
  bg-surface-positive-solid     → var(--positive-9)
  bg-surface-positive-component → var(--positive-3)
  bg-surface-positive-subtle    → var(--positive-2)
  text-positive                 → var(--positive-11)
  border-positive-component     → var(--positive-alpha-7)

Warning (amber)
  bg-surface-warning-solid      → var(--warning-9)
  bg-surface-warning-component  → var(--warning-3)
  bg-surface-warning-subtle     → var(--warning-2)
  text-warning                  → var(--warning-11)
  border-warning-component      → var(--warning-alpha-7)

Negative (red)
  bg-surface-negative-solid     → var(--negative-9)
  bg-surface-negative-component → var(--negative-3)
  bg-surface-negative-subtle    → var(--negative-2)
  text-negative                 → var(--negative-11)
  border-negative-component     → var(--negative-alpha-7)

Info (blue)
  bg-surface-info-solid         → var(--info-9)
  bg-surface-info-component     → var(--info-3)
  bg-surface-info-subtle        → var(--info-2)
  text-info                     → var(--info-11)
  border-info-component         → var(--info-alpha-7)
```

### Special Tokens

```
--background-1                  → main app canvas
--background-2                  → alternate canvas layer
--background-overlay            → modal backdrop (80% black)
```

### Invert Tokens

Invert tokens reference the opposite theme's color values. In light mode, `--neutral-invert-12` resolves to the dark-theme neutral — producing a dark surface or dark text that sits on top of the current light background. The canonical example is a tooltip: dark background, light text, regardless of the active theme.

```
text-neutralInvert              → var(--neutral-invert-12)   light text on a dark surface
text-neutralInvert-subtle       → var(--neutral-invert-11)   secondary light text
bg-surface-neutralInvert        → var(--neutral-invert-1)    dark surface (tooltip, popover)
bg-surface-neutralInvert-component → var(--neutral-invert-3) elevated dark surface
border-neutralInvert            → var(--neutral-invert-6)    border on a dark surface

text-positiveInvert             → var(--positive-invert-11)  positive/green on a dark surface
text-negativeInvert             → var(--negative-invert-11)  negative/red on a dark surface
text-warningInvert              → var(--warning-invert-11)   warning/amber on a dark surface
text-infoInvert                 → var(--info-invert-11)      info/blue on a dark surface
```

Use `text-*Invert` status tokens whenever a status icon or label appears inside an invert surface (tooltip, dark popover). Using the non-invert variant (`text-positive`, `text-warning`, etc.) on a dark background will produce the light-theme value and may fail contrast.

Invert tokens follow the same 1–12 scale structure as the standard palette, but resolve to the opposite theme's values — so they always produce contrast against the current surface regardless of light or dark mode.

**Use sparingly.** Invert surfaces are reserved for floating layers that need maximum separation from the page (tooltips, contextual popover labels, kbd hints). Don't apply them to cards, panels, or any persistent surface.

**Don't introduce new invert tokens without design team validation.** The invert scale is intentionally narrow. If a use case seems to require a new invert value, raise it with the design team first.

---

## How to Choose a Semantic Shade

What are you coloring?

- A **fill** (button, solid badge, status indicator) → `-9` — e.g. `bg-surface-negative-solid`
- **Text or an icon** on a neutral background → `-11` — e.g. `text-negative`
- A **subtle background** (callout, tinted surface) → `-subtle` / `-2` — e.g. `bg-surface-warning-subtle`
- A **component surface** (card, badge background) → `-component` / `-3` — e.g. `bg-surface-positive-component`
- A **border** on a colored surface → `-component` alpha — e.g. `border-negative-component`

---

## Legacy Tokens to Avoid

The old `--color-neutral-50` through `--color-neutral-900` scale (and their Tailwind equivalents like `text-neutral-600`) are deprecated. Use the semantic scale (`text-neutral-subtle`, `bg-surface-neutral-component`, etc.) instead.
