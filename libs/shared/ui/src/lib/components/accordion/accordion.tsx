import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'

interface AccordionItemProps extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {}

const AccordionItem = forwardRef<ElementRef<typeof AccordionPrimitive.Item>, AccordionItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <AccordionPrimitive.Item
      className={twMerge('mt-px overflow-hidden first:mt-0 first:rounded-t last:rounded-b', className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </AccordionPrimitive.Item>
  )
)

interface AccordionTriggerProps extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {}

const AccordionTrigger = forwardRef<ElementRef<typeof AccordionPrimitive.Trigger>, AccordionTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <div className={twMerge('group w-full px-5 py-2 text-sm outline-none', className)}>
      <AccordionPrimitive.Trigger
        className="inline-flex items-center justify-center border border-neutral-250 w-4 h-4 rounded mr-5"
        {...props}
        ref={forwardedRef}
      >
        <Icon iconName="plus" className="text-neutral-350 text-3xs" aria-hidden />
      </AccordionPrimitive.Trigger>
      {children}
    </div>
  )
)

interface AccordionContentProps extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  dark?: boolean
}

const AccordionContent = forwardRef<ElementRef<typeof AccordionPrimitive.Content>, AccordionContentProps>(
  ({ children, className, dark = false, ...props }, forwardedRef) => (
    <AccordionPrimitive.Content
      className={twMerge(
        `${
          dark ? 'bg-neutral-550 text-neutral-300' : ''
        } pt-3 pb-4 px-4 data-[state=open]:animate-slidein-down-sm-faded data-[state=closed]:slidein-up-sm-faded overflow-hidden`,
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </AccordionPrimitive.Content>
  )
)

const Accordion = Object.assign(
  {},
  {
    Root: AccordionPrimitive.Root,
    Item: AccordionItem,
    Trigger: AccordionTrigger,
    Content: AccordionContent,
  }
)

const AccordionRoot = AccordionPrimitive.Root

export { Accordion, AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent }

export type { AccordionItemProps, AccordionTriggerProps, AccordionContentProps }
