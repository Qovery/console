import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

const checkboxVariants = cva([
  'group',
  'transition',
  'bg-neutral-100',
  'border',
  'border-neutral-300',
  'rounded-sm',
  'w-[18px]',
  'h-[18px]',
  'hover:border-2',
  'hover:border-brand-500',
  'data-[state=checked]:bg-brand-500',
  'data-[state=checked]:border',
  'data-[state=checked]:border-brand-500',
  'data-[state=indeterminate]:border-2',
  'data-[state=indeterminate]:border-brand-500',
  'disabled:border',
  'disabled:border-neutral-250',
  'disabled:data-[state=checked]:border-brand-300',
  'disabled:data-[state=checked]:bg-brand-300',
  'disabled:data-[state=indeterminate]:border-brand-300',
])

export interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'asChild' | 'children' | 'color'> {}

const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(function Checkbox(
  { className, ...props },
  forwardedRef
) {
  return (
    <CheckboxPrimitive.Root {...props} asChild={false} ref={forwardedRef} className={checkboxVariants()}>
      <CheckboxPrimitive.Indicator asChild>
        <span className="flex items-center justify-center w-full h-full">
          {props.checked === 'indeterminate' ? (
            <span className="w-[10px] h-[10px] bg-brand-500 group-disabled:bg-brand-300" />
          ) : (
            <Icon name={IconAwesomeEnum.CHECK} className="text-xs text-white leading-[18px]" />
          )}
        </span>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})

export { Checkbox }
