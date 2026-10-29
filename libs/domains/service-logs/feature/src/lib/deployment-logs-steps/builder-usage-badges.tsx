import { type IconName } from '@fortawesome/fontawesome-common-types'
import clsx from 'clsx'
import { type BuildSettings, type BuilderUsage } from 'qovery-typescript-axios'
import { Fragment, type ReactNode } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useDefaultAdvancedSettings } from '@qovery/domains/services/feature'
import { Badge, Icon, Tooltip } from '@qovery/shared/ui'
import { type BuilderMemoryLevel, getBuilderUsageSummary } from '../utils/builder-usage'

type DefaultBuildLimits = { 'build.cpu_max_in_milli'?: number; 'build.ram_max_in_gib'?: number }

function UsageTooltipContent({ rows }: { rows: [label: string, value: string][] }) {
  return (
    <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm font-normal">
      {rows.map(([label, value]) => (
        <Fragment key={label}>
          <dt className="text-neutralInvert-subtle">{label}</dt>
          <dd className="text-right">{value}</dd>
        </Fragment>
      ))}
    </dl>
  )
}

function UsageBadge({
  label,
  level,
  tooltipContent,
}: {
  label: string
  level: BuilderMemoryLevel
  tooltipContent: ReactNode
}) {
  const { color, iconName } = match(level)
    .with('OOM', () => ({ color: 'red' as const, iconName: 'circle-exclamation' as IconName }))
    .with('WARNING', () => ({ color: 'yellow' as const, iconName: 'triangle-exclamation' as IconName }))
    .with('OK', () => ({ color: 'neutral' as const, iconName: 'circle-check' as IconName }))
    .exhaustive()

  return (
    <Tooltip content={tooltipContent} classNameContent="rounded-md px-3 py-2.5">
      <Badge
        size="sm"
        color={color}
        variant={level === 'OK' ? 'outline' : 'surface'}
        className={clsx('gap-1 font-medium', level === 'OK' && 'bg-surface-neutral')}
        tabIndex={0}
      >
        <Icon iconName={iconName} iconStyle="regular" />
        {label}
      </Badge>
    </Tooltip>
  )
}

export interface BuilderUsageBadgesProps {
  usage: BuilderUsage
  service?: AnyService
}

/**
 * CPU and memory the builder used, against the build limits of the service.
 */
export function BuilderUsageBadges({ usage, service }: BuilderUsageBadgesProps) {
  const buildSettings: BuildSettings | undefined =
    service && 'build_settings' in service ? service.build_settings : undefined
  // Services without their own build limits use the defaults
  const advancedSettingsServiceType = match(service?.serviceType)
    .with('APPLICATION', 'JOB', 'TERRAFORM', (serviceType) => serviceType)
    .otherwise(() => undefined)
  const { data: defaultAdvancedSettings } = useDefaultAdvancedSettings({
    serviceType: advancedSettingsServiceType ?? 'APPLICATION',
    enabled:
      advancedSettingsServiceType !== undefined &&
      (buildSettings?.cpu_max_in_milli === undefined || buildSettings?.ram_max_in_gib === undefined),
  })
  const defaultBuildLimits = defaultAdvancedSettings as DefaultBuildLimits | undefined

  const summary = getBuilderUsageSummary(usage, {
    cpuMilli: buildSettings?.cpu_max_in_milli ?? defaultBuildLimits?.['build.cpu_max_in_milli'],
    memoryGib: buildSettings?.ram_max_in_gib ?? defaultBuildLimits?.['build.ram_max_in_gib'],
  })
  if (!summary) return null

  return (
    <>
      <UsageBadge
        label="CPU"
        level="OK"
        tooltipContent={
          <UsageTooltipContent
            rows={[
              ['Average', summary.cpu.average],
              ['Peak', summary.cpu.peak],
            ]}
          />
        }
      />
      <UsageBadge
        label="Memory"
        level={summary.memory.level}
        tooltipContent={<UsageTooltipContent rows={[['Peak', summary.memory.peak]]} />}
      />
      <span className="h-2 border-l border-neutral" aria-hidden="true" />
    </>
  )
}

export default BuilderUsageBadges
