import {
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { StateEnum } from 'qovery-typescript-axios'
import { Fragment, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import {
  ActionToolbar,
  DropdownMenu,
  Icon,
  Link,
  TableFilter,
  TablePrimitives,
  Tooltip,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { isCancelBuildAvailable, twMerge } from '@qovery/shared/util-js'
import { useCancelDeploymentEnvironment } from '../hooks/use-cancel-deployment-environment/use-cancel-deployment-environment'
import { useDeploymentHistory } from '../hooks/use-deployment-history/use-deployment-history'
import { useEnvironment } from '../hooks/use-environment/use-environment'

const { Table } = TablePrimitives

export interface EnvironmentDeploymentListProps {
  environmentId: string
}

export function EnvironmentDeploymentList({ environmentId }: EnvironmentDeploymentListProps) {
  const { data: environment, isFetched: isFetchedEnvironment } = useEnvironment({ environmentId })

  const logsLink =
    ENVIRONMENT_LOGS_URL(environment?.organization.id, environment?.project.id, environment?.id) +
    ENVIRONMENT_STAGES_URL()

  const { data: deploymentHistory = [], isFetched: isFetchedDeloymentHistory } = useDeploymentHistory({ environmentId })
  const { mutate: cancelDeploymentEnvironment } = useCancelDeploymentEnvironment({
    projectId: environment?.project.id ?? '',
    logsLink,
  })
  const { pathname } = useLocation()
  const { openModalConfirmation } = useModalConfirmation()

  const [sorting, setSorting] = useState<SortingState>([])

  const mutationCancelDeployment = () => {
    openModalConfirmation({
      mode: environment?.mode,
      title: 'Confirm cancel',
      description:
        'Stopping a deployment may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the environment:',
      name: environment?.name,
      action: () => cancelDeploymentEnvironment({ environmentId }),
    })
  }

  const columnHelper = createColumnHelper<(typeof deploymentHistory)[number]>()
  const columns = useMemo(
    () => [
      columnHelper.accessor('identifier.execution_id', {
        header: 'Execution ID',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 57,
        cell: (info) => {
          const state = info.row.original.status

          return (
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-neutral-400">
                  {dateFullFormat(info.row.original.auditing_data.created_at, undefined, 'dd MMM, HH:mm a')}
                </span>
                <span className="text-ssm text-neutral-350">{info.getValue()}</span>
              </div>
              <ActionToolbar.Root>
                {match(state)
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
                                  .with('DEPLOYMENT_QUEUED', 'DELETE_QUEUED', 'STOP_QUEUED', 'RESTART_QUEUED', () => (
                                    <Icon iconName="clock" iconStyle="regular" className="mr-3" />
                                  ))
                                  .otherwise(() => (
                                    <Icon iconName="loader" className="mr-3 animate-spin" />
                                  ))}
                                <Icon iconName="chevron-down" />
                              </div>
                            </Tooltip>
                          </ActionToolbar.Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          {isCancelBuildAvailable(state) && (
                            <DropdownMenu.Item icon={<Icon iconName="xmark" />} onSelect={mutationCancelDeployment}>
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
                <Tooltip content="Logs">
                  <ActionToolbar.Button asChild>
                    <Link
                      to={
                        ENVIRONMENT_LOGS_URL(environment?.organization.id, environment?.project.id, environment?.id) +
                        ENVIRONMENT_STAGES_URL(info.row.original.identifier.execution_id ?? '')
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
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status deployment',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 15,
        cell: (info) => <span>{info.getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.stages[0]?.name ?? '', {
        header: 'Pipeline',
        enableColumnFilter: false,
        enableSorting: false,
        size: 30,
        cell: (info) => <span>{info.row.original.stages.map((v) => v.name)}</span>,
      }),
      columnHelper.accessor('total_duration', {
        header: 'Duration',
        enableColumnFilter: false,
        enableSorting: true,
        size: 3,
        cell: (info) => <p>{info.getValue()}</p>,
      }),
      columnHelper.accessor('auditing_data.triggered_by', {
        header: 'Trigger by',
        enableColumnFilter: false,
        enableSorting: true,
        size: 10,
        cell: (info) => <p>{info.getValue()}</p>,
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: deploymentHistory,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    // https://github.com/TanStack/table/discussions/3192#discussioncomment-6458134
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })
  return (
    <div className="flex grow flex-col justify-between">
      <Table.Root className="w-full min-w-[1080px] overflow-x-scroll text-ssm">
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <Table.ColumnHeaderCell
                  className={`px-6 ${i === 0 ? 'pl-4' : ''} ${i === 1 ? 'border-r pl-0' : ''} font-medium`}
                  key={header.id}
                  style={{ width: i === 0 ? '20px' : `${header.getSize()}%` }}
                >
                  {header.column.getCanFilter() ? (
                    <TableFilter column={header.column} />
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
              <Table.Row className="h-[68px]">
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
