import { AlertSeverity } from 'qovery-typescript-axios'
import { twMerge } from '@qovery/shared/util-js'

export interface SeverityIndicatorProps {
  severity: AlertSeverity
  className?: string
}

interface SeverityConfig {
  label: string
  bars: number
  textColor: string
  barColor: string
  emptyBarColor: string
}

function getSeverityConfig(severity: AlertSeverity): SeverityConfig {
  switch (severity) {
    case AlertSeverity.WARNING:
      return {
        label: 'Medium',
        bars: 3,
        textColor: 'text-yellow-600',
        barColor: 'bg-yellow-500',
        emptyBarColor: 'bg-neutral-200',
      }
    case AlertSeverity.CRITICAL:
      return {
        label: 'Critical',
        bars: 5,
        textColor: 'text-red-600',
        barColor: 'bg-red-600',
        emptyBarColor: 'bg-neutral-200',
      }
    default:
      return {
        label: 'Unknown',
        bars: 0,
        textColor: 'text-neutral-350',
        barColor: 'bg-neutral-350',
        emptyBarColor: 'bg-neutral-300',
      }
  }
}

export function SeverityIndicator({ severity, className = '' }: SeverityIndicatorProps) {
  const config = getSeverityConfig(severity)

  return (
    <div className={twMerge('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            data-label={config.label}
            className={`h-3 w-0.5 ${i < config.bars ? config.barColor : config.emptyBarColor}`}
          />
        ))}
      </div>
      <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
    </div>
  )
}

export default SeverityIndicator
