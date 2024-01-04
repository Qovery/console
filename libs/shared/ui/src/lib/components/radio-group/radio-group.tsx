import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const RadioGroupItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  Omit<ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, 'children'>
>(function RadioGroupItem({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      {...props}
      className={twMerge(
        'group transition',
        'bg-neutral-100 border border-neutral-300 w-[20px] h-[20px] rounded-full',
        'hover:border-2 hover:border-brand-500',
        'data-[state=checked]:border-2 data-[state=checked]:border-brand-500',
        'disabled:hover:border disabled:bg-neutral-150 disabled:border-neutral-250 disabled:data-[state=checked]:hover:border-2 disabled:data-[state=checked]:border-neutral-350',
        className
      )}
      ref={ref}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[10px] after:h-[10px] after:rounded-[50%] after:bg-brand-500 after:absolute group-disabled:after:bg-neutral-350" />
    </RadioGroupPrimitive.Item>
  )
})

const RadioGroup = Object.assign(
  {},
  {
    Root: RadioGroupPrimitive.Root,
    Item: RadioGroupItem,
  }
)

export { RadioGroup }
