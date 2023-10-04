import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

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
    <AccordionPrimitive.Trigger
      className={twMerge(
        'group flex h-14 flex-1 cursor-default items-center bg-white px-5 text-sm outline-none',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <Icon
        name={IconAwesomeEnum.CHEVRON_DOWN}
        className="text-neutral-350 mr-4 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
        aria-hidden
      />
      {children}
    </AccordionPrimitive.Trigger>
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
          dark ? 'dark' : ''
        } data-[state=open]:animate-slidein-down-sm-faded data-[state=closed]:slidein-up-sm-faded overflow-hidden`,
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="dark:bg-neutral-550 dark:text-neutral-300 pt-3 pb-4 px-4">{children}</div>
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
