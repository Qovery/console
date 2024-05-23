import * as TabsPrimitive from '@radix-ui/react-tabs'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

// https://github.com/radix-ui/themes/blob/6d00b730724a0ab4597122aca4f86d54ff0ccd7d/packages/radix-ui-themes/src/components/tabs.tsx

interface TabsRootProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {}

const TabsRoot = forwardRef<ElementRef<typeof TabsPrimitive.Root>, TabsRootProps>(function TabsRoot({ ...rest }, ref) {
  return <TabsPrimitive.Root {...rest} ref={ref} />
})

interface TabsListProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.List> {}

const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, TabsListProps>(function TabsList(
  { className, ...rest },
  ref
) {
  return (
    <TabsPrimitive.List
      {...rest}
      ref={ref}
      className={twMerge('flex gap-1 overflow-x-auto whitespace-nowrap', className)}
    />
  )
})

const triggerVariants = cva(
  [
    'relative',
    'flex',
    'items-center',
    'justify-center',
    'shrink-0',
    'select-none',
    'box-border',
    'hover:text-brand-500',
    'hover:border-brand-500',
    'border-neutral-250',
    'dark:border-neutral-350',
    'data-[state=active]:border-brand-500',
    'dark:data-[state=active]:border-brand-500',
    'data-[state=active]:text-brand-500',
    'dark:data-[state=active]:text-white',
    'dark:hover:text-white',
    'disabled:border-neutral-200',
    'disabled:text-neutral-300',
    'dark:disabled:border-neutral-400',
    'dark:disabled:text-neutral-350',
    'transition',
    'text-neutral-350',
    'dark:text-neutral-300',
  ],
  {
    variants: {
      radius: {
        none: [],
        full: ['rounded-full', 'font-medium'],
      },
      size: {
        xs: ['text-2xs', 'px-2', 'h-5', 'font-semibold'],
        md: ['text-sm', 'px-4', 'h-[52px]', 'font-medium'],
      },
    },
    compoundVariants: [
      {
        radius: 'none',
        size: 'md',
        className: ['border-b-2'],
      },
      {
        radius: 'none',
        size: 'xs',
        className: ['border-b'],
      },
      {
        radius: 'full',
        size: 'md',
        className: ['border-2'],
      },
      {
        radius: 'full',
        size: 'xs',
        className: ['border'],
      },
    ],
    defaultVariants: {
      radius: 'none',
      size: 'md',
    },
  }
)

interface TabsTriggerProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof triggerVariants> {}

const TabsTrigger = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(function TabsTrigger(
  { children, className, radius, size, ...rest },
  ref
) {
  return (
    <TabsPrimitive.Trigger {...rest} ref={ref} className={twMerge(triggerVariants({ radius, size }), className)}>
      <span className="absolute flex items-center justify-center">{children}</span>
      <span className="invisible flex items-center justify-center">{children}</span>
    </TabsPrimitive.Trigger>
  )
})

interface TabsContentProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {}

const TabsContent = forwardRef<ElementRef<typeof TabsPrimitive.Content>, TabsContentProps>(function TabsContent(
  { className, ...rest },
  ref
) {
  return <TabsPrimitive.Content {...rest} ref={ref} className={twMerge('relative outline-0', className)} />
})

const Tabs = Object.assign(
  {},
  {
    Root: TabsRoot,
    List: TabsList,
    Trigger: TabsTrigger,
    Content: TabsContent,
  }
)

export { Tabs, TabsRoot, TabsList, TabsTrigger, TabsContent }

export type { TabsRootProps, TabsListProps, TabsTriggerProps, TabsContentProps }
