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
import { Fragment, useEffect, useMemo, useState } from 'react'
import { P, match } from 'ts-pattern'
import { ServiceTypeEnum, isContainerSource } from '@qovery/shared/enums'
import { Badge, Icon, IconAwesomeEnum, StatusChip, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { formatMetric, twMerge } from '@qovery/shared/util-js'
import { useMetrics } from '../hooks/use-metrics/use-metrics'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'
import { useService } from '../hooks/use-service/use-service'
import { type Pod, PodDetails } from '../pod-details/pod-details'
import { PodsMetricsSkeleton } from './pods-metrics-skeleton'

const { Table } = TablePrimitives

export interface PodsMetricsProps {
  environmentId: string
  serviceId: string
}

export function PodsMetrics({ environmentId, serviceId }: PodsMetricsProps) {
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
  const [sorting, setSorting] = useState<SortingState>([])
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

  const columnHelper = createColumnHelper<Pod>()
  const placeholder = <Icon name={IconAwesomeEnum.CIRCLE_QUESTION} className="text-sm text-neutral-300" />

  const containerImage = match(service)
    .with({ serviceType: ServiceTypeEnum.JOB, source: P.when(isContainerSource) }, ({ source }) => source.image)
    .with({ serviceType: ServiceTypeEnum.CONTAINER }, ({ image_name, tag, registry }) => ({
      image_name,
      tag,
      registry,
    }))
    .otherwise(() => undefined)

  const columns = useMemo(() => {
    const podsColumn = columnHelper.accessor('podName', {
      header: 'Pods',
      cell: (info) => {
        const podName = info.getValue()
        return podName.length > 23 ? (
          <Tooltip content={podName}>
            <Badge size="xs" variant="surface">
              {podName.substring(0, 10)}...{podName.slice(-10)}
            </Badge>
          </Tooltip>
        ) : (
          <Badge size="xs" variant="surface">
            {podName}
          </Badge>
        )
      },
    })
    const statusColumn = columnHelper.accessor('state', {
      header: 'Status',
      cell: (info) => (
        <Badge size="sm" variant="outline" radius="full" className="gap-2 capitalize">
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
            <Badge variant="surface" size="xs" className="shrink max-w-full">
              {containerImage ? (
                <div className="truncate">
                  {containerImage.image_name}:{containerImage.tag}
                </div>
              ) : (
                <span className="max-w-full truncate">
                  <Icon className="mr-2" name={IconAwesomeEnum.CODE_COMMIT} />
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

    const startedAtColumn = (header: string = 'Age', dateFormat: 'relative' | 'absolute' = 'relative') =>
      columnHelper.accessor('started_at', {
        header,
        cell: (info) => {
          const value = info.getValue()
          return value ? (
            <Tooltip content={dateFullFormat(value)}>
              <span className="text-xs text-neutral-350">
                {dateFormat === 'relative' ? timeAgo(new Date(value)) : dateFullFormat(value)}
              </span>
            </Tooltip>
          ) : (
            placeholder
          )
        },
      })

    return match(service?.serviceType)
      .with(ServiceTypeEnum.JOB, () => [
        startedAtColumn('Job executions', 'absolute'),
        statusColumn,
        versionColumn,
        memoryColumn,
        cpuColumn,
        podsColumn,
      ])
      .with(ServiceTypeEnum.DATABASE, () => [
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
  }, [service, containerImage, columnHelper, placeholder])

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

  if (isServiceLoading) {
    return <PodsMetricsSkeleton />
  } else if (pods.length === 0 && !isMetricsLoading && isRunningStatusesLoading) {
    // NOTE: runningStatuses may never resolve if service not started
    return (
      <div className="flex flex-col items-center gap-1 py-10 bg-neutral-100 text-sm text-neutral-350 border border-neutral-200">
        <Icon className="text-md text-neutral-300" name={IconAwesomeEnum.PLAY} />
        <span className="font-medium">Application is not running</span>
        <span>Deploy the application first</span>
      </div>
    )
  } else if (
    (pods.length === 0 && !isMetricsLoading && !isRunningStatusesLoading) ||
    isMetricsError ||
    isRunningStatusesError ||
    isServiceError
  ) {
    return (
      <div className="flex flex-col items-center gap-1 py-10 bg-neutral-100 text-sm text-neutral-350 border border-neutral-200">
        <Icon className="text-md text-neutral-300" name={IconAwesomeEnum.CIRCLE_QUESTION} />
        <span className="font-medium">Metrics for pods are not available, try again</span>
        <span>There is a technical issue on retrieving the pod metrics.</span>
      </div>
    )
  }

  return (
    <div className="border rounded overflow-hidden">
      <Table.Root className="w-full text-xs min-w-[800px]">
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeaderCell className="first:w-1/4 first:pl-[52px] font-medium" key={header.id}>
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
                      .with('asc', () => <Icon className="text-xs" name={IconAwesomeEnum.ARROW_DOWN} />)
                      .with('desc', () => <Icon className="text-xs" name={IconAwesomeEnum.ARROW_UP} />)
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
                  <Table.Cell key={cell.id}>
                    {index === 0 && (
                      <button
                        className="inline-flex items-center justify-start h-14 text-md w-9 pointer text-neutral-350"
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
              {row.getIsExpanded() && row.original.containers && (
                <Table.Row className="dark bg-neutral-550 text-xs">
                  {/* 2nd row is a custom 1 cell row */}
                  <Table.Cell colSpan={row.getVisibleCells().length} className="p-0">
                    <PodDetails pod={row.original} serviceId={serviceId} isGitBased={!containerImage} />
                  </Table.Cell>
                </Table.Row>
              )}
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  )
}

export default PodsMetrics
