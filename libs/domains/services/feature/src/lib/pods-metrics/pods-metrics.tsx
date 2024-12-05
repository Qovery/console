import {
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type ServiceStateDto } from 'qovery-ws-typescript-axios'
import { Fragment, type PropsWithChildren, memo, useEffect, useMemo, useState } from 'react'
import { P, match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceTypeEnum, isJobContainerSource } from '@qovery/shared/enums'
import {
  Badge,
  Button,
  CopyToClipboard,
  Icon,
  IconAwesomeEnum,
  StatusChip,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { formatMetric, twMerge } from '@qovery/shared/util-js'
import { useMetrics } from '../hooks/use-metrics/use-metrics'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'
import { useService } from '../hooks/use-service/use-service'
import { type Pod, PodDetails } from '../pod-details/pod-details'
import EmptyState from './empty-state'
import { PodsMetricsSkeleton } from './pods-metrics-skeleton'

const { Table } = TablePrimitives

const columnHelper = createColumnHelper<Pod>()
const placeholder = <Icon iconStyle="regular" iconName="circle-question" className="text-sm text-neutral-300" />

export interface PodsMetricsMemoizedProps extends PropsWithChildren {
  environmentId: string
  serviceId: string
  pods: Pod[]
  service?: AnyService
  isServiceLoading: boolean
  isServiceError: boolean
  isMetricsLoading: boolean
  isMetricsError: boolean
  isRunningStatusesLoading: boolean
  isRunningStatusesError: boolean
}

// NOTE: Memoized component to avoid loop with re-rendering, because of the useReactTable hook and the WS subscription
// https://qovery.atlassian.net/browse/FRT-1391
const PodsMetricsMemoized = memo(PodsMetricsTable)

function PodsMetricsTable({
  environmentId,
  serviceId,
  children,
  pods,
  service,
  isMetricsError,
  isMetricsLoading,
  isRunningStatusesError,
  isRunningStatusesLoading,
  isServiceError,
  isServiceLoading,
}: PodsMetricsMemoizedProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const containerImage = match(service)
    .with({ serviceType: ServiceTypeEnum.JOB, source: P.when(isJobContainerSource) }, () => true)
    .with({ serviceType: ServiceTypeEnum.CONTAINER }, () => true)
    .otherwise(() => false)

  const columns = useMemo(() => {
    const podsColumn = columnHelper.accessor('podName', {
      header: () => `Pods (${pods.length})`,
      cell: (info) => {
        const podName = info.getValue()
        return podName.length > 23 ? (
          <Tooltip content={podName}>
            <div className="inline-block">
              <CopyToClipboard text={podName}>
                <Button variant="surface" color="neutral" onClick={(e) => e.stopPropagation()}>
                  {podName.substring(0, 10)}...{podName.slice(-10)}
                </Button>
              </CopyToClipboard>
            </div>
          </Tooltip>
        ) : (
          <CopyToClipboard text={podName}>
            <Button className="truncate" variant="surface" color="neutral" onClick={(e) => e.stopPropagation()}>
              {podName}
            </Button>
          </CopyToClipboard>
        )
      },
    })
    const statusColumn = columnHelper.accessor('state', {
      header: 'Status',
      cell: (info) => (
        <Badge variant="outline" radius="full" className="gap-2 capitalize">
          <StatusChip status={info.getValue() ?? 'UNKNOWN'} />
          <span className="text-neutral-400">{info.getValue()?.toLowerCase() ?? 'Unknown'}</span>
        </Badge>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const stateA = rowA.getValue<ServiceStateDto>(columnId)
        const stateB = rowB.getValue<ServiceStateDto>(columnId)

        if (stateA === 'ERROR' && stateB === 'ERROR') {
          return 0
        } else if (stateA === 'ERROR' && stateB !== 'ERROR') {
          return -1
        } else if (stateA !== 'ERROR' && stateB === 'ERROR') {
          return 1
        } else if (stateA === 'WARNING' && stateB === 'WARNING') {
          return 0
        } else if (stateA === 'WARNING' && stateB !== 'WARNING') {
          return -1
        } else if (stateA !== 'WARNING' && stateB === 'WARNING') {
          return 1
        } else {
          return stateA.localeCompare(stateB)
        }
      },
    })
    const versionColumn = columnHelper.accessor('service_version', {
      header: 'Version',
      cell: (info) => {
        const value = info.getValue()
        return (
          value && (
            <Badge variant="surface" className="max-w-full shrink">
              {containerImage ? (
                <div className="truncate">{value}</div>
              ) : (
                <span className="max-w-full truncate">
                  <Icon className="mr-2" iconName="code-commit" iconStyle="regular" />
                  {value.substring(0, 7)}
                </span>
              )}
            </Badge>
          )
        )
      },
    })

    const memoryColumn = columnHelper.accessor('memory.current', {
      header: 'Memory',
      cell: (info) =>
        match(info.row.original)
          .with({ serviceType: ServiceTypeEnum.JOB, state: 'COMPLETED' }, () => null)
          .with({ memory: P.not(P.nullish) }, (pod) => formatMetric(pod.memory))
          .otherwise(() => placeholder),
    })

    const cpuColumn = columnHelper.accessor('cpu.current', {
      header: 'vCPU',
      cell: (info) =>
        match(info.row.original)
          .with({ serviceType: ServiceTypeEnum.JOB, state: 'COMPLETED' }, () => null)
          .with({ cpu: P.not(P.nullish) }, (pod) => formatMetric(pod.cpu))
          .otherwise(() => placeholder),
    })

    const storageColumn = columnHelper.accessor('storages', {
      header: 'Storage',
      cell: (info) => {
        const value = info.getValue()
        return value?.length
          ? // https://qovery.slack.com/archives/C02NQ0LC8M9/p1693235796272359
            `${Math.max(...value.map(({ current_percent }) => current_percent))}%`
          : '-'
      },
    })

    const startedAtColumn = (header = 'Age', dateFormat: 'relative' | 'absolute' = 'relative') =>
      columnHelper.accessor('started_at', {
        header,
        cell: (info) => {
          const value = info.getValue()
          return value ? (
            <Tooltip content={dateUTCString(value)}>
              <span className="truncate text-xs text-neutral-350">
                {dateFormat === 'relative' ? timeAgo(new Date(value)) : dateFullFormat(value)}
              </span>
            </Tooltip>
          ) : (
            placeholder
          )
        },
      })

    return match(service)
      .with({ serviceType: ServiceTypeEnum.JOB }, (job) => {
        return match(job)
          .with({ job_type: 'CRON' }, () => [
            startedAtColumn(`Job executions`, 'absolute'),
            statusColumn,
            versionColumn,
            memoryColumn,
            cpuColumn,
            podsColumn,
          ])
          .with({ job_type: 'LIFECYCLE' }, () => [
            startedAtColumn('Job executions', 'absolute'),
            statusColumn,
            versionColumn,
            memoryColumn,
            cpuColumn,
            podsColumn,
          ])
          .exhaustive()
      })
      .with({ serviceType: ServiceTypeEnum.DATABASE }, () => [
        podsColumn,
        statusColumn,
        memoryColumn,
        cpuColumn,
        storageColumn,
        startedAtColumn(),
      ])
      .otherwise(() => [
        podsColumn,
        statusColumn,
        versionColumn,
        memoryColumn,
        cpuColumn,
        storageColumn,
        startedAtColumn(),
      ])
  }, [service, pods.length])

  const table = useReactTable({
    data: pods,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Need useEffect because sort column is based on async data
  useEffect(() => {
    table.setSorting(
      service?.serviceType === 'JOB'
        ? [{ id: 'started_at', desc: true }]
        : [
            {
              id: 'podName',
              desc: false,
            },
          ]
    )
  }, [service?.serviceType, table.setSorting])

  if (pods.length === 0 && !isMetricsLoading && isRunningStatusesLoading) {
    // NOTE: runningStatuses may never resolve if service not started
    return <EmptyState serviceId={serviceId} environmentId={environmentId} />
  } else if (
    (pods.length === 0 && !isMetricsLoading && !isRunningStatusesLoading) ||
    isMetricsError ||
    isRunningStatusesError ||
    isServiceError
  ) {
    return (
      <div className="flex flex-col items-center gap-1 border border-neutral-200 bg-neutral-100 py-10 text-sm text-neutral-350">
        <Icon className="text-md text-neutral-300" iconStyle="regular" iconName="circle-question" />
        <span className="font-medium">Metrics for pods are not available, try again</span>
        <span>There is a technical issue on retrieving the pod metrics.</span>
      </div>
    )
  } else if (isServiceLoading || pods.length === 0) {
    return <PodsMetricsSkeleton />
  }

  return (
    <>
      <div className="overflow-x-scroll rounded border xl:overflow-hidden">
        <Table.Root className="w-full overflow-y-scroll text-xs xl:overflow-auto">
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeaderCell className="font-medium first:w-1/4 first:pl-[52px]" key={header.id}>
                    <button
                      type="button"
                      className={twMerge(
                        'flex items-center gap-1',
                        header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {match(header.column.getIsSorted())
                        .with('asc', () => <Icon className="text-xs" iconName="arrow-down" />)
                        .with('desc', () => <Icon className="text-xs" iconName="arrow-up" />)
                        .with(false, () => null)
                        .exhaustive()}
                    </button>
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <Table.Row className="hover:bg-neutral-100" onClick={row.getToggleExpandedHandler()}>
                  {row.getVisibleCells().map((cell, index) => (
                    <Table.Cell key={cell.id} className={index === 0 ? 'text-nowrap' : ''}>
                      {index === 0 && (
                        <button
                          className="text-md pointer inline-flex h-14 w-9 items-center justify-start text-neutral-350"
                          type="button"
                          onClick={(e) => {
                            row.getToggleExpandedHandler()()
                            e.stopPropagation()
                          }}
                        >
                          <Icon
                            className="pl-1"
                            name={row.getIsExpanded() ? IconAwesomeEnum.CHEVRON_UP : IconAwesomeEnum.CHEVRON_DOWN}
                            aria-hidden
                          />
                        </button>
                      )}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
                {row.getIsExpanded() && row.original.containers && service?.serviceType && (
                  <Table.Row className="dark bg-neutral-700 text-xs">
                    {/* 2nd row is a custom 1 cell row */}
                    <Table.Cell colSpan={row.getVisibleCells().length} className="p-0">
                      <PodDetails pod={row.original} serviceId={serviceId} serviceType={service.serviceType} />
                    </Table.Cell>
                  </Table.Row>
                )}
              </Fragment>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
      {children}
    </>
  )
}

export interface PodsMetricsProps extends PropsWithChildren {
  environmentId: string
  serviceId: string
}

export function PodsMetrics(props: PodsMetricsProps) {
  const { environmentId, serviceId } = props

  const {
    data: metrics = [],
    isLoading: isMetricsLoading,
    isError: isMetricsError,
  } = useMetrics({ environmentId, serviceId })
  const {
    data: runningStatuses,
    isLoading: isRunningStatusesLoading,
    isError: isRunningStatusesError,
  } = useRunningStatus({ environmentId, serviceId })
  const {
    data: service,
    isLoading: isServiceLoading,
    isError: isServiceError,
  } = useService({ environmentId, serviceId })

  const pods: Pod[] = useMemo(() => {
    // NOTE: metrics or runningStatuses could be undefined because backend doesn't have the info.
    // So we must find all possible pods by merging the two into a Set.
    const podNames = new Set([
      ...(runningStatuses?.pods.map(({ name }) => name) ?? []),
      ...(metrics?.map(({ pod_name }) => pod_name) ?? []),
    ])

    return [...podNames].map((podName) => ({
      ...(metrics?.find(({ pod_name }) => pod_name === podName) ?? {}),
      ...(runningStatuses?.pods.find(({ name }) => name === podName) ?? {}),
      podName,
    }))
  }, [metrics, runningStatuses])

  return (
    <PodsMetricsMemoized
      pods={pods}
      service={service}
      isServiceLoading={isServiceLoading}
      isServiceError={isServiceError}
      isMetricsLoading={isMetricsLoading}
      isMetricsError={isMetricsError}
      isRunningStatusesLoading={isRunningStatusesLoading}
      isRunningStatusesError={isRunningStatusesError}
      {...props}
    />
  )
}

export default PodsMetrics
