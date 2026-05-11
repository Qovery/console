import { Skeleton } from '@qovery/shared/ui'

export function ArgoCdIntegrationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-surface-neutral-subtle">
      <div className="relative overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <div className="flex items-center gap-2">
            <Skeleton width={140} height={24} />
            <Skeleton width={170} height={24} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton width={24} height={24} />
            <Skeleton width={24} height={24} />
          </div>
        </div>

        <div className="border-b border-neutral px-4 py-4">
          <Skeleton width={160} height={20} />
        </div>

        <div className="p-4">
          <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
            {[...Array(2)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-neutral px-4 py-3 last:border-b-0"
              >
                <div className="flex flex-col gap-2">
                  <Skeleton width={170} height={18} />
                  <Skeleton width={220} height={16} />
                </div>
                <Skeleton width={32} height={32} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="-mt-[7px] flex items-center gap-2 rounded-b-lg border border-t-0 border-neutral bg-surface-neutral-subtle px-4 pb-3 pt-[calc(0.75rem+7px)]">
        <Skeleton width={100} height={28} />
        <Skeleton width={120} height={18} />
      </div>
    </div>
  )
}
