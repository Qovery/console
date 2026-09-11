import { useNavigate } from '@tanstack/react-router'
import {
  type Row,
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { type ClusterDeploymentHistory } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { DevopsCopilotTroubleshootTrigger } from '@qovery/shared/devops-copilot/feature'
import {
  Badge,
  CopyToClipboardButtonIcon,
  DeploymentAction,
  EmptyState,
  Icon,
  Link,
  StatusChip,
  TableFilter,
  TablePrimitives,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { EventOriginIcon } from '@qovery/shared/util-icons'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useClusterDeploymentHistory } from '../hooks/use-cluster-deployment-history/use-cluster-deployment-history'
import { ClusterDeploymentDurationCell } from './cluster-deployment-duration-cell'

const { Table } = TablePrimitives
const interactiveRowTargetSelector = 'a,button,input,select,textarea,[role="button"],[role="menuitem"]'

function stopRowNavigation(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) {
  event.stopPropagation()
}

function shouldIgnoreRowNavigation(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(interactiveRowTargetSelector))
}

export interface ClusterDeploymentListProps {
  organizationId: string
  clusterId: string
}

export function ClusterDeploymentList({ organizationId, clusterId }: ClusterDeploymentListProps) {
  const navigate = useNavigate()

  const { data: deploymentHistory = [] } = useClusterDeploymentHistory({
    organizationId,
    clusterId,
    suspense: true,
    refetchInterval: 5000,
  })

  const [sorting, setSorting] = useState<SortingState>([])

  const columnHelper = createColumnHelper<ClusterDeploymentHistory>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('auditing_data.created_at', {
        header: 'Date',
        enableColumnFilter: false,
        enableSorting: true,
        size: 420,
        cell: (info) => {
          const data = info.row.original
          const state = data.action_status

          return (
            <div
              className={twMerge(
                clsx(
                  'relative flex items-center justify-between before:absolute before:-left-4 before:-top-3 before:block before:h-[calc(100%+1.5rem)] before:w-0.5',
                  {
                    'before:bg-surface-brand-solid': ['ONGOING', 'CANCELING', 'EXECUTING'].includes(state),
                    'before:bg-neutral-subtle': ['QUEUED'].includes(state),
                  }
                )
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-neutral">
                  {dateFullFormat(data.auditing_data.created_at, undefined, 'dd MMM, HH:mm')}
                </span>
                <span className="group flex min-w-0 items-center gap-0.5 text-ssm text-neutral-subtle">
                  <span className="truncate">{data.identifier.execution_id ?? data.identifier.deployment_id}</span>
                  <span onClick={stopRowNavigation} onMouseDown={stopRowNavigation} onKeyDown={stopRowNavigation}>
                    <CopyToClipboardButtonIcon
                      content={data.identifier.execution_id ?? data.identifier.deployment_id}
                      tooltipContent={data.identifier.execution_id ? 'Copy execution ID' : 'Copy deployment ID'}
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      iconClassName="text-xs"
                    />
                  </span>
                </span>
              </div>
              <div
                className="flex min-w-28 justify-end gap-1 text-right"
                onClick={stopRowNavigation}
                onKeyDown={stopRowNavigation}
              >
                <Tooltip content="Logs">
                  <Link
                    as="button"
                    color="neutral"
                    variant="outline"
                    size="md"
                    iconOnly
                    to="/organization/$organizationId/cluster/$clusterId/deployments/logs/$deploymentId"
                    params={{
                      organizationId,
                      clusterId,
                      deploymentId: data.identifier.deployment_id,
                    }}
                  >
                    <Icon iconName="scroll" />
                  </Link>
                </Tooltip>
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor('action_status', {
        id: 'action_status',
        header: 'Status',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 196,
        meta: {
          customFacetEntry({ value, count }) {
            return (
              <>
                <span className="text-sm font-medium">{upperCaseFirstLetter(value)}</span>
                <span className="text-xs text-neutral-subtle">{count}</span>
              </>
            )
          },
        },
        cell: (info) => {
          const data = info.row.original

          return (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <DeploymentAction status={data.trigger_action} />
                {data.reason === 'MAINTENANCE' && (
                  <Badge color="neutral" variant="surface" className="font-medium">
                    Maintenance
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {data.action_status === 'ERROR' && (
                  <DevopsCopilotTroubleshootTrigger
                    source="cluster-deployment-list"
                    deploymentId={data.identifier.deployment_id}
                    message={`Why did my cluster deployment fail? (deployment id: ${data.identifier.deployment_id})`}
                  />
                )}
                <StatusChip status={data.action_status} />
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor('total_duration', {
        header: 'Duration',
        enableColumnFilter: false,
        enableSorting: true,
        size: 120,
        cell: (info) => {
          const data = info.row.original

          return (
            <ClusterDeploymentDurationCell
              createdAt={data.auditing_data.created_at}
              status={data.action_status}
              totalDuration={data.total_duration ?? undefined}
            />
          )
        },
      }),
      columnHelper.accessor('auditing_data.origin', {
        header: 'Trigger by',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 250,
        meta: {
          customFacetEntry({ value, count }) {
            return (
              <>
                <span className="text-sm font-medium">
                  {upperCaseFirstLetter(String(value).toLowerCase().replace('_', ' '))}
                </span>
                <span className="text-xs text-neutral-subtle">{count}</span>
              </>
            )
          },
          customFilterValue({ filterValue }) {
            return (
              <Truncate
                text={filterValue
                  .map((value) => upperCaseFirstLetter(value.toLowerCase().replace('_', ' ')))
                  .join(', ')}
                truncateLimit={18}
              />
            )
          },
        },
        cell: (info) => {
          const origin = info.row.original.auditing_data.origin
          const triggeredBy = info.row.original.auditing_data.triggered_by

          if (!origin && !triggeredBy) {
            return (
              <Tooltip content="This deployment was made before initiator tracking was introduced, so this information is not available.">
                <div className="flex w-fit items-center gap-3">
                  <div className="flex h-7 w-7 min-w-7 items-center justify-center rounded-full bg-surface-neutral-component text-neutral-subtle">
                    <Icon iconName="circle-question" iconStyle="regular" />
                  </div>
                  <span className="text-ssm text-neutral-subtle">Unknown</span>
                </div>
              </Tooltip>
            )
          }

          return (
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 min-w-7 items-center justify-center rounded-full bg-surface-neutral-component text-neutral-subtle">
                <EventOriginIcon origin={origin} />
              </div>
              <div className="flex flex-col gap-0.5 text-ssm">
                <span className="whitespace-nowrap text-neutral">
                  <Truncate text={triggeredBy ?? '--'} truncateLimit={25} />
                </span>
                <span className="text-neutral-subtle">
                  {origin !== 'CLI' && origin !== 'API' ? upperCaseFirstLetter(origin?.replace('_', ' ')) : origin}
                </span>
              </div>
            </div>
          )
        },
      }),
    ],
    [columnHelper, organizationId, clusterId]
  )

  const table = useReactTable({
    data: deploymentHistory,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    // https://github.com/TanStack/table/discussions/3192#discussioncomment-6458134
    defaultColumn: {
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })

  if (!deploymentHistory.length) {
    return (
      <EmptyState
        icon="rocket"
        title="No deployment started"
        description="Manage the deployments by using the “Play” button in the header above"
        className="mt-2 pt-10"
      />
    )
  }

  const navigateToDeploymentLogs = (deploymentId: string) => {
    navigate({
      to: '/organization/$organizationId/cluster/$clusterId/deployments/logs/$deploymentId',
      params: {
        organizationId,
        clusterId,
        deploymentId,
      },
    })
  }

  const handleRowClick = (event: MouseEvent<HTMLElement>, row: Row<ClusterDeploymentHistory>) => {
    if (shouldIgnoreRowNavigation(event.target)) return
    navigateToDeploymentLogs(row.original.identifier.deployment_id)
  }

  const handleRowKeyDown = (event: KeyboardEvent<HTMLElement>, row: Row<ClusterDeploymentHistory>) => {
    if (event.key !== 'Enter' || shouldIgnoreRowNavigation(event.target)) return
    navigateToDeploymentLogs(row.original.identifier.deployment_id)
  }

  return (
    <div className="flex grow flex-col justify-between">
      <Table.Root className="w-full min-w-[1080px] table-fixed overflow-x-scroll text-ssm">
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} className="divide-x divide-neutral">
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeaderCell
                  className="font-medium"
                  key={header.id}
                  style={{
                    width: `${header.getSize()}px`,
                  }}
                >
                  {header.column.getCanFilter() ? (
                    <TableFilter column={header.column} />
                  ) : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="flex cursor-pointer select-none items-center gap-1 truncate"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {match(header.column.getIsSorted())
                        .with('asc', () => <Icon className="text-ssm" iconName="arrow-down" />)
                        .with('desc', () => <Icon className="text-ssm" iconName="arrow-up" />)
                        .with(false, () => null)
                        .exhaustive()}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row
              key={row.id}
              role="link"
              tabIndex={0}
              className="h-[68px] cursor-pointer divide-x divide-neutral border-neutral hover:bg-surface-neutral-subtle focus:bg-surface-neutral-subtle"
              onClick={(event) => handleRowClick(event, row)}
              onKeyDown={(event) => handleRowKeyDown(event, row)}
            >
              {row.getVisibleCells().map((cell) => (
                <Table.Cell
                  key={cell.id}
                  style={{
                    width: `${cell.column.getSize()}px`,
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  )
}

export default ClusterDeploymentList
