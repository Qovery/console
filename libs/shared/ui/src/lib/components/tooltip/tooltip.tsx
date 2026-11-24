import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { type ComponentProps, type ElementRef, type MouseEvent, type ReactNode, forwardRef, useState } from 'react'
import { isTouchScreen, twMerge } from '@qovery/shared/util-js'

const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, [role="button"], [role="link"]'

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
  // Radix only opens on hover or focus: on touch screens a tap on a non-interactive trigger opens it instead
  const isTapControlled = open === undefined && isTouchScreen()
  const [isTapOpen, setIsTapOpen] = useState(defaultOpen ?? false)

  const handleTriggerClick = (event: MouseEvent<HTMLElement>) => {
    if (!isTapControlled || isTapOpen || !(event.target instanceof Element)) return
    const interactiveElement = event.target.closest(INTERACTIVE_SELECTOR)
    if (interactiveElement && event.currentTarget.contains(interactiveElement)) return
    setIsTapOpen(true)
    onOpenChange?.(true)
  }

  return disabled ? (
    children
  ) : (
    <TooltipPrimitive.Root
      open={isTapControlled ? isTapOpen : open}
      defaultOpen={defaultOpen}
      onOpenChange={(value) => {
        if (isTapControlled) setIsTapOpen(value)
        onOpenChange?.(value)
      }}
      delayDuration={delayDuration}
    >
      <TooltipPrimitive.Trigger asChild className={classNameTrigger} ref={forwardedRef} onClick={handleTriggerClick}>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal container={container}>
        <TooltipPrimitive.Content
          className={twMerge(
            'z-tooltip max-w-[calc(100vw-32px)] rounded bg-surface-neutralInvert-component px-2 py-1.5 text-xs font-medium text-neutralInvert',
            classNameContent
          )}
          side={side}
          sideOffset={6}
          collisionPadding={8}
          align={align}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-surface-neutralInvert-component" offset={10} width={11} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
})

export default Tooltip
