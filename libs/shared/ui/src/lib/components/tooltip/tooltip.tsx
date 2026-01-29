import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { type ComponentProps, type ElementRef, type ReactNode, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export interface TooltipProps extends TooltipPrimitive.TooltipProps {
  content: ReactNode
  container?: ComponentProps<typeof TooltipPrimitive.Portal>['container']
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'center' | 'start' | 'end'
  classNameTrigger?: string
  classNameContent?: string
  disabled?: boolean
}

export const Tooltip = forwardRef<ElementRef<typeof TooltipPrimitive.Trigger>, TooltipProps>(function Tooltip(
  {
    children,
    content,
    open,
    defaultOpen,
    onOpenChange,
    container,
    side = 'top',
    align = 'center',
    delayDuration = 200,
    classNameTrigger = '',
    classNameContent = '',
    disabled = false,
  },
  forwardedRef
) {
  return disabled ? (
    children
  ) : (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
    >
      <TooltipPrimitive.Trigger asChild className={classNameTrigger} ref={forwardedRef}>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal container={container}>
        <TooltipPrimitive.Content
          className={twMerge(
            'z-[10000] rounded bg-surface-neutralInvert px-2 py-1.5 text-xs font-medium text-neutralInvert',
            classNameContent
          )}
          side={side}
          sideOffset={6}
          align={align}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-surface-neutralInvert" offset={10} width={11} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
})

export default Tooltip
