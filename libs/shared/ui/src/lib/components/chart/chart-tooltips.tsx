import { forwardRef } from 'react'

// Zoom Range Tooltip - for drag/zoom interactions
interface ZoomRangeTooltipProps {
  active?: boolean
  startTime: string
  endTime: string
}

export const ZoomRangeTooltip = forwardRef<HTMLDivElement, ZoomRangeTooltipProps>(function ZoomRangeTooltip(
  { active = true, startTime, endTime },
  ref
) {
  if (!active) return null

  return (
    <div ref={ref} className="rounded-md bg-neutral-600 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-4 border-b border-neutral-400 p-3 pb-2">
        <span className="text-xs text-neutral-50">Zoom In</span>
      </div>
      <div className="space-y-1 p-3 pt-0">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-neutral-50">Start:</span>
          <span className="text-neutral-250">{startTime}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-neutral-50">End:</span>
          <span className="text-neutral-250">{endTime}</span>
        </div>
      </div>
    </div>
  )
})
