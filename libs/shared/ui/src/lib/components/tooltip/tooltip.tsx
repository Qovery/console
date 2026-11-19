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
  // Touch screens have no hover, so Radix never opens the tooltip. There, a tap on a non-interactive trigger (an info
  // icon, a truncated label) opens it and a tap elsewhere closes it; taps on buttons and links keep doing their action.
  // Controlled tooltips and desktop behave as before.
  const isControlled = open !== undefined
  const [touchOpen, setTouchOpen] = useState(false)
  const handleTouchOpen = !isControlled && isTouchScreen()

  const handleTriggerClick = (event: MouseEvent<HTMLElement>) => {
    if (!handleTouchOpen) return
    const interactiveElement = (event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)
    if (interactiveElement && event.currentTarget.contains(interactiveElement)) return
    setTouchOpen(true)
  }

  return disabled ? (
    children
  ) : (
    <TooltipPrimitive.Root
      open={handleTouchOpen ? touchOpen : open}
      defaultOpen={defaultOpen}
      onOpenChange={(value) => {
        if (handleTouchOpen) setTouchOpen(value)
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
