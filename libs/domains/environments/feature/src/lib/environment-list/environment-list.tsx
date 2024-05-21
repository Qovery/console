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
import { type Environment, type Project } from 'qovery-typescript-axios'
import { type ComponentProps, Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import {
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_URL,
  CLUSTER_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import {
  Badge,
  Button,
  EmptyState,
  Icon,
  Link,
  StatusChip,
  TableFilter,
  TablePrimitives,
  Tooltip,
  Truncate,
  useModal,
} from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { CreateCloneEnvironmentModal } from '../create-clone-environment-modal/create-clone-environment-modal'
import { EnvironmentActionToolbar } from '../environment-action-toolbar/environment-action-toolbar'
import { useEnvironments } from '../hooks/use-environments/use-environments'
import { EnvironmentListSkeleton } from './environment-list-skeleton'

const { Table } = TablePrimitives

function EnvironmentNameCell({ environment }: { environment: Environment }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-4 font-medium text-sm text-neutral-400 min-w-0">
        <Tooltip content={upperCaseFirstLetter(environment.mode)}>
          {match(environment.mode)
            .with('DEVELOPMENT', () => (
              <Badge
                variant="outline"
                color="neutral"
                size="xs"
                className="flex w-4 h-4 justify-center p-0 font-semibold"
              >
                D
              </Badge>
            ))
            .with('PREVIEW', () => (
              <Badge
                variant="surface"
                color="purple"
                size="xs"
                className="flex w-4 h-4 justify-center p-0 font-semibold"
              >
                V
              </Badge>
            ))
            .with('PRODUCTION', () => (
              <Badge variant="surface" color="red" size="xs" className="flex w-4 h-4 justify-center p-0 font-semibold">
                P
              </Badge>
            ))
            .with('STAGING', () => (
              <Badge
                variant="surface"
                color="green"
                size="xs"
                className="flex w-4 h-4 justify-center p-0 font-semibold"
              >
                S
              </Badge>
            ))
            .exhaustive()}
        </Tooltip>
        <span className="flex flex-col shrink truncate min-w-0 pr-2">
          <span className="truncate">
            <Truncate text={environment.name} truncateLimit={90} />
          </span>
          <span className="text-xs text-neutral-350 font-normal">{upperCaseFirstLetter(environment.mode)}</span>
        </span>
      </span>
      <div className="flex items-center gap-4 shrink-0">
        <div onClick={(e) => e.stopPropagation()}>
          <EnvironmentActionToolbar environment={environment} />
        </div>
      </div>
    </div>
  )
}

export interface EnvironmentListProps extends ComponentProps<typeof Table.Root> {
  project: Project
  clusterAvailable: boolean
}

export function EnvironmentList({ project, clusterAvailable, className, ...props }: EnvironmentListProps) {
  const { data: environments = [], isLoading: isEnvironmentsLoading } = useEnvironments({ projectId: project.id })
  const [sorting, setSorting] = useState<SortingState>([])
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()

  const columnHelper = createColumnHelper<(typeof environments)[number]>()
  const columns = useMemo(
    () => [
      columnHelper.accessor('mode', {
        header: 'Environment',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 40,
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
          return <EnvironmentNameCell environment={info.row.original} />
        },
      }),
      columnHelper.accessor('runningStatus.stateLabel', {
        id: 'runningStatus',
        header: 'Environment status',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 15,
        cell: (info) => {
          const value = info.getValue()
          const environment = info.row.original
          return (
            <Tooltip content="See overview">
              <Link
                as="button"
                to={
                  SERVICES_URL(environment.organization.id, environment.project.id, environment.id) +
                  SERVICES_GENERAL_URL
                }
                onClick={(e) => e.stopPropagation()}
                className="text-sm gap-2 whitespace-nowrap"
                size="md"
                color="neutral"
                variant="outline"
                radius="full"
              >
                <StatusChip status={environment.runningStatus?.state} />
                {value}
              </Link>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor('deploymentStatus.stateLabel', {
        id: 'deploymentStatus',
        header: 'Last deployment',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 15,
        cell: (info) => {
          const value = info.getValue()
          const environment = info.row.original
          return (
            <Tooltip content="See logs">
              <Link
                as="button"
                to={ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id)}
                onClick={(e) => e.stopPropagation()}
                className="text-sm gap-2 whitespace-nowrap"
                size="md"
                color="neutral"
                variant="outline"
                radius="full"
              >
                <StatusChip status={environment.deploymentStatus?.state} />
                {value}
              </Link>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor('cluster_name', {
        id: 'cluster_name',
        header: 'Cluster',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 20,
        cell: (info) => {
          const value = info.getValue() ?? ''
          const environment = info.row.original
          return (
            <Tooltip content={`${environment.cluster_name} (${environment.cloud_provider.cluster})`}>
              <Link
                as="button"
                to={CLUSTER_URL(environment.organization.id, environment.cluster_id)}
                onClick={(e) => e.stopPropagation()}
                color="neutral"
                variant="surface"
                size="xs"
              >
                <Icon
                  className="mr-2"
                  name={
                    environment.cloud_provider.provider === 'ON_PREMISE'
                      ? IconEnum.KUBERNETES
                      : environment.cloud_provider.provider
                  }
                  width={16}
                  height={16}
                />
                <Truncate text={value} truncateLimit={30} />
              </Link>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor('updated_at', {
        header: 'Last update',
        enableColumnFilter: false,
        enableSorting: true,
        size: 10,
        cell: (info) => {
          const value = info.getValue()
          return value ? (
            <Tooltip content={dateUTCString(value)}>
              <span className="text-xs text-neutral-350 whitespace-nowrap">{timeAgo(new Date(value))}</span>
            </Tooltip>
          ) : (
            <Icon iconStyle="regular" iconName="circle-question" className="text-sm text-neutral-300" />
          )
        },
      }),
    ],
    []
  )

  const table = useReactTable({
    data: environments,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // https://github.com/TanStack/table/discussions/3192#discussioncomment-6458134
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })

  if (environments.length === 0 && isEnvironmentsLoading) {
    return <EnvironmentListSkeleton />
  }

  if (environments.length === 0) {
    return (
      <EmptyState
        title={`${clusterAvailable ? 'Create your first environment 💫' : 'Create your Cluster first 💫'}`}
        description={`${
          clusterAvailable
            ? 'Please create your environment to start using Qovery and create your first service'
            : 'Deploying a cluster is necessary to start using Qovery and create your first environment'
        }`}
      >
        <Button
          className="mt-5"
          size="lg"
          onClick={() => {
            clusterAvailable
              ? openModal({
                  content: (
                    <CreateCloneEnvironmentModal
                      onClose={closeModal}
                      projectId={project.id}
                      organizationId={project.organization.id}
                    />
                  ),
                })
              : navigate(CLUSTERS_URL(project.organization?.id) + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_GENERAL_URL)
          }}
        >
          {clusterAvailable ? 'New environment' : 'Create a Cluster'} <Icon className="ml-2" iconName="circle-plus" />
        </Button>
      </EmptyState>
    )
  }

  return (
    <Table.Root className={twMerge('w-full text-xs min-w-[800px]', className)} {...props}>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.ColumnHeaderCell
                className="first:border-r font-medium"
                key={header.id}
                style={{ width: `${header.getSize()}%` }}
              >
                {header.column.getCanFilter() ? (
                  <TableFilter column={header.column} />
                ) : header.column.getCanSort() ? (
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
            <Table.Row
              className="hover:bg-neutral-100 h-16 cursor-pointer"
              onClick={() => {
                navigate(
                  SERVICES_URL(row.original.organization.id, row.original.project.id, row.original.id) +
                    SERVICES_GENERAL_URL
                )
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id} className="first:border-r" style={{ width: `${cell.column.getSize()}%` }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          </Fragment>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export default EnvironmentList
