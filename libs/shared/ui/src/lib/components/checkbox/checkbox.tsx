import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../icon/icon'

const checkboxVariants = cva(
  [
    'group',
    'transition',
    'bg-neutral-100',
    'dark:bg-neutral-500',
    'border',
    'border-neutral-300',
    'dark:border-neutral-350',
    'rounded-sm',
    'w-[18px]',
    'h-[18px]',
    'hover:border-2',
    'data-[state=checked]:border',
    'data-[state=indeterminate]:border-2',
    'disabled:border',
    'disabled:border-neutral-250',
  ],
  {
    variants: {
      color: {
        brand: [
          'hover:border-brand-500',
          'dark:hover:border-brand-500',
          'data-[state=checked]:bg-brand-500',
          'dark:data-[state=checked]:bg-brand-500',
          'data-[state=checked]:border-brand-500',
          'dark:data-[state=checked]:border-brand-500',
          'data-[state=indeterminate]:border-brand-500',
          'disabled:data-[state=checked]:border-brand-300',
          'disabled:data-[state=checked]:bg-brand-300',
          'disabled:data-[state=indeterminate]:border-brand-300',
        ],
        red: [
          'hover:border-red-500',
          'data-[state=checked]:bg-red-500',
          'data-[state=checked]:border-red-500',
          'data-[state=indeterminate]:border-red-500',
          'disabled:data-[state=checked]:border-red-300',
          'disabled:data-[state=checked]:bg-red-300',
          'disabled:data-[state=indeterminate]:border-red-300',
        ],
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

const indeterminateVariants = cva(['h-[10px]', 'w-[10px]'], {
  variants: {
    color: {
      brand: ['bg-brand-500', 'group-disabled:bg-brand-300'],
      red: ['bg-red-500', 'group-disabled:bg-red-300'],
    },
  },
  defaultVariants: {
    color: 'brand',
  },
})

export interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'asChild' | 'children' | 'color'>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(function Checkbox(
  { className, color, ...props },
  forwardedRef
) {
  return (
    <CheckboxPrimitive.Root
      {...props}
      asChild={false}
      ref={forwardedRef}
      className={twMerge(checkboxVariants({ color }), className)}
    >
      <CheckboxPrimitive.Indicator asChild>
        <span className="flex h-full w-full items-center justify-center">
          {props.checked === 'indeterminate' ? (
            <span className={indeterminateVariants({ color })} />
          ) : (
            <Icon iconName="check" className="text-xs leading-[18px] text-white" />
          )}
        </span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})

export { Checkbox }
