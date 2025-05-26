import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

interface ProgressBarRootProps extends Omit<ComponentPropsWithoutRef<'div'>, 'height'> {}

const ProgressBarRoot = forwardRef<ElementRef<'div'>, ProgressBarRootProps>(function ProgressBarRoot(
  { className, children, ...props },
  ref
) {
  return (
    <div ref={ref} className={twMerge('h-2 w-full overflow-hidden rounded-full bg-neutral-150', className)} {...props}>
      <div className="flex h-full w-full">{children}</div>
    </div>
  )
})

interface ProgressBarCellProps extends Omit<ComponentPropsWithoutRef<'div'>, 'color'> {
  percentage: number
  color: string
}

const ProgressBarCell = forwardRef<ElementRef<'div'>, ProgressBarCellProps>(function ProgressBarCell(
  { percentage, color, className, ...props },
  ref
) {
  if (percentage <= 0) return null

  return (
    <div
      ref={ref}
      className={twMerge('h-full border-r border-neutral-50 last:border-r-0', className)}
      style={{
        width: `${percentage}%`,
        backgroundColor: color,
      }}
      {...props}
    />
  )
})

const ProgressBar = Object.assign(
  {},
  {
    Root: ProgressBarRoot,
    Cell: ProgressBarCell,
  }
)

export { ProgressBar, ProgressBarRoot, ProgressBarCell }

export type { ProgressBarRootProps, ProgressBarCellProps }
