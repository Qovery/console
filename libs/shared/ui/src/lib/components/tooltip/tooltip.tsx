import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import React from 'react'

export interface TooltipProps {
  children: React.ReactElement
  content: React.ReactElement | string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'center' | 'start' | 'end'
  delayDuration?: number
}

export function Tooltip(props: TooltipProps) {
  const {
    children,
    content,
    open,
    defaultOpen,
    onOpenChange,
    side = 'top',
    align = 'center',
    delayDuration = 200,
  } = props

  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        className="bg-element-dark-400 text-text-100 dark:bg-element-light-lighter-200 dark:text-text-700 rounded-sm px-2 py-1 text-xs font-medium z-50"
        side={side}
        sideOffset={6}
        align={align}
      >
        {content}
        <TooltipPrimitive.Arrow
          className="fill-element-dark-400 dark:fill-element-light-lighter-200"
          offset={10}
          width={11}
          height={5}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  )
}

export default Tooltip
