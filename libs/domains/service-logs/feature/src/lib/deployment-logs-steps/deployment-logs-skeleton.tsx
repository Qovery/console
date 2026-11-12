import { Skeleton } from '@qovery/shared/ui'

// Placeholder shapes for pre-check, build and deploy, before their actual steps are known.
const PHASE_ROW_WIDTHS = [
  [176, 160, 144],
  [176, 144, 136, 112, 104, 144],
  [160, 128],
]

export function DeploymentLogsSkeleton() {
  return (
    <div role="status" aria-label="Loading deployment logs" className="h-full w-full overflow-y-auto">
      <div aria-hidden="true" className="container mx-auto flex flex-col gap-3 px-4 pb-10 pt-8">
        <div className="flex h-8 items-center justify-between gap-4">
          <Skeleton width={48} height={20} />
          <Skeleton width={200} height={32} />
        </div>
        {PHASE_ROW_WIDTHS.map((rowWidths, phaseIndex) => (
          <div key={phaseIndex} className="rounded-lg border border-neutral bg-surface-neutral-subtle">
            <div className="flex h-12 items-center justify-between gap-4 px-4">
              <div className="flex items-center gap-2">
                <Skeleton width={14} height={14} />
                <Skeleton width={phaseIndex === 0 ? 80 : 48} height={16} />
                <Skeleton width={14} height={14} rounded />
              </div>
              <Skeleton width={48} height={16} />
            </div>
            <div className="-mx-px -mb-px overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              {rowWidths.map((width, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex h-12 items-center justify-between gap-4 border-b border-neutral px-4 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Skeleton width={14} height={14} className="shrink-0" />
                    <Skeleton width={width} height={16} className="max-w-full" />
                    <Skeleton width={14} height={14} rounded className="shrink-0" />
                  </div>
                  <Skeleton width={32} height={16} className="shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
