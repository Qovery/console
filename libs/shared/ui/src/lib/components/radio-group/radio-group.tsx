import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../icon/icon'

const itemVariants = cva(
  [
    'group',
    'transition',
    'bg-surface-neutral',
    'border',
    'border-neutral',
    'rounded-full',
    'hover:border-brand-strong',
    'data-[state=checked]:bg-surface-brand-solid',
    'data-[state=checked]:border-0',
    'hover:data-[state=checked]:bg-surface-brand-solidHover',
    'disabled:cursor-not-allowed',
    'disabled:hover:border',
    'disabled:bg-surface-neutral-component',
    'disabled:border-neutral-component',
    'disabled:data-[state=checked]:border-0',
    'disabled:data-[state=checked]:bg-surface-brand-component',
  ],
  {
    variants: {
      size: {
        sm: ['h-3.5', 'w-3.5'],
        md: ['h-5', 'w-5'],
      },
      variant: {
        check: [],
        default: [],
      },
    },
    defaultVariants: {
      size: 'md',
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
  function RadioGroupItem({ className, size, variant, ...props }, ref) {
    return (
      <RadioGroupPrimitive.Item {...props} className={twMerge(itemVariants({ size, variant }), className)} ref={ref}>
        <RadioGroupPrimitive.Indicator className={indicatorVariants({ variant })}>
          {variant === 'check' && <Icon iconName="check" className="text-xs text-neutral" />}
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
