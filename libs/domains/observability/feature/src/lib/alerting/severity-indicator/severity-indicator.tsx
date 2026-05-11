import { type AlertSeverity } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
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
  return match(severity)
    .with('LOW', () => ({
      label: 'Low',
      bars: 2,
      textColor: 'text-neutral-subtle',
      barColor: 'bg-surface-neutral-solid',
      emptyBarColor: 'bg-surface-neutral-componentActive',
    }))
    .with('MEDIUM', () => ({
      label: 'Medium',
      bars: 3,
      textColor: 'text-neutral-subtle',
      barColor: 'bg-surface-neutral-solid',
      emptyBarColor: 'bg-surface-neutral-componentActive',
    }))
    .with('HIGH', () => ({
      label: 'High',
      bars: 4,
      textColor: 'text-neutral-subtle',
      barColor: 'bg-surface-neutral-solid',
      emptyBarColor: 'bg-surface-neutral-componentActive',
    }))
    .with('CRITICAL', () => ({
      label: 'Critical',
      bars: 5,
      textColor: 'text-neutral-subtle',
      barColor: 'bg-surface-neutral-solid',
      emptyBarColor: 'bg-surface-neutral-componentActive',
    }))
    .exhaustive()
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
      <span className={`relative -top-[0.5px] text-sm ${config.textColor}`}>{config.label}</span>
    </div>
  )
}

export default SeverityIndicator
