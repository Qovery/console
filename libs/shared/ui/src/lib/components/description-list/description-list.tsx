import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

interface DescriptionListRootProps extends ComponentPropsWithoutRef<'dl'> {}

const DescriptionListRoot = forwardRef<ElementRef<'dl'>, DescriptionListRootProps>(function DescriptionListRoot(
  { children, className, ...rest },
  ref
) {
  return (
    <dl ref={ref} className={twMerge('grid grid-cols-2 gap-2', className)} {...rest}>
      {children}
    </dl>
  )
})

interface DescriptionTermProps extends ComponentPropsWithoutRef<'dt'> {}

const DescriptionTerm = forwardRef<ElementRef<'dt'>, DescriptionTermProps>(function DescriptionTerm(
  { children, className, ...rest },
  ref
) {
  return (
    <dt ref={ref} className={twMerge('text-neutral-350', className)} {...rest}>
      {children}
    </dt>
  )
})

interface DescriptionDetailsProps extends ComponentPropsWithoutRef<'dd'> {}

const DescriptionDetails = forwardRef<ElementRef<'dd'>, DescriptionDetailsProps>(function DescriptionDetails(
  { children, className, ...rest },
  ref
) {
  return (
    <dd ref={ref} className={twMerge('text-neutral-400 font-medium', className)} {...rest}>
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
