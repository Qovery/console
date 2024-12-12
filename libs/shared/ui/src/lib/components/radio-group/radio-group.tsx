import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../icon/icon'

const itemVariants = cva(
  [
    'group',
    'transition',
    'bg-neutral-100',
    'dark:bg-neutral-500',
    'border',
    'border-neutral-300',
    'w-[20px]',
    'h-[20px]',
    'rounded-full',
    'hover:border-2',
    'hover:border-brand-500',
    'data-[state=checked]:bg-brand-500',
    'data-[state=checked]:border-2',
    'data-[state=checked]:border-brand-500',
    'disabled:hover:border',
    'disabled:bg-neutral-150',
    'disabled:border-neutral-250',
    'disabled:data-[state=checked]:hover:border-2',
    'disabled:data-[state=checked]:border-brand-300',
    'disabled:data-[state=checked]:bg-brand-300',
  ],
  {
    variants: {
      variant: {
        check: [],
        default: [],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const indicatorVariants = cva(['flex', 'items-center', 'justify-center', 'w-full', 'h-full', 'relative'], {
  variants: {
    variant: {
      check: [],
      default: [
        "after:content-['']",
        'after:block',
        'after:w-[6px]',
        'after:h-[6px]',
        'after:rounded-[50%]',
        'after:bg-white',
        'after:absolute',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface RadioGroupItemProps
  extends Omit<ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, 'children'>,
    VariantProps<typeof itemVariants> {}

const RadioGroupItem = forwardRef<ElementRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemProps>(
  function RadioGroupItem({ className, variant, ...props }, ref) {
    return (
      <RadioGroupPrimitive.Item {...props} className={twMerge(itemVariants({ variant }), className)} ref={ref}>
        <RadioGroupPrimitive.Indicator className={indicatorVariants({ variant })}>
          {variant === 'check' && <Icon iconName="check" className="text-xs text-white" />}
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    )
  }
)

const RadioGroup = Object.assign(
  {},
  {
    Root: RadioGroupPrimitive.Root,
    Item: RadioGroupItem,
  }
)

export { RadioGroup }
