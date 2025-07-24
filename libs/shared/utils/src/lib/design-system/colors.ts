/**
 * Extended color palette derived from the design system
 * Used for charts, pod colors, and other visualizations requiring many distinct colors
 */

const COLOR_FAMILIES = [
  // Only use color families that have CSS variables defined in main.scss
  { family: 'brand', shades: ['500', '400', '300', '600', '700'] },
  { family: 'yellow', shades: ['500', '400', '300', '600', '700'] },
  { family: 'green', shades: ['500', '400', '300', '600', '700'] },
  { family: 'purple', shades: ['500', '400', '300', '600', '700'] },
  { family: 'sky', shades: ['500', '400', '300', '600', '700'] },
] as const

/**
 * Generate an extended color palette from design system colors
 * Returns CSS custom property references for consistent theming
 */
export const generateExtendedColorPalette = (): string[] => {
  const colors: string[] = []
  
  COLOR_FAMILIES.forEach((colorFamily) => {
    colorFamily.shades.forEach((shade) => {
      colors.push(`var(--color-${colorFamily.family}-${shade})`)
    })
  })
  
  return colors
}

/**
 * Extended color palette for use in charts, pod colors, and visualizations
 * Provides 25 distinct colors from the design system that have CSS variables defined
 */
export const EXTENDED_COLOR_PALETTE = generateExtendedColorPalette()