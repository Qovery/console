import { Skeleton } from '@qovery/shared/ui'

export function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded border border-neutral-200">
      <div className="flex divide-x divide-neutral-200 border-b border-neutral-200">
        <div className="h-8 w-1/4 bg-neutral-100"></div>
        <div className="h-8 w-1/4 bg-neutral-100"></div>
        <div className="h-8 w-1/4 bg-neutral-100"></div>
        <div className="h-8 w-[calc(35%/3)] bg-neutral-100"></div>
        <div className="h-8 w-[calc(20%/3)] bg-neutral-100"></div>
        <div className="h-8 w-[calc(20%/3)] bg-neutral-100"></div>
      </div>

      <div className="divide-y divide-neutral-200">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="flex divide-x divide-neutral-200">
            <div className="flex h-12 w-1/4 items-center gap-2 px-5">
              <Skeleton width={80} height={10} />
            </div>
            <div className="flex h-12 w-1/4 items-center px-3">
              <Skeleton width={80} height={10} />
            </div>
            <div className="flex h-12 w-1/4 items-center px-3">
              <Skeleton width={80} height={10} />
            </div>
            <div className="flex h-12 w-[calc(35%/3)] items-center gap-2 px-3">
              <Skeleton width={80} height={10} />
            </div>
            <div className="flex h-12 w-[calc(20%/3)] items-center px-3">
              <Skeleton width={80} height={10} />
            </div>
            <div className="flex h-12 w-[calc(20%/3)] items-center px-3">
              <Skeleton width={80} height={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableSkeleton
