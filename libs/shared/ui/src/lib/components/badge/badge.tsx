import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const badgeVariants = cva(['inline-flex', 'items-center', 'shrink-0', 'font-medium'], {
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
    size: {
      xs: ['text-xs', 'px-1', 'py-0.5'],
      sm: ['text-sm', 'py-1', 'px-2'],
      md: ['text-base', 'py-1.5', 'px-3'],
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
      className: ['border-neutral-250', 'text-neutral-350', 'dark:border-neutral-350'],
    },
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
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'sm',
    color: 'neutral',
    radius: 'rounded',
  },
})

export interface BadgeProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'color'>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<ElementRef<'span'>, BadgeProps>(function Badge(
  { className, color, variant, size, radius, ...badgeProps },
  forwardedRef
) {
  return (
    <span
      data-accent-color={color}
      {...badgeProps}
      ref={forwardedRef}
      className={twMerge(badgeVariants({ color, variant, radius, size }), className)}
    />
  )
})

export default Badge
