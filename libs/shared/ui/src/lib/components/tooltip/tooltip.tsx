import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { PropsWithChildren, ReactNode } from 'react'

export interface TooltipProps {
  content: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'center' | 'start' | 'end'
  delayDuration?: number
  classNameTrigger?: string
}

export function Tooltip(props: PropsWithChildren<TooltipProps>) {
  const {
    children,
    content,
    open,
    defaultOpen,
    onOpenChange,
    side = 'top',
    align = 'center',
    delayDuration = 200,
    classNameTrigger = '',
  } = props

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        delayDuration={delayDuration}
      >
        <TooltipPrimitive.Trigger asChild className={classNameTrigger}>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          className="bg-element-dark-400 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-400 rounded-sm px-2 py-1 text-xs font-medium z-[100]"
          side={side}
          sideOffset={6}
          align={align}
        >
          {content}
          <TooltipPrimitive.Arrow
            className="fill-element-dark-400 dark:fill-neutral-100"
            offset={10}
            width={11}
            height={5}
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export default Tooltip
