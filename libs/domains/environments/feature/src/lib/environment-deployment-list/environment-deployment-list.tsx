import {
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
import { type DeploymentHistoryEnvironmentV2, OrganizationEventOrigin, StateEnum } from 'qovery-typescript-axios'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import {
  ActionToolbar,
  ActionTriggerStatusChip,
  DropdownMenu,
  EmptyState,
  Icon,
  Link,
  TableFilter,
  TablePrimitives,
  Tooltip,
  Truncate,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateFullFormat, formatDuration } from '@qovery/shared/util-dates'
import { isCancelBuildAvailable, twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useCancelDeploymentEnvironment } from '../hooks/use-cancel-deployment-environment/use-cancel-deployment-environment'
import { useCancelDeploymentQueueEnvironment } from '../hooks/use-cancel-deployment-queue-environment/use-cancel-deployment-queue-environment'
import { useDeploymentHistory } from '../hooks/use-deployment-history/use-deployment-history'
import { useDeploymentQueue } from '../hooks/use-deployment-queue/use-deployment-queue'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import { DropdownServices } from './dropdown-services/dropdown-services'
import { EnvironmentDeploymentListSkeleton } from './environment-deployment-list-skeleton'
import { TableFilterTriggerBy } from './table-filter-trigger-by/table-filter-trigger-by'

const { Table } = TablePrimitives

export interface EnvironmentDeploymentListProps {
  environmentId: string
}

export const isDeploymentHistory = (data: unknown): data is DeploymentHistoryEnvironmentV2 => {
  return (
    typeof data === 'object' && data !== null && 'status' in data && 'action_status' in data && 'trigger_action' in data
  )
}

export function EnvironmentDeploymentList({ environmentId }: EnvironmentDeploymentListProps) {
  const { data: environment, isFetched: isFetchedEnvironment } = useEnvironment({ environmentId })

  const logsLink =
    ENVIRONMENT_LOGS_URL(environment?.organization.id, environment?.project.id, environment?.id) +
    ENVIRONMENT_STAGES_URL()

  const { data: deploymentHistory = [], isFetched: isFetchedDeloymentHistory } = useDeploymentHistory({ environmentId })
  const { data: deploymentHistoryQueue = [], isFetched: isFetchedDeloymentQueue } = useDeploymentQueue({
    environmentId,
  })

  const { mutate: cancelDeploymentEnvironment } = useCancelDeploymentEnvironment({
    projectId: environment?.project.id ?? '',
    logsLink,
  })
  const { mutate: cancelDeploymentQueueService } = useCancelDeploymentQueueEnvironment({
    environmentId,
  })

  const { pathname } = useLocation()
  const { openModalConfirmation } = useModalConfirmation()

  const [sorting, setSorting] = useState<SortingState>([])

  const mutationCancelDeployment = useCallback(
    ({ deploymentRequestId }: { deploymentRequestId?: string }) => {
      openModalConfirmation({
        mode: environment?.mode,
        title: 'Confirm cancel',
        description:
          'Stopping a deployment may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the environment:',
        name: environment?.name,
        action: () =>
          deploymentRequestId
            ? cancelDeploymentQueueService({ deploymentRequestId })
            : cancelDeploymentEnvironment({ environmentId }),
      })
    },
    [environment, openModalConfirmation, cancelDeploymentEnvironment, cancelDeploymentQueueService, environmentId]
  )

  const columnHelper = createColumnHelper<(typeof deploymentHistory | typeof deploymentHistoryQueue)[number]>()
  const columns = useMemo(
    () => [
      columnHelper.accessor('auditing_data.created_at', {
        header: 'Date',
        enableColumnFilter: false,
        enableSorting: true,
        size: 40,
        cell: (info) => {
          const data = info.row.original
          const state = isDeploymentHistory(data) ? data.status : 'QUEUED'
          return (
            <div
              className={twMerge(
                clsx(
                  'flex items-center justify-between before:absolute before:-top-[1px] before:left-0 before:block before:h-[calc(100%+2px)] before:w-1',
                  {
                    'before:bg-brand-500': [
                      'DEPLOYING',
                      'RESTARTING',
                      'BUILDING',
                      'DELETING',
                      'STOPPING',
                      'CANCELING',
                    ].includes(state),
                    'before:bg-neutral-300': [
                      'QUEUED',
                      'DEPLOYMENT_QUEUED',
                      'DELETE_QUEUED',
                      'STOP_QUEUED',
                      'RESTART_QUEUED',
                    ].includes(state),
                  }
                )
              )}
            >
              {state === 'QUEUED' ? (
                <div className="flex flex-col gap-1 text-sm text-neutral-350">
                  <span className="font-medium">In queue...</span>
                  <span>--</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-neutral-400">
                    {dateFullFormat(
                      isDeploymentHistory(data) ? data.auditing_data.created_at : '',
                      undefined,
                      'dd MMM, HH:mm a'
                    )}
                  </span>
                  <span className="truncate text-ssm text-neutral-350">
                    {isDeploymentHistory(data) ? data.identifier.execution_id : '--'}
                  </span>
                </div>
              )}
              <ActionToolbar.Root className="min-w-28 text-right">
                {match(state)
                  .with(
                    'DEPLOYING',
                    'RESTARTING',
                    'BUILDING',
                    'DELETING',
                    'STOPPING',
                    'DEPLOYMENT_QUEUED',
                    'DELETE_QUEUED',
                    'STOP_QUEUED',
                    'RESTART_QUEUED',
                    'QUEUED',
                    () => (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <ActionToolbar.Button
                            aria-label="Manage Deployment"
                            color="neutral"
                            size="md"
                            variant="outline"
                          >
                            <Tooltip content="Manage Deployment">
                              <div className="flex h-full w-full items-center justify-center">
                                {match(state)
                                  .with(
                                    'DEPLOYMENT_QUEUED',
                                    'DELETE_QUEUED',
                                    'STOP_QUEUED',
                                    'RESTART_QUEUED',
                                    'QUEUED',
                                    () => <Icon iconName="clock" iconStyle="regular" className="mr-3" />
                                  )
                                  .otherwise(() => (
                                    <Icon iconName="loader" className="mr-3 animate-spin" />
                                  ))}
                                <Icon iconName="chevron-down" />
                              </div>
                            </Tooltip>
                          </ActionToolbar.Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          {(isCancelBuildAvailable(state) || state === 'QUEUED') && (
                            <DropdownMenu.Item
                              icon={<Icon iconName="xmark" />}
                              onSelect={() =>
                                mutationCancelDeployment({
                                  deploymentRequestId: !isDeploymentHistory(data)
                                    ? data.identifier.deployment_request_id
                                    : undefined,
                                })
                              }
                            >
                              {state === StateEnum.DELETE_QUEUED || state === StateEnum.DELETING
                                ? 'Cancel delete'
                                : 'Cancel deployment'}
                            </DropdownMenu.Item>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    )
                  )
                  .otherwise(() => null)}
                <Tooltip content="Pipeline">
                  <ActionToolbar.Button asChild className="justify-center px-2">
                    <Link
                      to={
                        state === 'QUEUED'
                          ? ENVIRONMENT_LOGS_URL(environment?.organization.id, environment?.project.id, environment?.id)
                          : ENVIRONMENT_LOGS_URL(
                              environment?.organization.id,
                              environment?.project.id,
                              environment?.id
                            ) +
                            ENVIRONMENT_STAGES_URL(isDeploymentHistory(data) ? data.identifier.execution_id ?? '' : '')
                      }
                      state={{ prevUrl: pathname }}
                    >
                      <Icon iconName="timeline" />
                    </Link>
                  </ActionToolbar.Button>
                </Tooltip>
              </ActionToolbar.Root>
            </div>
          )
        },
      }),
      columnHelper.accessor('action_status', {
        id: 'action_status',
        header: 'Status deployment',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 15,
        meta: {
          customFacetEntry({ value, count }) {
            return (
              <>
                <span className="text-sm font-medium">{upperCaseFirstLetter(value)}</span>
                <span className="text-xs text-neutral-350">{count}</span>
              </>
            )
          },
        },
        cell: (info) => {
          const data = info.row.original
          const { trigger_action } = data

          return match(data)
            .with(P.when(isDeploymentHistory), (data) => {
              const { action_status } = data

              return (
                <div className="flex items-center gap-4">
                  <ActionTriggerStatusChip
                    size="md"
                    status={action_status}
                    triggerAction={trigger_action}
                    statusLink={match(action_status)
                      .with(
                        'ERROR',
                        () =>
                          ENVIRONMENT_LOGS_URL(environment?.organization.id, environment?.project.id, environment?.id) +
                          ENVIRONMENT_STAGES_URL(data.identifier.execution_id)
                      )
                      .otherwise(() => undefined)}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-neutral-400">{upperCaseFirstLetter(trigger_action)}</span>
                    <span className="text-ssm text-neutral-350">{upperCaseFirstLetter(action_status)}</span>
                  </div>
                </div>
              )
            })
            .otherwise(() => (
              <div className="flex items-center gap-4">
                <ActionTriggerStatusChip size="md" status="QUEUED" triggerAction={trigger_action} />
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-neutral-400">{upperCaseFirstLetter(trigger_action)}</span>
                  <span className="text-ssm text-neutral-350">In queue...</span>
                </div>
              </div>
            ))
        },
      }),
      columnHelper.accessor('stages', {
        header: 'Pipeline',
        enableColumnFilter: false,
        enableSorting: false,
        size: 13,
        cell: (info) => {
          const data = info.row.original

          return (
            environment && (
              <DropdownServices
                environment={environment}
                deploymentHistory={data}
                stages={match(data)
                  .with(P.when(isDeploymentHistory), (d) => d.stages.filter((stage) => stage.services.length > 0))
                  .otherwise((d) => d.stages)}
              />
            )
          )
        },
      }),
      columnHelper.accessor('total_duration', {
        header: 'Duration',
        enableColumnFilter: false,
        enableSorting: true,
        size: 12,
        cell: (info) => {
          const data = info.row.original

          if (isDeploymentHistory(data)) {
            const state = data.status

            return match(state)
              .with(
                'DEPLOYING',
                'RESTARTING',
                'BUILDING',
                'DELETING',
                'CANCELING',
                'STOPPING',
                'DEPLOYMENT_QUEUED',
                'DELETE_QUEUED',
                'STOP_QUEUED',
                'RESTART_QUEUED',
                () => <span className="text-neutral-350">--</span>
              )
              .otherwise(() => (
                <span className="flex items-center gap-1 text-neutral-350">
                  <Icon iconName="clock-eight" iconStyle="regular" />
                  {formatDuration(data.total_duration)}
                </span>
              ))
          } else {
            return <span className="text-neutral-350">---</span>
          }
        },
      }),
      columnHelper.accessor('auditing_data.origin', {
        header: 'Trigger by',
        enableColumnFilter: true,
        enableSorting: false,
        size: 20,
        filterFn: (row, _, filterValue) => {
          if (!filterValue) return true
          const { origin, triggeredBy } = filterValue

          const matchOrigin = !origin?.length || origin.includes(row.original.auditing_data.origin)
          const matchTriggeredBy = !triggeredBy?.length || triggeredBy.includes(row.original.auditing_data.triggered_by)

          return matchOrigin && matchTriggeredBy
        },
        cell: (info) => {
          const origin = info.row.original.auditing_data.origin
          const triggeredBy = info.row.original.auditing_data.triggered_by

          return (
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 min-w-7 items-center justify-center rounded-full bg-neutral-150 text-neutral-350">
                {match(origin)
                  .with(OrganizationEventOrigin.GIT, () => <Icon iconName="code-branch" />)
                  .with(OrganizationEventOrigin.CONSOLE, () => <Icon iconName="browser" />)
                  .with(OrganizationEventOrigin.QOVERY_INTERNAL, () => <Icon iconName="wave-pulse" />)
                  .with(OrganizationEventOrigin.API, () => <Icon iconName="cloud-arrow-up" />)
                  .with(OrganizationEventOrigin.CLI, () => <Icon iconName="terminal" />)
                  .with(OrganizationEventOrigin.TERRAFORM_PROVIDER, () => <Icon name={IconEnum.TERRAFORM} width="12" />)
                  .otherwise(() => null)}
              </div>
              <div className="flex flex-col gap-1.5 text-ssm">
                <span className="whitespace-nowrap text-neutral-400">
                  <Truncate text={triggeredBy} truncateLimit={25} />
                </span>
                <span className="text-neutral-350">
                  {origin !== 'CLI' && origin !== 'API' ? upperCaseFirstLetter(origin?.replace('_', ' ')) : origin}
                </span>
              </div>
            </div>
          )
        },
      }),
    ],
    [columnHelper, environment, mutationCancelDeployment, pathname]
  )

  const data = useMemo(
    () => [...deploymentHistoryQueue, ...deploymentHistory],
    [deploymentHistory, deploymentHistoryQueue]
  )

  const table = useReactTable({
    data,
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
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })

  if (!isFetchedEnvironment || !isFetchedDeloymentHistory || !isFetchedDeloymentQueue)
    return <EnvironmentDeploymentListSkeleton />

  if (
    isFetchedEnvironment &&
    isFetchedDeloymentHistory &&
    isFetchedDeloymentQueue &&
    !deploymentHistory.length &&
    !deploymentHistoryQueue.length
  ) {
    return (
      <EmptyState
        title="No deployment started"
        description="Manage the deployments by using the “Play” button in the header above"
        className="mt-2 rounded-t-sm bg-white pt-10"
      />
    )
  }

  return (
    <div className="flex grow flex-col justify-between">
      <Table.Root className="w-full min-w-[1080px] overflow-x-scroll text-ssm">
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <Table.ColumnHeaderCell
                  className={`px-6 ${i === 0 ? 'border-r pl-4' : ''} font-medium`}
                  key={header.id}
                  style={{ width: i === 0 ? '20px' : `${header.getSize()}%` }}
                >
                  {header.column.getCanFilter() ? (
                    header.id === 'auditing_data_origin' ? (
                      <TableFilterTriggerBy column={header.column} />
                    ) : (
                      <TableFilter column={header.column} />
                    )
                  ) : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className={twMerge(
                        'flex items-center gap-1 truncate',
                        header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                      )}
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
            <Fragment key={row.id}>
              <Table.Row className="h-[68px] border-neutral-200 last:!border-b">
                {row.getVisibleCells().map((cell, i) => (
                  <Table.Cell
                    key={cell.id}
                    className={`px-6 ${i === 0 ? 'border-r pl-4' : ''} first:relative`}
                    style={{ width: `${cell.column.getSize()}%` }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  )
}

export default EnvironmentDeploymentList
