import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../icon/icon'

const checkboxVariants = cva(
  [
    'group',
    'inline-flex',
    'shrink-0',
    'items-center',
    'justify-center',
    'rounded',
    'border',
    'border-neutral',
    'bg-surface-neutral',
    'transition-colors',
    'disabled:cursor-not-allowed',
    'disabled:border-neutral',
    'disabled:bg-surface-neutral-subtle',
    'disabled:hover:border-neutral',
    'disabled:data-[state=checked]:bg-surface-neutral-subtle',
    'disabled:data-[state=checked]:border-neutral',
    'disabled:data-[state=indeterminate]:border-neutral',
  ],
  {
    variants: {
      size: {
        sm: ['h-[14px]', 'w-[14px]'],
        md: ['h-4', 'w-4'],
      },
      color: {
        brand: [
          'hover:border-brand-strong',
          'data-[state=checked]:bg-surface-brand-solid',
          'hover:data-[state=checked]:bg-surface-brand-solidHover',
          'data-[state=checked]:border-0',
          'data-[state=indeterminate]:border-brand-strong',
        ],
        red: [
          'hover:border-negative-strong',
          'data-[state=checked]:bg-surface-negative-solid',
          'hover:data-[state=checked]:bg-surface-negative-solidHover',
          'data-[state=checked]:border-negative-strong',
          'data-[state=indeterminate]:border-negative-strong',
        ],
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'brand',
    },
  }
)

const indeterminateVariants = cva(['rounded-[2px]'], {
  variants: {
    size: {
      sm: ['h-2.5', 'w-2.5'],
      md: ['h-3', 'w-3'],
    },
    color: {
      brand: [
        'bg-surface-brand-solid',
        'hover:bg-surface-brand-solidHover',
        'group-disabled:bg-surface-neutral-componentHover',
      ],
      red: [
        'bg-surface-negative-solid',
        'hover:bg-surface-negative-solidHover',
        'group-disabled:bg-surface-neutral-componentHover',
      ],
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'brand',
  },
})

export interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'asChild' | 'children' | 'color'>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(function Checkbox(
  { className, color, size, ...props },
  forwardedRef
) {
  const checkIconClassName = size === 'sm' ? 'text-2xs' : 'text-xs'

  return (
    <CheckboxPrimitive.Root
      {...props}
      asChild={false}
      ref={forwardedRef}
      className={twMerge(checkboxVariants({ color, size }), className)}
    >
      <CheckboxPrimitive.Indicator asChild>
        <span className="flex h-full w-full items-center justify-center">
          {props.checked === 'indeterminate' ? (
            <span className={indeterminateVariants({ color, size })} />
          ) : (
            <Icon iconName="check" className={`${checkIconClassName} text-neutralInvert group-disabled:text-neutral-disabled`} />
          )}
        </span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})

export { Checkbox }
