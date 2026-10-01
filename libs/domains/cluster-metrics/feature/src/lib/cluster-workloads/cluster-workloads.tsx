import { useQueries } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { type EnvironmentModeEnum, type ServiceLightResponse } from 'qovery-typescript-axios'
import { Fragment, type KeyboardEvent, useMemo, useState } from 'react'
import { useServicesCluster } from '@qovery/domains/clusters/feature'
import { EnvironmentMode } from '@qovery/domains/environments/feature'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { Heading, Icon, Link, ProgressBar, Skeleton, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import {
  calculatePercentage,
  formatNumber,
  mibToGib,
  milliCoreToVCPU,
  pluralize,
  twMerge,
} from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import { useClusterMetrics } from '../hooks/use-cluster-metrics/use-cluster-metrics'
import { ReservedTooltipContent } from '../metric-progress-bar/metric-progress-bar'
import {
  type ClusterWorkloads as ClusterWorkloadsData,
  type EnvironmentWorkload,
  type ServiceWorkload,
  type WorkloadResources,
  type WorkloadSortKey,
  calculateClusterWorkloads,
  sortWorkloads,
} from './calculate-cluster-workloads'

const { Table } = TablePrimitives

const TOP_CONSUMERS_COUNT = 5
const SYSTEM_ROW_ID = 'cluster-system'

// Categorical palette shared with the console charts, status colors excluded.
// Ten entries: the CPU and memory top 5 can be different items, and each item keeps one color across both bars
const SEGMENT_COLORS = [
  'var(--color-r-ams)',
  'var(--color-r-atl)',
  'var(--color-r-bos)',
  'var(--color-r-gig)',
  'var(--color-r-mad)',
  'var(--color-r-arn)',
  'var(--color-r-bom)',
  'var(--color-r-lhr)',
  'var(--color-r-bog)',
  'var(--color-r-mia)',
]
const OTHERS_COLOR = 'var(--neutral-9)'
const SYSTEM_COLOR = 'var(--neutral-7)'

export const formatCpu = (cpuMilli: number) =>
  cpuMilli < 1000 ? `${Math.round(cpuMilli)} mCPU` : `${formatNumber(milliCoreToVCPU(cpuMilli), 2)} vCPU`

export const formatMemory = (memoryMib: number) =>
  memoryMib < 1024 ? `${Math.round(memoryMib)} MiB` : `${formatNumber(mibToGib(memoryMib), 1)} GiB`

const countLabel = (count: number, singular: string, plural: string) => `${count} ${pluralize(count, singular, plural)}`

const resourceValue = (resources: WorkloadResources, sortKey: WorkloadSortKey) =>
  sortKey === 'cpu' ? resources.cpuMilli : resources.memoryMib

const formatResource = (value: number, sortKey: WorkloadSortKey) =>
  sortKey === 'cpu' ? formatCpu(value) : formatMemory(value)

const rowDomId = (id: string) => `workload-row-${id}`

function ServiceIcon({ service }: { service?: ServiceLightResponse }) {
  if (!service) {
    return <Icon iconName="cube" iconStyle="regular" className="w-4 text-center text-xs text-neutral-subtle" />
  }

  return (
    <ServiceAvatar
      size="xs"
      border="none"
      service={
        service.service_type === 'JOB'
          ? { icon_uri: service.icon_uri, serviceType: 'JOB', job_type: service.job_type ?? 'CRON' }
          : { icon_uri: service.icon_uri, serviceType: service.service_type }
      }
    />
  )
}

interface Segment {
  id: string
  name: string
  subtitle?: string
  value: number
  color: string
  // Only the top consumers are linked to a table row
  isRow?: boolean
}

function AllocationBar({
  label,
  sortKey,
  segments,
  allocated,
  total,
  highlightedId,
  onHighlight,
  onSelect,
}: {
  label: string
  sortKey: WorkloadSortKey
  segments: Segment[]
  allocated: number
  total: number
  highlightedId?: string
  onHighlight: (id?: string) => void
  onSelect: (id: string) => void
}) {
  return (
    <>
      <span className="text-sm font-medium text-neutral">{label}</span>
      <span className="whitespace-nowrap text-sm tabular-nums text-neutral-subtle">
        <span className="text-neutral">{formatResource(allocated, sortKey)}</span> / {formatResource(total, sortKey)} ·{' '}
        {Math.round(calculatePercentage(allocated, total))}%
      </span>
      <ProgressBar.Root
        className="col-span-2 h-3 md:col-span-1"
        role="group"
        aria-label={`${label}: ${formatResource(allocated, sortKey)} allocated out of ${formatResource(total, sortKey)}`}
      >
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => {
            const percentage = calculatePercentage(segment.value, total)
            const isDimmed = highlightedId !== undefined && highlightedId !== segment.id

            return (
              <Tooltip
                key={segment.id}
                classNameContent="w-56"
                content={
                  <div className="flex flex-col gap-1 text-left font-normal">
                    <span className="break-words font-medium">{segment.name}</span>
                    {segment.subtitle && (
                      <span className="break-words text-neutralInvert-subtle">{segment.subtitle}</span>
                    )}
                    <span className="text-neutralInvert-subtle">
                      {formatResource(segment.value, sortKey)} · {formatNumber(percentage, 1)}% of cluster
                    </span>
                  </div>
                }
              >
                <ProgressBar.Cell
                  value={percentage}
                  color={segment.color}
                  className={twMerge('transition-opacity', isDimmed && 'opacity-30', segment.isRow && 'cursor-pointer')}
                  {...(segment.isRow
                    ? {
                        role: 'button',
                        tabIndex: 0,
                        'aria-label': `${segment.name}: ${formatResource(segment.value, sortKey)}, ${formatNumber(percentage, 1)}% of cluster. Show in the table`,
                        onMouseEnter: () => onHighlight(segment.id),
                        onMouseLeave: () => onHighlight(undefined),
                        onFocus: () => onHighlight(segment.id),
                        onBlur: () => onHighlight(undefined),
                        onClick: () => onSelect(segment.id),
                        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            onSelect(segment.id)
                          }
                        },
                      }
                    : {
                        role: 'img',
                        'aria-label': `${segment.name}: ${formatResource(segment.value, sortKey)}, ${formatNumber(percentage, 1)}% of cluster`,
                      })}
                />
              </Tooltip>
            )
          })}
      </ProgressBar.Root>
    </>
  )
}

function EnvironmentModeBadge({ mode }: { mode?: EnvironmentModeEnum }) {
  return mode ? <EnvironmentMode mode={mode} variant="shrink" className="shrink-0" /> : null
}

function NamespacesCell({ namespaces }: { namespaces: string[] }) {
  const [main, ...others] = namespaces
  if (!main) return null

  return (
    <div className="flex min-w-0 items-center gap-1.5 text-sm">
      <Tooltip content={main}>
        <span className="truncate text-neutral">{main}</span>
      </Tooltip>
      {others.length > 0 && (
        <Tooltip
          content={
            <div className="flex flex-col gap-0.5">
              <span>Also running in:</span>
              {others.map((namespace) => (
                <span key={namespace}>{namespace}</span>
              ))}
            </div>
          }
        >
          <span className="shrink-0 rounded bg-surface-neutral-component px-1 text-neutral">+{others.length}</span>
        </Tooltip>
      )}
    </div>
  )
}

function ResourceCell({ type, value, total }: { type: WorkloadSortKey; value: number; total: number }) {
  const percentage = calculatePercentage(value, total)
  const toUnit = type === 'cpu' ? milliCoreToVCPU : mibToGib

  return (
    <Tooltip
      align="start"
      classNameContent="w-[173px] p-0"
      content={
        <ReservedTooltipContent
          type={type}
          reserved={formatNumber(toUnit(value))}
          total={formatNumber(toUnit(total))}
          unit={type === 'cpu' ? 'vCPU' : 'GiB'}
        />
      }
    >
      <span className="whitespace-nowrap rounded text-sm tabular-nums text-neutral" tabIndex={0}>
        {formatResource(value, type)}
        <span className="text-neutral-subtle">
          {' '}
          {percentage > 0 && percentage < 1 ? '<1' : Math.round(percentage)}%
        </span>
      </span>
    </Tooltip>
  )
}

// Same grid and cell treatment as the environment service list
const tableGridLayoutClassName =
  'grid w-full grid-cols-[minmax(260px,1.6fr)_minmax(180px,1fr)_72px_minmax(200px,1fr)_minmax(200px,1fr)]'
const cellClassName = 'relative flex h-full min-w-0 items-center border-r border-neutral last:border-r-0'

function WorkloadsTable({
  organizationId,
  workloads,
  servicesById,
  colorById,
  modeByEnvironmentId,
  highlightedId,
  onHighlight,
  expandedIds,
  onToggle,
}: {
  organizationId: string
  workloads: ClusterWorkloadsData
  servicesById: Map<string, ServiceLightResponse>
  colorById: Map<string, string>
  modeByEnvironmentId: Map<string, EnvironmentModeEnum>
  highlightedId?: string
  onHighlight: (id?: string) => void
  expandedIds: Set<string>
  onToggle: (id: string) => void
}) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState<WorkloadSortKey>('cpu')
  const environments = useMemo(
    () =>
      sortWorkloads(workloads.environments, sortKey).map((environment) => ({
        ...environment,
        services: sortWorkloads(environment.services, sortKey),
      })),
    [workloads.environments, sortKey]
  )
  const namespaces = useMemo(() => sortWorkloads(workloads.system.namespaces, sortKey), [workloads.system, sortKey])
  const { capacity } = workloads

  const goToService = (service: ServiceWorkload) =>
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: {
        organizationId,
        projectId: service.projectId,
        environmentId: service.environmentId,
        serviceId: service.id,
      },
    })

  const expandButton = (id: string, label: string) => (
    <button
      type="button"
      aria-label={`${expandedIds.has(id) ? 'Collapse' : 'Expand'} ${label}`}
      aria-expanded={expandedIds.has(id)}
      onClick={(event) => {
        event.stopPropagation()
        onToggle(id)
      }}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-neutral-subtle hover:bg-surface-neutral-componentHover hover:text-neutral"
    >
      <Icon iconName={expandedIds.has(id) ? 'chevron-down' : 'chevron-right'} iconStyle="regular" className="text-xs" />
    </button>
  )

  const sortableHeader = (key: WorkloadSortKey, label: string) => (
    <Table.ColumnHeaderCell
      className={twMerge(cellClassName, 'text-neutral-subtle')}
      aria-sort={sortKey === key ? 'descending' : 'none'}
    >
      <button
        type="button"
        onClick={() => setSortKey(key)}
        className="flex cursor-pointer select-none items-center gap-1 truncate"
      >
        {label}
        {sortKey === key && <Icon className="text-ssm" iconName="arrow-down" />}
      </button>
    </Table.ColumnHeaderCell>
  )

  const clickableRowProps = (id: string, onOpen: () => void) => ({
    id: rowDomId(id),
    tabIndex: 0,
    onClick: onOpen,
    onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key === 'Enter' && event.target === event.currentTarget) onOpen()
    },
    onMouseEnter: () => colorById.has(id) && onHighlight(id),
    onMouseLeave: () => colorById.has(id) && onHighlight(undefined),
    className: twMerge(
      `h-[60px] w-full cursor-pointer scroll-mt-16 hover:bg-surface-neutral-subtle ${tableGridLayoutClassName}`,
      highlightedId === id && 'bg-surface-neutral-subtle'
    ),
  })

  const resourceCells = (resources: WorkloadResources) => (
    <>
      <Table.Cell className={twMerge(cellClassName, 'text-sm text-neutral-subtle')}>{resources.pods}</Table.Cell>
      <Table.Cell className={cellClassName}>
        <ResourceCell type="cpu" value={resources.cpuMilli} total={capacity.cpuMilli} />
      </Table.Cell>
      <Table.Cell className={cellClassName}>
        <ResourceCell type="memory" value={resources.memoryMib} total={capacity.memoryMib} />
      </Table.Cell>
    </>
  )

  const childRowClassName = `h-12 w-full bg-surface-neutral-subtle ${tableGridLayoutClassName}`

  const environmentRow = (environment: EnvironmentWorkload) => (
    <Fragment key={environment.id}>
      <Table.Row {...clickableRowProps(environment.id, () => onToggle(environment.id))}>
        <Table.Cell className={cellClassName}>
          <div className="flex min-w-0 items-center gap-2">
            {expandButton(environment.id, environment.name)}
            <div className="flex min-w-0 flex-col">
              <div className="flex min-w-0 items-center gap-1.5">
                <EnvironmentModeBadge mode={modeByEnvironmentId.get(environment.id)} />
                <Link
                  to="/organization/$organizationId/project/$projectId/environment/$environmentId/overview"
                  params={{ organizationId, projectId: environment.projectId, environmentId: environment.id }}
                  color="neutral"
                  className="block min-w-0 truncate"
                  onClick={(event) => event.stopPropagation()}
                >
                  {environment.name}
                </Link>
              </div>
              <span className="truncate text-xs text-neutral-subtle">
                {environment.projectName} · {countLabel(environment.services.length, 'service', 'services')}
              </span>
            </div>
          </div>
        </Table.Cell>
        <Table.Cell className={cellClassName}>
          <NamespacesCell namespaces={environment.namespaces} />
        </Table.Cell>
        {resourceCells(environment)}
      </Table.Row>
      {expandedIds.has(environment.id) &&
        environment.services.map((service) => (
          <Table.Row
            key={service.id}
            tabIndex={0}
            onClick={() => goToService(service)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') goToService(service)
            }}
            className={twMerge(childRowClassName, 'cursor-pointer hover:bg-surface-neutral-component')}
          >
            <Table.Cell className={twMerge(cellClassName, 'pl-12')}>
              <div className="flex min-w-0 items-center gap-2">
                <ServiceIcon service={servicesById.get(service.id)} />
                <span className="truncate text-sm text-neutral">{service.name}</span>
              </div>
            </Table.Cell>
            <Table.Cell className={cellClassName}>
              <NamespacesCell namespaces={service.namespaces} />
            </Table.Cell>
            <Table.Cell className={twMerge(cellClassName, 'text-sm text-neutral-subtle')}>{service.pods}</Table.Cell>
            <Table.Cell className={cellClassName}>
              <ResourceCell type="cpu" value={service.cpuMilli} total={capacity.cpuMilli} />
            </Table.Cell>
            <Table.Cell className={cellClassName}>
              <ResourceCell type="memory" value={service.memoryMib} total={capacity.memoryMib} />
            </Table.Cell>
          </Table.Row>
        ))}
    </Fragment>
  )

  return (
    <Table.Root className="w-full min-w-[960px] text-xs" containerClassName="rounded-none border-none">
      <Table.Header className="border-t border-neutral">
        <Table.Row className={`h-9 w-full ${tableGridLayoutClassName}`}>
          <Table.ColumnHeaderCell className={twMerge(cellClassName, 'text-neutral-subtle')}>
            Environment
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className={twMerge(cellClassName, 'text-neutral-subtle')}>
            Namespace
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className={twMerge(cellClassName, 'text-neutral-subtle')}>
            Pods
          </Table.ColumnHeaderCell>
          {sortableHeader('cpu', 'CPU allocated')}
          {sortableHeader('memory', 'Memory allocated')}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {environments.map(environmentRow)}
        {workloads.system.pods > 0 && (
          <>
            <Table.Row className={`h-[60px] w-full ${tableGridLayoutClassName}`}>
              <Table.Cell className={cellClassName}>
                <div className="flex min-w-0 items-center gap-2">
                  {expandButton(SYSTEM_ROW_ID, 'cluster system')}
                  <Icon iconName="gear" iconStyle="regular" className="w-4 shrink-0 text-center text-neutral-subtle" />
                  <span className="flex items-center gap-1.5 text-sm font-medium text-neutral">
                    Cluster system
                    <Tooltip content="Pods not linked to a Qovery service: Kubernetes components, cluster add-ons and Qovery agents.">
                      <span className="text-neutral-subtle">
                        <Icon iconName="circle-question" iconStyle="regular" className="text-xs" />
                      </span>
                    </Tooltip>
                  </span>
                </div>
              </Table.Cell>
              <Table.Cell className={twMerge(cellClassName, 'text-sm text-neutral-subtle')}>
                {countLabel(workloads.system.namespaces.length, 'namespace', 'namespaces')}
              </Table.Cell>
              {resourceCells(workloads.system)}
            </Table.Row>
            {expandedIds.has(SYSTEM_ROW_ID) &&
              namespaces.map((namespace) => (
                <Table.Row key={namespace.name} className={childRowClassName}>
                  <Table.Cell className={cellClassName} />
                  <Table.Cell className={cellClassName}>
                    <NamespacesCell namespaces={[namespace.name]} />
                  </Table.Cell>
                  <Table.Cell className={twMerge(cellClassName, 'text-sm text-neutral-subtle')}>
                    {namespace.pods}
                  </Table.Cell>
                  <Table.Cell className={cellClassName}>
                    <ResourceCell type="cpu" value={namespace.cpuMilli} total={capacity.cpuMilli} />
                  </Table.Cell>
                  <Table.Cell className={cellClassName}>
                    <ResourceCell type="memory" value={namespace.memoryMib} total={capacity.memoryMib} />
                  </Table.Cell>
                </Table.Row>
              ))}
          </>
        )}
      </Table.Body>
    </Table.Root>
  )
}

export interface ClusterWorkloadsProps {
  organizationId: string
  clusterId: string
}

export function ClusterWorkloads({ organizationId, clusterId }: ClusterWorkloadsProps) {
  const { data: metrics } = useClusterMetrics({ organizationId, clusterId })
  const { data: services = [] } = useServicesCluster({ organizationId, clusterId })
  const [hoveredId, setHoveredId] = useState<string>()
  const [selectedId, setSelectedId] = useState<string>()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const isLoading = metrics === undefined
  const isUnavailable = typeof metrics === 'string'

  const workloads = useMemo(
    () => calculateClusterWorkloads(typeof metrics === 'object' && metrics !== null ? metrics.nodes : undefined),
    [metrics]
  )
  const servicesById = useMemo(() => new Map(services.map((service) => [service.id, service])), [services])

  // Environment modes (production, staging...) are not part of the pod data, so load them per project on the cluster
  const projectIds = useMemo(
    () => [...new Set(workloads.environments.map((environment) => environment.projectId))],
    [workloads.environments]
  )
  const environmentLists = useQueries({
    queries: projectIds.map((projectId) => ({ ...queries.environments.list({ projectId }) })),
  })
  const modeByEnvironmentId = new Map<string, EnvironmentModeEnum>(
    environmentLists.flatMap(({ data = [] }) => data.map((environment) => [environment.id, environment.mode] as const))
  )

  const toggleExpanded = (id: string) =>
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

  const items = workloads.environments.map((environment) => ({
    ...environment,
    subtitle: `Project: ${environment.projectName} · ${countLabel(environment.services.length, 'service', 'services')}`,
  }))

  const topBy = {
    cpu: sortWorkloads(items, 'cpu').slice(0, TOP_CONSUMERS_COUNT),
    memory: sortWorkloads(items, 'memory').slice(0, TOP_CONSUMERS_COUNT),
  }

  const colorById = new Map<string, string>()
  for (const item of [...topBy.cpu, ...topBy.memory]) {
    if (!colorById.has(item.id)) {
      colorById.set(item.id, SEGMENT_COLORS[colorById.size % SEGMENT_COLORS.length])
    }
  }

  const othersLabel = 'Other environments'

  const bars = (['cpu', 'memory'] as const).map((sortKey) => {
    const system = resourceValue(workloads.system, sortKey)
    const allocated = resourceValue(workloads.allocated, sortKey)
    const top = topBy[sortKey]
    const others = allocated - system - top.reduce((sum, item) => sum + resourceValue(item, sortKey), 0)

    return {
      sortKey,
      label: sortKey === 'cpu' ? 'CPU' : 'Memory',
      allocated,
      total: sortKey === 'cpu' ? workloads.capacity.cpuMilli : workloads.capacity.memoryMib,
      segments: [
        ...top.map((item) => ({
          id: item.id,
          name: item.name,
          subtitle: item.subtitle,
          value: resourceValue(item, sortKey),
          color: colorById.get(item.id) ?? OTHERS_COLOR,
          isRow: true,
        })),
        { id: 'others', name: othersLabel, value: Math.max(others, 0), color: OTHERS_COLOR },
        { id: 'system', name: 'Cluster system', value: system, color: SYSTEM_COLOR },
      ],
    }
  })

  const highlightedId = hoveredId ?? selectedId

  const selectRow = (id: string) => {
    setSelectedId((previous) => (previous === id ? undefined : id))
    setExpandedIds((previous) => new Set(previous).add(id))
    document.getElementById(rowDomId(id))?.scrollIntoView({ block: 'center' })
  }

  if (isUnavailable) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-1 rounded border border-neutral bg-surface-neutral text-sm text-neutral">
        <Icon className="text-xl text-neutral-subtle" iconName="circle-info" iconStyle="regular" />
        <span className="font-medium">No workload data available because the cluster metrics are unavailable.</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <Heading>Workloads</Heading>
        <hr className="w-full border-neutral" />
      </div>
      <div>
        <div className="rounded-lg bg-background">
          <div className="no-scrollbar overflow-x-scroll rounded-lg border border-neutral xl:overflow-hidden">
            <div className="bg-surface-neutral px-4 py-3">
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  <Skeleton width="100%" height={20} />
                  <Skeleton width="100%" height={20} />
                </div>
              ) : (
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 md:grid-cols-[auto_auto_minmax(0,1fr)] md:gap-y-3">
                  {bars.map((bar) => (
                    <AllocationBar
                      key={bar.sortKey}
                      label={bar.label}
                      sortKey={bar.sortKey}
                      segments={bar.segments}
                      allocated={bar.allocated}
                      total={bar.total}
                      highlightedId={highlightedId}
                      onHighlight={setHoveredId}
                      onSelect={selectRow}
                    />
                  ))}
                </div>
              )}
            </div>
            {isLoading ? (
              <div className="flex flex-col gap-2 border-t border-neutral p-4">
                {[0, 1, 2, 3].map((index) => (
                  <Skeleton key={index} width="100%" height={32} />
                ))}
              </div>
            ) : (
              <WorkloadsTable
                organizationId={organizationId}
                workloads={workloads}
                servicesById={servicesById}
                colorById={colorById}
                modeByEnvironmentId={modeByEnvironmentId}
                highlightedId={highlightedId}
                onHighlight={setHoveredId}
                expandedIds={expandedIds}
                onToggle={toggleExpanded}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClusterWorkloads
