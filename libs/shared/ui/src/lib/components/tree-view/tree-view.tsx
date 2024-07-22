import * as TreeViewPrimitive from '@radix-ui/react-accordion'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'

/*
  Radix doesn't provide a TreeView component, so we have to build it we accordion component
  https://github.com/radix-ui/primitives/issues/1456
*/

interface TreeViewItemProps extends ComponentPropsWithoutRef<typeof TreeViewPrimitive.Item> {}

const TreeViewItem = forwardRef<ElementRef<typeof TreeViewPrimitive.Item>, TreeViewItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <TreeViewPrimitive.Item
      className={twMerge('mt-px overflow-hidden first:mt-0 first:rounded-t last:rounded-b', className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </TreeViewPrimitive.Item>
  )
)

interface TreeViewTriggerProps extends ComponentPropsWithoutRef<typeof TreeViewPrimitive.Trigger> {}

const TreeViewTrigger = forwardRef<ElementRef<typeof TreeViewPrimitive.Trigger>, TreeViewTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => {
    const [isOpen, setIsOpen] = useState(false)
    const iconName = isOpen ? 'minus' : 'plus'

    return (
      <div className={twMerge('flex w-full items-center py-2 pr-5 text-sm text-neutral-400 outline-none', className)}>
        <TreeViewPrimitive.Trigger
          className="mr-5 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded border border-neutral-250 text-3xs"
          onClick={() => setIsOpen(!isOpen)}
          {...props}
          ref={forwardedRef}
        >
          <Icon iconName={iconName} />
        </TreeViewPrimitive.Trigger>
        {children}
      </div>
    )
  }
)

interface TreeViewContentProps extends ComponentPropsWithoutRef<typeof TreeViewPrimitive.Content> {
  dark?: boolean
}

const TreeViewContent = forwardRef<ElementRef<typeof TreeViewPrimitive.Content>, TreeViewContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <TreeViewPrimitive.Content
      className={twMerge(
        'data-[state=closed]:slidein-up-sm-faded ml-2 overflow-hidden border-l border-neutral-200 pl-[26px] data-[state=open]:animate-slidein-down-sm-faded',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </TreeViewPrimitive.Content>
  )
)

const TreeView = Object.assign(
  {},
  {
    Root: TreeViewPrimitive.Root,
    Item: TreeViewItem,
    Trigger: TreeViewTrigger,
    Content: TreeViewContent,
  }
)

const TreeViewRoot = TreeViewPrimitive.Root

export { TreeView, TreeViewRoot, TreeViewItem, TreeViewTrigger, TreeViewContent }

export type { TreeViewItemProps, TreeViewTriggerProps, TreeViewContentProps }
