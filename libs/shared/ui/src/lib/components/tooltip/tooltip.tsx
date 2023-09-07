import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { type VariantProps, cva } from 'class-variance-authority'
import { type PropsWithChildren, type ReactNode } from 'react'

const tooltipContent = cva(['rounded-sm', 'px-2', 'py-1', 'text-xs', 'font-medium', 'z-[100]'], {
  variants: {
    intent: {
      neutral: ['bg-neutral-600', 'text-neutral-50', 'dark:bg-neutral-100', 'dark:text-neutral-400'],
      orange: ['bg-orange-500', 'text-neutral-50'],
    },
  },
})

const tooltipArrow = cva('', {
  variants: {
    intent: {
      neutral: ['fill-neutral-600', 'dark:fill-neutral-100'],
      orange: ['fill-orange-500'],
    },
  },
})

export interface TooltipProps extends VariantProps<typeof tooltipContent>, TooltipPrimitive.TooltipProps {
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'center' | 'start' | 'end'
  classNameTrigger?: string
}

export function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  classNameTrigger = '',
  intent = 'neutral',
}: PropsWithChildren<TooltipProps>) {
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
    >
      <TooltipPrimitive.Trigger asChild className={classNameTrigger}>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content className={tooltipContent({ intent })} side={side} sideOffset={6} align={align}>
        {content}
        <TooltipPrimitive.Arrow className={tooltipArrow({ intent })} offset={10} width={11} height={5} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  )
}

export default Tooltip
