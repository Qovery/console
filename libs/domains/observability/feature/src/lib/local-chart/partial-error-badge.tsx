import { Icon, Tooltip } from '@qovery/shared/ui'

// Shown next to a chart's label/description when at least one non-gating series
// failed to load while the chart still has enough other data to render. This
// keeps a single failing metric from blanking the whole chart (that's what
// `hasError`/`isEmpty` are for), while still telling the viewer some lines may
// be missing or incomplete rather than genuinely idle.
export function PartialErrorBadge() {
  return (
    <Tooltip content="Some data could not be loaded and may be missing from this chart">
      <span className="flex items-center gap-1 text-xs text-warning">
        <Icon iconName="triangle-exclamation" iconStyle="regular" />
        Partial data
      </span>
    </Tooltip>
  )
}

export default PartialErrorBadge
