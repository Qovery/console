import { type ComponentPropsWithoutRef } from 'react'
import { DescriptionDetails as Dd, DescriptionListRoot as Dl, DescriptionTerm as Dt, Skeleton } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

interface ServiceDetailsSkeletonProps extends ComponentPropsWithoutRef<'div'> {}

export function ServiceDetailsSkeleton({ className, ...props }: ServiceDetailsSkeletonProps) {
  return (
    <div className={twMerge('flex shrink-0 flex-col content-start justify-start gap-5 py-8', className)} {...props}>
      <div className="flex flex-col gap-4 pl-8 pr-5">
        <Skeleton height={26} width={50} show />
        <Skeleton height={16} width={300} show />
        <Dl>
          <Dt>
            <Skeleton height={16} width={75} show />
          </Dt>
          <Dd>
            <Skeleton height={16} width={75} show />
          </Dd>
          <Dt>
            <Skeleton height={16} width={75} show />
          </Dt>
          <Dd>
            <Skeleton height={16} width={75} show />
          </Dd>
        </Dl>
      </div>
      <hr />
      <div className="flex flex-col gap-4 pl-8 pr-5">
        <Skeleton height={26} width={50} show />
        <Skeleton height={16} width={300} show />
        <Dl>
          <Dt>
            <Skeleton height={16} width={75} show />
          </Dt>
          <Dd>
            <Skeleton height={16} width={75} show />
          </Dd>
          <Dt>
            <Skeleton height={16} width={75} show />
          </Dt>
          <Dd>
            <Skeleton height={16} width={75} show />
          </Dd>
        </Dl>
      </div>
    </div>
  )
}

export default ServiceDetailsSkeleton
