import { useNavigate } from '@tanstack/react-router'
import {
  type RowSelectionState,
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
import { type Environment } from 'qovery-typescript-axios'
import { type ComponentProps, Fragment, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import {
  APPLICATION_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  SERVICES_GENERAL_URL,
  SERVICES_NEW_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { Checkbox, EmptyState, Icon, Link, TableFilter, TablePrimitives, Truncate } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import useServices from '../hooks/use-services/use-services'
import { ServiceAvatar } from '../service-avatar/service-avatar'
import { ServiceListActionBar } from './service-list-action-bar'
import {
  ServiceLastDeploymentCell,
  ServiceNameCell,
  ServiceRunningStatusCell,
  ServiceVersionCell,
} from './service-list-cells'

const { Table } = TablePrimitives

export interface ServiceListProps extends ComponentProps<typeof Table.Root> {
  environment: Environment
}

export function ServiceList({ className, environment, ...props }: ServiceListProps) {
  const clusterId = environment.cluster_id || ''
  const environmentId = environment.id || ''
  const organizationId = environment.organization.id || ''
  const projectId = environment.project.id || ''

  const { data: services = [] } = useServices({ environmentId, suspense: true })

  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const navigate = useNavigate()

  const columnHelper = createColumnHelper<(typeof services)[number]>()
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        enableColumnFilter: false,
        enableSorting: false,
        header: ({ table }) => (
          <div className="h-5">
            {/** XXX: fix css weird 1px vertical shift when checked/unchecked **/}
            <Checkbox
              checked={
                table.getIsSomeRowsSelected()
                  ? table.getIsAllRowsSelected()
                    ? true
                    : 'indeterminate'
                  : table.getIsAllRowsSelected()
              }
              onCheckedChange={(checked) => {
                if (checked === 'indeterminate') {
                  return
                }
                table.toggleAllRowsSelected(checked)
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <label className="absolute inset-y-0 left-0 flex items-center p-4" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onCheckedChange={(checked) => {
                if (checked === 'indeterminate') {
                  return
                }
                row.toggleSelected(checked)
              }}
            />
          </label>
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Service',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 57,
        meta: {
          customFacetEntry({ value, row }) {
            const service = row?.original
            const serviceType = service?.serviceType
            if (!serviceType) {
              return null
            }
            return (
              <span className="flex items-center gap-2 text-sm font-medium">
                <ServiceAvatar service={service} size="xs" />
                <Truncate text={value} truncateLimit={20} />
              </span>
            )
          },
        },
        cell: (info) => {
          return (
            <div className="min-w-[400px] flex-1">
              <ServiceNameCell
                service={info.row.original}
                deploymentStatus={info.row.original.deploymentStatus}
                environment={environment}
              />
            </div>
          )
        },
      }),
      columnHelper.accessor('runningStatus.stateLabel', {
        id: 'runningStatus',
        header: 'Service status',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
        size: 15,
        cell: (info) => {
          return (
            <ServiceRunningStatusCell
              service={info.row.original}
              environment={environment}
              organizationId={organizationId}
              projectId={projectId}
              clusterId={clusterId}
            />
          )
        },
      }),
      columnHelper.accessor('version', {
        header: 'Target version',
        enableColumnFilter: false,
        enableSorting: false,
        size: 30,
        cell: (info) => {
          return (
            <ServiceVersionCell service={info.row.original} organizationId={organizationId} projectId={projectId} />
          )
        },
      }),
      columnHelper.accessor('deploymentStatus.last_deployment_date', {
        header: 'Last deployment',
        enableColumnFilter: false,
        enableSorting: true,
        size: 3,
        cell: (info) => {
          return (
            <ServiceLastDeploymentCell
              service={info.row.original}
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
            />
          )
        },
      }),
    ],
    [columnHelper, environment, clusterId, organizationId, projectId, environmentId]
  )

  const table = useReactTable({
    data: services,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
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

  if (services.length === 0) {
    return (
      <EmptyState
        title="No service found"
        description="You can create a service from the button on the top"
        className="mt-2 rounded-t-sm bg-white pt-10"
      >
        <Link
          as="button"
          size="lg"
          className="mt-5 gap-2"
          to={`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_NEW_URL}`}
        >
          New service
          <Icon iconName="circle-plus" iconStyle="regular" />
        </Link>
      </EmptyState>
    )
  }

  const selectedRows = table.getSelectedRowModel().rows.map(({ original }) => original)

  return (
    <div className="flex grow flex-col justify-between">
      <Table.Root className={twMerge('w-full min-w-[1080px] overflow-x-scroll text-ssm', className)} {...props}>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <Table.ColumnHeaderCell
                  className={`px-6 ${i === 0 ? 'pl-4' : ''} ${i === 1 ? 'border-r border-neutral pl-0' : ''} font-medium`}
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
              <Table.Row
                className={twMerge('h-[68px] ')}
                onClick={() => {
                  const link = match(row.original)
                    .with(
                      { serviceType: ServiceTypeEnum.DATABASE },
                      ({ id }) => DATABASE_URL(organizationId, projectId, environmentId, id) + DATABASE_GENERAL_URL
                    )
                    .otherwise(
                      ({ id }) => APPLICATION_URL(organizationId, projectId, environmentId, id) + SERVICES_GENERAL_URL
                    )

                  navigate({ to: link })
                }}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <Table.Cell
                    key={cell.id}
                    className={`px-6 ${i === 1 ? 'border-r border-neutral pl-0' : ''} first:relative`}
                    style={{ width: i === 0 ? '20px' : `${cell.column.getSize()}%` }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
      <ServiceListActionBar
        environment={environment}
        selectedRows={selectedRows}
        resetRowSelection={() => table.resetRowSelection()}
      />
    </div>
  )
}

export default ServiceList
