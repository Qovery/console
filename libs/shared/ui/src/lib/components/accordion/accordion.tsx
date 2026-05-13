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

interface AccordionTriggerProps extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  chevronPosition?: 'left' | 'right'
}

const AccordionTrigger = forwardRef<ElementRef<typeof AccordionPrimitive.Trigger>, AccordionTriggerProps>(
  ({ children, className, chevronPosition = 'left', ...props }, forwardedRef) => (
    <AccordionPrimitive.Trigger
      className={twMerge(
        'group flex min-h-14 cursor-default items-center bg-surface-neutral px-5 text-sm outline-none',
        chevronPosition === 'right' ? 'w-full gap-2 text-left' : 'gap-5',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {chevronPosition === 'left' ? (
        <Icon
          iconName="chevron-down"
          className="text-neutral-subtle transition-transform duration-200 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
          aria-hidden
        />
      ) : null}
      <span className={twMerge('min-w-0', chevronPosition === 'right' && 'flex-1')}>{children}</span>
      {chevronPosition === 'right' ? (
        <Icon
          iconName="chevron-down"
          className="ml-auto text-neutral-subtle transition-transform duration-200 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
          aria-hidden
        />
      ) : null}
    </AccordionPrimitive.Trigger>
  )
)

interface AccordionContentProps extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {}

const AccordionContent = forwardRef<ElementRef<typeof AccordionPrimitive.Content>, AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <AccordionPrimitive.Content
      className={twMerge(
        'data-[state=closed]:slidein-up-sm-faded overflow-hidden bg-surface-neutral data-[state=open]:animate-slidein-down-sm-faded',
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
