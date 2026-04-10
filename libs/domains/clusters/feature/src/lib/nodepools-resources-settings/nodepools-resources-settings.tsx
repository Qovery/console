import { add, format, parse } from 'date-fns'
import { type Cluster, WeekdayEnum } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { Button, Icon, Tooltip, useModal } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { NodepoolModal, type NodepoolModalProps } from './nodepool-modal/nodepool-modal'

const CARD_CLASSNAME = 'border-neutral bg-surface-neutral flex flex-col gap-4 rounded border p-4 text-sm'
const SECTION_TITLE_CLASSNAME = 'text-neutral font-medium'
const DESCRIPTION_CLASSNAME = 'text-neutral-subtle text-ssm'

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
  filter: 'default' | 'gpu' | 'cronjob'
}

interface NodepoolLimits {
  enabled?: boolean
  max_cpu_in_vcpu?: number | string | null
  max_memory_in_gibibytes?: number | string | null
  max_gpu?: number | string | null
}

interface NodepoolConsolidation {
  enabled?: boolean
  days?: string[]
}

interface NodepoolSummaryData {
  limits?: NodepoolLimits
  consolidation?: NodepoolConsolidation
  consolidate_after?: string
}

interface NodepoolCardConfig {
  type: NodepoolModalProps['type']
  title: string
  description: string
  defaultValues?: NodepoolModalProps['defaultValues']
  nodepool?: NodepoolSummaryData
  start?: string
  end?: string
  alwaysOn?: boolean
  showGpuLimit?: boolean
  onChange: NodepoolModalProps['onChange']
}

interface ScheduleTooltipProps {
  region: Cluster['region']
}

function ScheduleTooltip({ region }: ScheduleTooltipProps) {
  return (
    <Tooltip content={`Schedule (${region})`}>
      <span className="text-sm">
        <Icon iconName="circle-info" iconStyle="regular" />
      </span>
    </Tooltip>
  )
}

interface ResourceLimitsSummaryProps {
  limits?: NodepoolLimits
  showGpuLimit?: boolean
}

function ResourceLimitsSummary({ limits, showGpuLimit = false }: ResourceLimitsSummaryProps) {
  if (!limits?.enabled) {
    return <span>No limit</span>
  }

  const limitRows = [
    limits.max_cpu_in_vcpu ? `vCPU limit: ${limits.max_cpu_in_vcpu} vCPU;` : undefined,
    limits.max_memory_in_gibibytes ? `Memory limit: ${limits.max_memory_in_gibibytes} GiB` : undefined,
    showGpuLimit && limits.max_gpu ? `GPU limit: ${limits.max_gpu} GPU` : undefined,
  ].filter((value): value is string => value !== undefined)

  if (limitRows.length === 0) {
    return <span>No limit</span>
  }

  return (
    <div className="flex flex-col gap-1">
      {limitRows.map((limitRow) => (
        <span key={limitRow}>{limitRow}</span>
      ))}
    </div>
  )
}

interface ConsolidationSummaryProps {
  region: Cluster['region']
  nodepool?: NodepoolSummaryData
  start?: string
  end?: string
  alwaysOn?: boolean
}

function ConsolidationSummary({ region, nodepool, start = '', end = '', alwaysOn = false }: ConsolidationSummaryProps) {
  const isEnabled = alwaysOn || nodepool?.consolidation?.enabled

  if (!isEnabled) {
    return <span>Disabled</span>
  }

  const scheduleLabel = alwaysOn ? 'Operates every day' : formatWeekdays(nodepool?.consolidation?.days ?? [])
  const timeRangeLabel = alwaysOn ? '24 hours a day' : `${start} to ${end}`

  return (
    <span className="flex flex-col justify-center">
      <span className="flex gap-1.5">
        {scheduleLabel},
        <ScheduleTooltip region={region} />
      </span>
      <span>{timeRangeLabel}</span>
      {nodepool?.consolidate_after && (
        <span className="text-neutral-subtle">Consolidate after: {nodepool.consolidate_after}</span>
      )}
    </span>
  )
}

interface NodepoolSummaryCardProps {
  region: Cluster['region']
  title: string
  description: string
  nodepool?: NodepoolSummaryData
  start?: string
  end?: string
  alwaysOn?: boolean
  showGpuLimit?: boolean
  onEdit: () => void
}

function NodepoolSummaryCard({
  region,
  title,
  description,
  nodepool,
  start,
  end,
  alwaysOn = false,
  showGpuLimit = false,
  onEdit,
}: NodepoolSummaryCardProps) {
  return (
    <div className={CARD_CLASSNAME}>
      <div className="flex justify-between gap-10">
        <div className="flex flex-col gap-1.5">
          <p className={SECTION_TITLE_CLASSNAME}>{title}</p>
          <span className={DESCRIPTION_CLASSNAME}>{description}</span>
        </div>
        <Button type="button" variant="surface" color="neutral" onClick={onEdit} iconOnly>
          <Icon iconName="pen" iconStyle="solid" />
        </Button>
      </div>
      <div className="flex justify-between gap-4">
        <div className="flex w-1/2 flex-col gap-1">
          <span className={SECTION_TITLE_CLASSNAME}>Consolidation</span>
          <div className="flex flex-col justify-between gap-4 text-sm text-neutral">
            <ConsolidationSummary region={region} nodepool={nodepool} start={start} end={end} alwaysOn={alwaysOn} />
          </div>
        </div>
        <div className="flex w-1/2 flex-col gap-1">
          <span className={SECTION_TITLE_CLASSNAME}>Resources limit</span>
          <ResourceLimitsSummary limits={nodepool?.limits} showGpuLimit={showGpuLimit} />
        </div>
      </div>
    </div>
  )
}

export function NodepoolsResourcesSettings({ cluster, filter }: NodepoolsResourcesSettingsProps) {
  const { openModal } = useModal()
  const { watch, setValue } = useFormContext<ClusterResourcesData>()

  const watchStable = watch('karpenter.qovery_node_pools.stable_override')
  const watchDefault = watch('karpenter.qovery_node_pools.default_override')
  const watchGpu = watch('karpenter.qovery_node_pools.gpu_override')
  const watchCronjob = watch('karpenter.qovery_node_pools.cronjob_override')

  const { start: startStable, end: endStable } = formatTimeRange(
    watchStable?.consolidation?.start_time,
    watchStable?.consolidation?.duration
  )
  const { start: startGpu, end: endGpu } = formatTimeRange(
    watchGpu?.consolidation?.start_time,
    watchGpu?.consolidation?.duration
  )
  const { start: startCronjob, end: endCronjob } = formatTimeRange(
    watchCronjob?.consolidation?.start_time,
    watchCronjob?.consolidation?.duration
  )

  const openNodepoolModal = ({
    type,
    defaultValues,
    onChange,
  }: Pick<NodepoolCardConfig, 'type' | 'defaultValues' | 'onChange'>) =>
    openModal({
      content: <NodepoolModal type={type} cluster={cluster} defaultValues={defaultValues} onChange={onChange} />,
    })

  const cards = match(filter)
    .with('default', (): NodepoolCardConfig[] => [
      {
        type: 'stable',
        title: 'Stable nodepool',
        description:
          'Used for single instances and internal Qovery applications, such as containerized databases, to maintain stability.',
        defaultValues: watchStable,
        nodepool: watchStable,
        start: startStable,
        end: endStable,
        onChange: (data) => {
          setValue('karpenter.qovery_node_pools.stable_override', data.stable_override)
        },
      },
      {
        type: 'default',
        title: 'Default nodepool',
        description:
          'Designed to handle general workloads and serves as the foundation for deploying most applications.',
        defaultValues: watchDefault,
        nodepool: watchDefault,
        alwaysOn: true,
        onChange: (data) => {
          setValue('karpenter.qovery_node_pools.default_override', data.default_override)
        },
      },
    ])
    .with('gpu', (): NodepoolCardConfig[] => [
      {
        type: 'gpu',
        title: 'GPU nodepool',
        description: 'Used for GPU workloads, such as machine learning and data processing.',
        defaultValues: watchGpu,
        nodepool: watchGpu,
        start: startGpu,
        end: endGpu,
        showGpuLimit: true,
        onChange: (data) => {
          setValue('karpenter.qovery_node_pools.gpu_override', {
            ...watchGpu,
            limits: data.gpu_override?.limits,
            consolidation: data.gpu_override?.consolidation,
          })
        },
      },
    ])
    .with('cronjob', (): NodepoolCardConfig[] => [
      {
        type: 'cronjob',
        title: 'Cronjob nodepool',
        description:
          'Dedicated to cronjob workloads. Cronjob pods are automatically scheduled on this nodepool when enabled. Consolidation can be configured independently from the default nodepool.',
        defaultValues: watchCronjob,
        nodepool: watchCronjob,
        start: startCronjob,
        end: endCronjob,
        onChange: (data) => {
          setValue('karpenter.qovery_node_pools.cronjob_override', {
            ...watchCronjob,
            ...data.cronjob_override,
          })
        },
      },
    ])
    .exhaustive()

  return (
    <div>
      <div className="flex h-9 items-center justify-between border-y border-neutral px-4">
        <h2 className="text-ssm font-medium text-neutral">Nodepools configuration</h2>
        <Tooltip
          classNameContent="w-80"
          content="A NodePool is a group of nodes within a cluster that share the same configuration and characteristics. It allows you to manage resources efficiently by defining specific limits and settings for the group."
        >
          <span className="text-sm">
            <Icon iconName="circle-info" iconStyle="regular" />
          </span>
        </Tooltip>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {filter === 'default' && (
          <p className="text-ssm text-neutral-subtle">
            Karpenter settings above will be applied to the following nodepools
          </p>
        )}
        {cards.map((card) => (
          <NodepoolSummaryCard
            key={card.type}
            region={cluster.region}
            title={card.title}
            description={card.description}
            nodepool={card.nodepool}
            start={card.start}
            end={card.end}
            alwaysOn={card.alwaysOn}
            showGpuLimit={card.showGpuLimit}
            onEdit={() => openNodepoolModal(card)}
          />
        ))}
      </div>
    </div>
  )
}

export default NodepoolsResourcesSettings
