import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const badgeVariants = cva(['inline-flex', 'items-center', 'shrink-0', 'font-medium', 'text-xs', 'h-6', 'px-2'], {
  variants: {
    color: {
      neutral: [],
      red: ['text-red-500'],
      purple: ['text-purple-500'],
      sky: ['text-sky-500'],
      green: ['text-green-500'],
      yellow: ['text-yellow-500'],
      brand: ['text-brand-500'],
    },
    variant: {
      outline: ['border'],
      surface: ['border'],
    },
    radius: {
      rounded: ['rounded'],
      full: ['rounded-full'],
    },
  },
  compoundVariants: [
    {
      variant: 'surface',
      color: 'neutral',
      className: ['bg-neutral-100', 'border-neutral-200', 'text-neutral-400'],
    },
    {
      variant: 'outline',
      color: 'neutral',
      className: ['border-neutral-250', 'text-neutral-350', 'dark:border-neutral-350', 'dark:text-neutral-300'],
    },
    /*
    // Generate all colors
      ...[
        'red' as const,
        'purple' as const,
        'sky' as const,
        'green' as const,
        'yellow' as const,
        'brand' as const,
      ].flatMap((color) => [
        {
          variant: 'surface' as const,
          color,
          className: [`bg-${color}-50`],
        },
        {
          variant: ['surface' as const, 'outline' as const],
          color,
          className: [`border-${color}-500`],
        },
      ]),
  */
    {
      variant: 'surface',
      color: 'red',
      className: ['bg-red-50'],
    },
    {
      variant: ['surface', 'outline'],
      color: 'red',
      className: ['border-red-500'],
    },
    {
      variant: 'surface',
      color: 'purple',
      className: ['bg-purple-50'],
    },
    {
      variant: ['surface', 'outline'],
      color: 'purple',
      className: ['border-purple-500'],
    },
    {
      variant: 'surface',
      color: 'sky',
      className: ['bg-sky-50'],
    },
    {
      variant: ['surface', 'outline'],
      color: 'sky',
      className: ['border-sky-500'],
    },
    {
      variant: 'surface',
      color: 'green',
      className: ['bg-green-50'],
    },
    {
      variant: ['surface', 'outline'],
      color: 'green',
      className: ['border-green-500'],
    },
    {
      variant: 'surface',
      color: 'yellow',
      className: ['bg-yellow-50'],
    },
    {
      variant: ['surface', 'outline'],
      color: 'yellow',
      className: ['border-yellow-500'],
    },
    {
      variant: 'surface',
      color: 'brand',
      className: ['bg-brand-50'],
    },
    {
      variant: ['surface', 'outline'],
      color: 'brand',
      className: ['border-brand-500'],
    },
  ],
  defaultVariants: {
    variant: 'outline',
    color: 'neutral',
    radius: 'rounded',
  },
})

export interface BadgeProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'color'>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<ElementRef<'span'>, BadgeProps>(function Badge(
  { className, color, variant, radius, ...badgeProps },
  forwardedRef
) {
  return (
    <span
      data-accent-color={color}
      {...badgeProps}
      ref={forwardedRef}
      className={twMerge(badgeVariants({ color, variant, radius }), className)}
    />
  )
})

export default Badge
