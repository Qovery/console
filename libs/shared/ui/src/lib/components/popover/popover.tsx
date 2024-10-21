import * as PopoverPrimitive from '@radix-ui/react-popover'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

// Inspired by https://github.com/radix-ui/themes/blob/a63bd6920370d824be1db26f717147dc4a2501f1/packages/radix-ui-themes/src/components/popover.tsx

type PopoverRootProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>
function PopoverRoot(props: PopoverRootProps) {
  return <PopoverPrimitive.Root {...props} />
}

type PopoverTriggerProps = Omit<ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>, 'asChild'>
const PopoverTrigger = forwardRef<ElementRef<typeof PopoverPrimitive.Trigger>, PopoverTriggerProps>(
  function PopoverTrigger(props, forwardedRef) {
    return <PopoverPrimitive.Trigger {...props} ref={forwardedRef} asChild />
  }
)

interface PopoverContentProps extends Omit<ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>, 'asChild'> {
  container?: PopoverPrimitive.PopoverPortalProps['container']
}
const PopoverContent = forwardRef<ElementRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(
  function PopoverContent({ container, forceMount, className, ...props }, forwardedRef) {
    return (
      <PopoverPrimitive.Portal container={container} forceMount={forceMount}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          collisionPadding={10}
          {...props}
          ref={forwardedRef}
          className={twMerge(
            'rounded bg-white p-4 shadow-xl outline-none data-[state=open]:data-[side=bottom]:animate-slidein-up-sm-faded data-[state=open]:data-[side=left]:animate-slidein-right-sm-faded data-[state=open]:data-[side=right]:animate-slidein-left-sm-faded data-[state=open]:data-[side=top]:animate-slidein-down-sm-faded dark:border dark:border-neutral-500 dark:bg-neutral-550',
            className
          )}
        />
      </PopoverPrimitive.Portal>
    )
  }
)

type PopoverCloseProps = Omit<ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>, 'asChild'>
const PopoverClose = forwardRef<ElementRef<typeof PopoverPrimitive.Close>, PopoverCloseProps>(
  function PopoverClose(props, forwardedRef) {
    return <PopoverPrimitive.Close {...props} ref={forwardedRef} asChild />
  }
)

const Popover = Object.assign(
  {},
  {
    Root: PopoverRoot,
    Content: PopoverContent,
    Trigger: PopoverTrigger,
    Close: PopoverClose,
  }
)

export { Popover, PopoverRoot, PopoverContent, PopoverTrigger, PopoverClose }
export type { PopoverRootProps, PopoverContentProps, PopoverTriggerProps, PopoverCloseProps }
