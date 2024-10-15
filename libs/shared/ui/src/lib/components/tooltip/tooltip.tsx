import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentProps, type ElementRef, type ReactNode, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const tooltipContentVariants = cva(['rounded-sm', 'px-2', 'py-1', 'text-xs', 'font-medium'], {
  variants: {
    color: {
      neutral: ['bg-neutral-600', 'text-neutral-50', 'dark:bg-neutral-500'],
      orange: ['bg-orange-500', 'text-neutral-50'],
    },
  },
})

const tooltipArrowVariants = cva('', {
  variants: {
    color: {
      neutral: ['fill-neutral-600', 'dark:fill-neutral-500'],
      orange: ['fill-orange-500'],
    },
  },
})

export interface TooltipProps extends VariantProps<typeof tooltipContentVariants>, TooltipPrimitive.TooltipProps {
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
    color = 'neutral',
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
          className={twMerge(tooltipContentVariants({ color }), classNameContent)}
          side={side}
          sideOffset={6}
          align={align}
        >
          {content}
          <TooltipPrimitive.Arrow className={tooltipArrowVariants({ color })} offset={10} width={11} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
})

export default Tooltip
