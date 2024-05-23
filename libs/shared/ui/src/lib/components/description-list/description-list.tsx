import { type ComponentPropsWithoutRef, type ElementRef, createContext, forwardRef, useContext } from 'react'
import { twMerge } from '@qovery/shared/util-js'

type Highlight = 'term' | 'details'

const HighlightContext = createContext<Highlight>('details')

interface DescriptionListRootProps extends ComponentPropsWithoutRef<'dl'> {
  hightlight?: Highlight
}

const DescriptionListRoot = forwardRef<ElementRef<'dl'>, DescriptionListRootProps>(function DescriptionListRoot(
  { children, className, hightlight, ...rest },
  ref
) {
  return (
    <HighlightContext.Provider value={hightlight ?? 'details'}>
      <dl ref={ref} className={twMerge('grid grid-cols-2 gap-2', className)} {...rest}>
        {children}
      </dl>
    </HighlightContext.Provider>
  )
})

interface DescriptionTermProps extends ComponentPropsWithoutRef<'dt'> {}

const DescriptionTerm = forwardRef<ElementRef<'dt'>, DescriptionTermProps>(function DescriptionTerm(
  { children, className, ...rest },
  ref
) {
  const highlight = useContext(HighlightContext)
  return (
    <dt
      ref={ref}
      className={twMerge(
        highlight === 'term'
          ? 'font-medium text-neutral-400 dark:font-normal dark:text-white'
          : 'text-neutral-350 dark:text-neutral-300',
        className
      )}
      {...rest}
    >
      {children}
    </dt>
  )
})

interface DescriptionDetailsProps extends ComponentPropsWithoutRef<'dd'> {}

const DescriptionDetails = forwardRef<ElementRef<'dd'>, DescriptionDetailsProps>(function DescriptionDetails(
  { children, className, ...rest },
  ref
) {
  const highlight = useContext(HighlightContext)
  return (
    <dd
      ref={ref}
      className={twMerge(
        highlight === 'details'
          ? 'font-medium text-neutral-400 dark:font-normal dark:text-white'
          : 'text-neutral-350 dark:text-neutral-300',
        className
      )}
      {...rest}
    >
      {children}
    </dd>
  )
})

const DescriptionList = Object.assign(
  {},
  {
    Root: DescriptionListRoot,
    Term: DescriptionTerm,
    Details: DescriptionDetails,
  }
)

export { DescriptionList, DescriptionListRoot, DescriptionTerm, DescriptionDetails }

export type { DescriptionListRootProps, DescriptionTermProps, DescriptionDetailsProps }
