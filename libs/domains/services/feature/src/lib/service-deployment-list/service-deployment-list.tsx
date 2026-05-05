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
import { type DeploymentHistoryService, type Environment, OrganizationEventOrigin } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent, useCallback, useMemo, useState } from 'react'
import { P, match } from 'ts-pattern'
import { DevopsCopilotTroubleshootTrigger } from '@qovery/shared/devops-copilot/feature'
import { IconEnum } from '@qovery/shared/enums'
import {
  Button,
  CopyToClipboard,
  DeploymentAction,
  DropdownMenu,
  EmptyState,
  Icon,
  Link,
  StatusChip,
  TableFilter,
  TablePrimitives,
  Tooltip,
  Truncate,
  truncateText,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useCancelDeploymentQueueService } from '../hooks/use-cancel-deployment-queue-service/use-cancel-deployment-queue-service'
import { useCancelDeploymentService } from '../hooks/use-cancel-deployment-service/use-cancel-deployment-service'
import { useDeploymentHistory } from '../hooks/use-deployment-history/use-deployment-history'
import { useDeploymentQueue } from '../hooks/use-deployment-queue/use-deployment-queue'
import { useService } from '../hooks/use-service/use-service'
import { ServiceDeploymentDurationCell } from './service-deployment-duration-cell'
import { ServiceDeploymentListSkeleton } from './service-deployment-list-skeleton'
import { TableFilterTriggerBy } from './table-filter-trigger-by/table-filter-trigger-by'

const { Table } = TablePrimitives
const interactiveRowTargetSelector = 'a,button,input,select,textarea,[role="button"],[role="menuitem"]'

function stopRowNavigation(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) {
  event.stopPropagation()
}

function shouldIgnoreRowNavigation(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(interactiveRowTargetSelector))
}

export interface ServiceDeploymentListProps {
  serviceId: string
  environment?: Environment
}

export const isDeploymentHistory = (data: unknown): data is DeploymentHistoryService => {
  return typeof data === 'object' && data !== null && 'status' in data && 'details' in data
}

export function ServiceDeploymentList({ environment, serviceId }: ServiceDeploymentListProps) {
  const navigate = useNavigate()
  const { data: service } = useService({ environmentId: environment?.id, serviceId, suspense: true })

  const { data: deploymentHistory = [], isFetched: isFetchedDeloymentHistory } = useDeploymentHistory({
    serviceId,
    serviceType: service?.service_type,
    suspense: true,
  })

  const { data: deploymentHistoryQueue = [], isFetched: isFetchedDeloymentQueue } = useDeploymentQueue({
    serviceId,
    suspense: true,
  })

  const { mutate: cancelDeploymentService } = useCancelDeploymentService({
    organizationId: environment?.organization.id ?? '',
    projectId: environment?.project.id ?? '',
  })
  const { mutate: cancelDeploymentQueueService } = useCancelDeploymentQueueService({
    serviceId,
  })
  const { openModalConfirmation } = useModalConfirmation()

  const [sorting, setSorting] = useState<SortingState>([])

  const mutationCancelDeployment = useCallback(
    ({ deploymentRequestId }: { deploymentRequestId?: string }) => {
      openModalConfirmation({
        title: 'Confirm cancel',
        description:
          'Stopping a deployment may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the environment:',
        name: environment?.name,
        action: () =>
          deploymentRequestId
            ? cancelDeploymentQueueService({ deploymentRequestId })
            : cancelDeploymentService({ environmentId: environment?.id ?? '' }),
      })
    },
    [environment, openModalConfirmation, cancelDeploymentService, cancelDeploymentQueueService]
  )

  const columnHelper = createColumnHelper<(typeof deploymentHistory | typeof deploymentHistoryQueue)[number]>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('auditing_data.created_at', {
        header: 'Date',
        enableColumnFilter: false,
        enableSorting: true,
        size: 420,
        cell: (info) => {
          const data = info.row.original
          const state = data.status_details?.status ?? 'NEVER'

          return (
            <div
              className={twMerge(
                clsx(
                  'relative flex items-center justify-between before:absolute before:-left-4 before:-top-3 before:block before:h-[calc(100%+1.5rem)] before:w-0.5',
                  {
                    'before:bg-surface-brand-solid': ['ONGOING', 'CANCELING'].includes(state),
                    'before:bg-neutral-subtle': ['QUEUED'].includes(state),
                  }
                )
              )}
            >
              {state === 'QUEUED' ? (
                <div className="flex flex-col gap-0.5 text-sm text-neutral-subtle">
                  <span className="font-medium">In queue...</span>
                  <span>--</span>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-neutral">
                    {dateFullFormat(
                      'created_at' in data.auditing_data ? data.auditing_data.created_at : '',
                      undefined,
                      'dd MMM, HH:mm'
                    )}
                  </span>
                  <span className="truncate text-ssm text-neutral-subtle">
                    {isDeploymentHistory(data) ? data.identifier.execution_id : '--'}
                  </span>
                </div>
              )}
              <div
                className="flex min-w-28 justify-end gap-1 text-right"
                onClick={stopRowNavigation}
                onKeyDown={stopRowNavigation}
              >
                {match(state)
                  .with('ONGOING', 'CANCELING', 'QUEUED', () => (
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button aria-label="Manage Deployment" color="neutral" size="md" variant="outline" iconOnly>
                          <Tooltip content="Manage Deployment">
                            {match(state)
                              .with('QUEUED', () => <Icon iconName="clock" iconStyle="regular" />)
                              .otherwise(() => (
                                <span className="flex h-4 w-4 items-center justify-center">
                                  <Icon iconName="loader" className="block animate-spin leading-none" />
                                </span>
                              ))}
                          </Tooltip>
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        {(state === 'ONGOING' || state === 'QUEUED') && (
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
                            Cancel deployment
                          </DropdownMenu.Item>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  ))
                  .otherwise(() => null)}
                <Tooltip content="Logs">
                  <Link
                    as="button"
                    color="neutral"
                    variant="outline"
                    size="md"
                    iconOnly
                    to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
                    params={{
                      organizationId: environment?.organization.id ?? '',
                      projectId: environment?.project.id ?? '',
                      environmentId: environment?.id ?? '',
                      serviceId,
                      executionId: isDeploymentHistory(data) ? data.identifier.execution_id : undefined,
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
      columnHelper.accessor('status_details.status', {
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
          const subAction = data.status_details?.sub_action
          const triggerAction = subAction !== 'NONE' ? subAction : data.status_details?.action

          return match(data)
            .with(P.when(isDeploymentHistory), (d) => {
              const actionStatus = d.status_details?.status
              const executionId = isDeploymentHistory(data) ? data.identifier.execution_id : undefined

              return (
                <div className="flex items-center justify-between gap-4">
                  <DeploymentAction status={triggerAction} />
                  <div className="flex items-center gap-2">
                    {actionStatus === 'ERROR' && (
                      <DevopsCopilotTroubleshootTrigger
                        source="service-deployment-list"
                        deploymentId={executionId}
                        message={
                          executionId
                            ? `Why did my deployment fail? (execution id: ${executionId})`
                            : 'Why did my deployment fail?'
                        }
                      />
                    )}
                    <StatusChip status={actionStatus} />
                  </div>
                </div>
              )
            })
            .otherwise(() => (
              <div className="flex items-center justify-between gap-4">
                <DeploymentAction status={triggerAction} />
                <StatusChip status="QUEUED" />
              </div>
            ))
        },
      }),
      columnHelper.accessor('total_duration', {
        header: 'Duration',
        enableColumnFilter: false,
        enableSorting: true,
        size: 120,
        cell: (info) => {
          const data = info.row.original

          if (isDeploymentHistory(data)) {
            return (
              <ServiceDeploymentDurationCell
                createdAt={data.auditing_data.created_at}
                status={data.status_details.status}
                totalDuration={data.total_duration}
              />
            )
          }

          return <span className="text-neutral-subtle">---</span>
        },
      }),
      columnHelper.accessor('details', {
        header: 'Version',
        enableColumnFilter: false,
        enableSorting: false,
        size: 170,
        cell: (info) => {
          const data = info.row.original

          return isDeploymentHistory(data) ? (
            match(data.details)
              .with({ commit: P.not(P.nullish) }, ({ commit }) => (
                <Tooltip
                  content={
                    <span className="flex flex-col">
                      <span>Commit at: {commit.created_at}</span>
                      <span>
                        Message: <Truncate text={commit.message} truncateLimit={50} />
                      </span>
                    </span>
                  }
                >
                  <span>
                    <CopyToClipboard text={commit.git_commit_id} className="inline-flex justify-center">
                      <Button type="button" variant="surface" color="neutral" size="xs" className="group gap-1">
                        <span className="group-hover:hidden">
                          <Icon iconName="copy" iconStyle="solid" className="w-4" />
                        </span>
                        <span className="hidden group-hover:block">
                          <Icon iconName="code-commit" iconStyle="regular" className="w-4" />
                        </span>
                        {commit.git_commit_id.substring(0, 7)}
                      </Button>
                    </CopyToClipboard>
                  </span>
                </Tooltip>
              ))
              .with(
                {
                  repository: {
                    chart_name: P.string,
                    chart_version: P.string,
                  },
                },
                ({ repository }) => (
                  <Tooltip
                    content={
                      <span className="flex flex-col">
                        <span>Chart name: {repository.chart_name}</span>
                        <span>
                          Chart version: <Truncate text={repository.chart_version} truncateLimit={50} />
                        </span>
                      </span>
                    }
                  >
                    <span>
                      <CopyToClipboard text={repository.chart_version} className="inline-flex justify-center">
                        <Button type="button" variant="surface" color="neutral" size="xs" className="group gap-1">
                          <span className="group-hover:hidden">
                            <Icon iconName="copy" iconStyle="solid" className="w-4" />
                          </span>
                          <span className="hidden group-hover:block">
                            <Icon iconName="code-commit" iconStyle="regular" className="w-4" />
                          </span>
                          {truncateText(repository.chart_version, 18)}
                        </Button>
                      </CopyToClipboard>
                    </span>
                  </Tooltip>
                )
              )
              .with(
                {
                  image_name: P.string,
                  tag: P.string,
                },
                ({ image_name, tag }) => (
                  <Tooltip
                    content={
                      <span className="flex flex-col">
                        <span>Image name: {image_name}</span>
                        <span>
                          Tag: <Truncate text={tag} truncateLimit={50} />
                        </span>
                      </span>
                    }
                  >
                    <span>
                      <CopyToClipboard text={tag} className="inline-flex justify-center">
                        <Button type="button" variant="surface" color="neutral" size="xs" className="group gap-1">
                          <span className="group-hover:hidden">
                            <Icon iconName="copy" iconStyle="solid" className="w-4" />
                          </span>
                          <span className="hidden group-hover:block">
                            <Icon iconName="code-commit" iconStyle="regular" className="w-4" />
                          </span>
                          {tag.length >= 8 ? truncateText(tag, 8) + '...' : tag}
                        </Button>
                      </CopyToClipboard>
                    </span>
                  </Tooltip>
                )
              )
              .otherwise(() => <span className="text-neutral-subtle">--</span>)
          ) : (
            <span className="text-neutral-subtle">--</span>
          )
        },
      }),
      columnHelper.accessor('auditing_data.origin', {
        header: 'Trigger by',
        enableColumnFilter: true,
        enableSorting: false,
        size: 250,
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
              <div className="flex h-7 w-7 min-w-7 items-center justify-center rounded-full bg-surface-neutral-component text-neutral-subtle">
                {match(origin)
                  .with(OrganizationEventOrigin.GIT, () => <Icon iconName="code-branch" />)
                  .with(OrganizationEventOrigin.CONSOLE, () => <Icon iconName="browser" />)
                  .with(OrganizationEventOrigin.QOVERY_INTERNAL, () => <Icon iconName="wave-pulse" />)
                  .with(OrganizationEventOrigin.API, () => <Icon iconName="cloud-arrow-up" />)
                  .with(OrganizationEventOrigin.CLI, () => <Icon iconName="terminal" />)
                  .with(OrganizationEventOrigin.TERRAFORM_PROVIDER, () => <Icon name={IconEnum.TERRAFORM} width="12" />)
                  .otherwise(() => null)}
              </div>
              <div className="flex flex-col gap-0.5 text-ssm">
                <span className="whitespace-nowrap text-neutral">
                  <Truncate text={triggeredBy} truncateLimit={25} />
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
    [columnHelper, environment, mutationCancelDeployment, service, serviceId]
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
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })

  if (!isFetchedDeloymentHistory || !isFetchedDeloymentQueue) return <ServiceDeploymentListSkeleton />

  if (
    isFetchedDeloymentHistory &&
    isFetchedDeloymentQueue &&
    !deploymentHistory.length &&
    !deploymentHistoryQueue.length
  ) {
    return (
      <EmptyState
        icon="rocket"
        title="No deployment started"
        description="Manage the deployments by using the “Play” button in the header above"
        className="mt-2 pt-10"
      />
    )
  }

  const getDeploymentExecutionId = (row: Row<DeploymentHistoryService | (typeof deploymentHistoryQueue)[number]>) => {
    const data = row.original
    return isDeploymentHistory(data) ? data.identifier.execution_id : undefined
  }

  const handleRowClick = (
    event: MouseEvent<HTMLElement>,
    row: Row<DeploymentHistoryService | (typeof deploymentHistoryQueue)[number]>
  ) => {
    const executionId = getDeploymentExecutionId(row)

    if (!environment || !executionId || shouldIgnoreRowNavigation(event.target)) return

    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId',
      params: {
        organizationId: environment.organization.id,
        projectId: environment.project.id,
        environmentId: environment.id,
        serviceId,
        executionId,
      },
    })
  }

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    row: Row<DeploymentHistoryService | (typeof deploymentHistoryQueue)[number]>
  ) => {
    const executionId = getDeploymentExecutionId(row)

    if (event.key !== 'Enter' || !environment || !executionId || shouldIgnoreRowNavigation(event.target)) return

    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId',
      params: {
        organizationId: environment.organization.id,
        projectId: environment.project.id,
        environmentId: environment.id,
        serviceId,
        executionId,
      },
    })
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
          {table.getRowModel().rows.map((row) => {
            const executionId = getDeploymentExecutionId(row)

            return (
              <Table.Row
                key={row.id}
                role={executionId ? 'link' : undefined}
                tabIndex={executionId ? 0 : undefined}
                className={twMerge(
                  'h-[68px] divide-x divide-neutral border-neutral',
                  executionId ? 'cursor-pointer hover:bg-surface-neutral-subtle focus:bg-surface-neutral-subtle' : ''
                )}
                onClick={(event) => handleRowClick(event, row)}
                onKeyDown={(event) => handleRowKeyDown(event, row)}
              >
                {row.getVisibleCells().map((cell, i) => (
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
            )
          })}
        </Table.Body>
      </Table.Root>
    </div>
  )
}

export default ServiceDeploymentList
