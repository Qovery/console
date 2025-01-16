import { add, format, parse } from 'date-fns'
import { type Cluster, WeekdayEnum } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { BlockContent, Button, Icon, Tooltip, useModal } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { NodepoolModal } from './nodepool-modal/nodepool-modal'

export const formatTimeRange = (
  startTime?: string,
  duration?: string
): {
  start: string
  end: string
} => {
  if (startTime === undefined || duration === undefined || startTime === '' || duration === '')
    return { start: '', end: '' }

  const baseDate = parse(startTime.replace('PT', ''), 'HH:mm', new Date())

  const durationHours = parseInt(duration.match(/(\d+)H/)?.[1] || '0')
  const durationMinutes = parseInt(duration.match(/(\d+)M/)?.[1] || '0')

  const endDate = add(baseDate, {
    hours: durationHours,
    minutes: durationMinutes,
  })

  return {
    start: format(baseDate, 'h:mm a').toLowerCase(),
    end: format(endDate, 'h:mm a').toLowerCase(),
  }
}

export const shortenDay = (day: string): string => {
  return upperCaseFirstLetter(day).slice(0, 3)
}

export const formatWeekdays = (days: string[]): string => {
  if (days.length === 0) return ''

  const fullWeek = days.length === 7
  if (fullWeek) {
    return 'Operates every day'
  }

  const weekdayOrder = Object.keys(WeekdayEnum).map((day) => day)
  const daysIndices = days.map((day) => weekdayOrder.indexOf(day)).sort((a, b) => a - b)

  const isConsecutive = daysIndices.every((day, index) => {
    if (index === 0) return true
    return day === daysIndices[index - 1] + 1
  })

  if (isConsecutive) {
    if (days.length > 1) {
      return `${upperCaseFirstLetter(days[0])} to ${upperCaseFirstLetter(days[days.length - 1])}`
    } else {
      return upperCaseFirstLetter(days[0])
    }
  }

  return days.map(shortenDay).join(', ')
}

export interface NodepoolsResourcesSettingsProps {
  cluster: Cluster
}

export function NodepoolsResourcesSettings({ cluster }: NodepoolsResourcesSettingsProps) {
  const { openModal } = useModal()
  const { watch, setValue } = useFormContext<ClusterResourcesData>()

  const watchStable = watch('karpenter.qovery_node_pools.stable_override')
  const watchDefault = watch('karpenter.qovery_node_pools.default_override')

  const { start, end } = formatTimeRange(watchStable?.consolidation?.start_time, watchStable?.consolidation?.duration)

  return (
    <BlockContent
      title="Nodepools configuration"
      classNameContent="p-0"
      headRight={
        <Tooltip
          classNameContent="w-80"
          content="A NodePool is a group of nodes within a cluster that share the same configuration and characteristics. It allows you to manage resources efficiently by defining specific limits and settings for the group."
        >
          <span className="text-sm">
            <Icon iconName="circle-info" iconStyle="regular" />
          </span>
        </Tooltip>
      }
    >
      <div className="flex gap-4 border-b border-neutral-250 px-4 py-3 text-sm">
        <div className="w-1/2">
          <p className="mb-1 font-medium text-neutral-400">Stable nodepool</p>
          <span className="text-neutral-350">
            Used for single instances and internal Qovery applications, such as containerized databases, to maintain
            stability.
          </span>
        </div>
        <div className="flex w-1/2 justify-between gap-3">
          <div className="flex flex-col justify-between gap-4 text-sm text-neutral-400">
            {watchStable?.consolidation?.enabled ? (
              <span className="flex flex-col justify-center">
                <span className="flex gap-1.5">
                  {formatWeekdays(watchStable?.consolidation?.days)},
                  <Tooltip content={`Schedule (${cluster.region})`}>
                    <span className="text-sm">
                      <Icon iconName="circle-info" iconStyle="regular" />
                    </span>
                  </Tooltip>
                </span>
                <span>
                  {start} to {end}
                </span>
              </span>
            ) : (
              <span>Consolidation schedule: disabled</span>
            )}
            {watchStable?.limits && (
              <span>
                {watchStable.limits.max_cpu_in_vcpu && (
                  <span>vCPU limit: {watchStable?.limits?.max_cpu_in_vcpu} vCPU; </span>
                )}
                {watchStable.limits.max_memory_in_gibibytes && (
                  <span>Memory limit: {watchStable?.limits?.max_memory_in_gibibytes} GiB</span>
                )}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="surface"
            color="neutral"
            onClick={() =>
              openModal({
                content: (
                  <NodepoolModal
                    type="stable"
                    cluster={cluster}
                    onChange={(data) => {
                      setValue('karpenter.qovery_node_pools.stable_override', data.stable_override)
                    }}
                    defaultValues={watchStable}
                  />
                ),
              })
            }
          >
            <Icon iconName="pen" iconStyle="solid" />
          </Button>
        </div>
      </div>
      <div className="flex gap-4 px-4 py-3 text-sm">
        <div className="w-1/2">
          <p className="mb-1 font-medium text-neutral-400">Default nodepool</p>
          <span className="text-neutral-350">
            Designed to handle general workloads and serves as the foundation for deploying most applications.
          </span>
        </div>
        <div className="flex w-1/2 justify-between gap-3">
          <div className="flex flex-col justify-between gap-4 text-sm text-neutral-400">
            <span className="flex flex-col justify-center">
              <span className="flex gap-1.5">
                Operates every day,
                <Tooltip content={`Schedule (${cluster.region})`}>
                  <span className="text-sm">
                    <Icon iconName="circle-info" iconStyle="regular" />
                  </span>
                </Tooltip>
              </span>
              <span>24 hours a day</span>
            </span>
            <span>
              {watchDefault?.limits?.max_cpu_in_vcpu && (
                <span>vCPU limit: {watchDefault?.limits?.max_cpu_in_vcpu} vCPU; </span>
              )}
              {watchDefault?.limits?.max_memory_in_gibibytes && (
                <span>Memory limit: {watchDefault?.limits?.max_memory_in_gibibytes} GiB</span>
              )}
            </span>
          </div>
          <Button
            type="button"
            variant="surface"
            color="neutral"
            onClick={() =>
              openModal({
                content: (
                  <NodepoolModal
                    type="default"
                    cluster={cluster}
                    defaultValues={watchDefault}
                    onChange={(data) => {
                      setValue('karpenter.qovery_node_pools.default_override', data.default_override)
                    }}
                  />
                ),
              })
            }
          >
            <Icon iconName="pen" iconStyle="solid" />
          </Button>
        </div>
      </div>
    </BlockContent>
  )
}

export default NodepoolsResourcesSettings
