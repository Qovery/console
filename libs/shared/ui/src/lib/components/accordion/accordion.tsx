import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef, useState } from 'react'
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
  ({ children, className, ...props }, forwardedRef) => {
    const [isOpen, setIsOpen] = useState(false)
    const iconName = isOpen ? 'minus' : 'plus'

    return (
      <div className={twMerge('flex w-full items-center py-2 pr-5 text-sm text-neutral-400 outline-none', className)}>
        <AccordionPrimitive.Trigger
          className="mr-5 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded border border-neutral-250 text-3xs"
          onClick={() => setIsOpen(!isOpen)}
          {...props}
          ref={forwardedRef}
        >
          <Icon iconName={iconName} />
        </AccordionPrimitive.Trigger>
        {children}
      </div>
    )
  }
)

interface AccordionContentProps extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  dark?: boolean
}

const AccordionContent = forwardRef<ElementRef<typeof AccordionPrimitive.Content>, AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <AccordionPrimitive.Content
      className={twMerge(
        'data-[state=closed]:slidein-up-sm-faded ml-2 overflow-hidden border-l border-neutral-200 pl-[26px] data-[state=open]:animate-slidein-down-sm-faded',
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
