import clsx from 'clsx'
import { type ComponentPropsWithoutRef, type ElementRef, createContext, forwardRef, useContext } from 'react'
import { twMerge } from '@qovery/shared/util-js'

type ProgressBarMode = 'default' | 'absolute'

interface ProgressBarContextValue {
  mode: ProgressBarMode
}

const ProgressBarContext = createContext<ProgressBarContextValue>({ mode: 'default' })

interface ProgressBarRootProps extends Omit<ComponentPropsWithoutRef<'div'>, 'height'> {
  mode?: ProgressBarMode
}

const ProgressBarRoot = forwardRef<ElementRef<'div'>, ProgressBarRootProps>(function ProgressBarRoot(
  { className, children, mode = 'default', ...props },
  ref
) {
  return (
    <ProgressBarContext.Provider value={{ mode }}>
      <div
        ref={ref}
        className={twMerge('relative h-2 w-full overflow-hidden rounded-full bg-neutral-150', className)}
        {...props}
      >
        <div className="flex h-full w-full">{children}</div>
      </div>
    </ProgressBarContext.Provider>
  )
})

interface ProgressBarCellProps extends Omit<ComponentPropsWithoutRef<'div'>, 'color'> {
  value: number
  color: string
}

const ProgressBarCell = forwardRef<ElementRef<'div'>, ProgressBarCellProps>(function ProgressBarCell(
  { value, color, className, style, ...props },
  ref
) {
  const { mode } = useContext(ProgressBarContext)

  if (value <= 0) return null

  return (
    <div
      ref={ref}
      className={twMerge(
        clsx('h-full', {
          'absolute left-0 top-0': mode === 'absolute',
          'border-r border-neutral-50 last:border-r-0': mode === 'default',
        }),
        className
      )}
      style={{
        width: `${value}%`,
        backgroundColor: color,
        ...style,
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
