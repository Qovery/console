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
      <div className={twMerge('flex items-center w-full pr-5 py-2 text-sm outline-none text-neutral-400', className)}>
        <AccordionPrimitive.Trigger
          className="cursor-pointer inline-flex items-center justify-center border border-neutral-250 text-3xs w-4 h-4 rounded mr-5"
          onClick={() => setIsOpen(!isOpen)}
          {...props}
          ref={forwardedRef}
          asChild
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
        'data-[state=open]:animate-slidein-down-sm-faded data-[state=closed]:slidein-up-sm-faded ml-2 pl-[26px] overflow-hidden border-l border-neutral-200',
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
