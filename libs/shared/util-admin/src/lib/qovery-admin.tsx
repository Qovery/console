import { Tooltip } from '@qovery/shared/ui'
import { useApplicationMetrics } from './use-application-metrics'

const MetricItem = ({
  label,
  value,
  unit,
  status,
  description,
}: {
  label: string
  value: string
  unit: string
  status: string
  description: string
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-brand-600'
    }
  }

  return (
    <div className="flex gap-2 text-xs">
      <Tooltip content={description}>
        <span className="font-medium text-neutral-350">{label}</span>
      </Tooltip>
      <span className={getStatusColor()}>
        {value}
        {unit}
      </span>
    </div>
  )
}

export function QoveryAdmin() {
  const { metrics } = useApplicationMetrics()

  return (
    <div className="flex h-8 w-full items-center gap-10 border-b border-neutral-200 bg-white px-4 font-code">
      <MetricItem
        label="Jank"
        description="Percentage of frames dropped"
        value={metrics.jank.toString()}
        unit="%"
        status={metrics.jank > 10 ? 'error' : 'good'}
      />
      <MetricItem
        label="Delay"
        description="Average network and processing delays in ms"
        value={metrics.delay.toString()}
        unit="ms"
        status={metrics.delay > 100 ? 'error' : 'good'}
      />
      <MetricItem
        label="Req"
        description="Number of active network requests"
        value={metrics.net.toString()}
        unit="req"
        status={metrics.net > 10 ? 'error' : 'good'}
      />
      <MetricItem
        label="Mem"
        description="Memory usage in GB"
        value={metrics.mem.toString()}
        unit="GB"
        status={metrics.mem > 1 ? 'error' : 'good'}
      />
    </div>
  )
}

export default QoveryAdmin
