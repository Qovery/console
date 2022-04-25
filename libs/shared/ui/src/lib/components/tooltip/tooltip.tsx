import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export interface TooltipProps {
  children: React.ReactElement
  content: React.ReactElement | string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'center' | 'start' | 'end'
}

export function Tooltip(props: TooltipProps) {
  const { children, content, open = true, defaultOpen, onOpenChange, side = 'top', align = 'center' } = props

  return (
    <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        className="bg-element-dark-400 text-text-100 rounded-sm px-2 py-1 text-xs"
        side={side}
        align={align}
        {...props}
      >
        {content}
        <TooltipPrimitive.Arrow className="fill-element-dark-400" offset={10} width={11} height={5} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  )
}

export default Tooltip
