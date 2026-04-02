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
import clsx from 'clsx'
import { type Environment } from 'qovery-typescript-axios'
import { type ComponentProps, Fragment, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import {
  Badge,
  Checkbox,
  EmptyState,
  Icon,
  Link,
  Section,
  Skeleton,
  StatusChip,
  TableFilter,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useListDeploymentStages } from '../hooks/use-list-deployment-stages/use-list-deployment-stages'
import { useServices } from '../hooks/use-services/use-services'
import { ServiceActions } from '../service-actions/service-actions'
import { ServiceListActionBar } from './service-list-action-bar'
import { ServiceLastDeploymentCell, ServiceNameCell, ServiceVersionCell } from './service-list-cells'

const { Table } = TablePrimitives

export interface ServiceListProps extends ComponentProps<typeof Table.Root> {
  environment: Environment
}

export const tableGridLayoutClassName =
  'grid w-full grid-cols-[44px_minmax(250px,1.5fr)_48px_minmax(150px,1fr)_minmax(320px,1.24fr)_130px]'

export const ServiceListSkeleton = () => {
  return (
    <div>
      <div className="flex gap-2 px-3.5 py-2">
        <Skeleton height={24} width={80} />
        <Skeleton height={24} width={90} />
      </div>
      <hr className="w-full border-neutral" />
      <div className="flex flex-col gap-8">
        <Section className="flex flex-col gap-3.5">
          <Table.Root className="w-full" containerClassName="rounded-lg border-none">
            <Table.Header>
              <Table.Row className={tableGridLayoutClassName}>
                {[...Array(6)].map((_, index) => (
                  <Table.ColumnHeaderCell key={index} className="flex items-center first:border-r">
                    {index === 0 ? (
                      <div className="flex items-center justify-between">
                        <Skeleton height={16} width={16} />
                      </div>
                    ) : index === 2 ? null : (
                      <Skeleton height={14} width={120} />
                    )}
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {[...Array(3)].map((_, index) => (
                <Table.Row key={index} className={tableGridLayoutClassName}>
                  {[...Array(6)].map((_, index) => (
                    <Table.Cell key={index} className="flex h-14 items-center first:border-r">
                      {index === 0 ? (
                        <div className="flex items-center justify-between">
                          <Skeleton height={16} width={16} />
                        </div>
                      ) : index === 2 ? (
                        <Skeleton height={16} width={16} rounded />
                      ) : (
                        <Skeleton height={24} width={120} />
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Section>
      </div>
    </div>
  )
}

export function ServiceList({ className, containerClassName, environment, ...props }: ServiceListProps) {
  const environmentId = environment.id || ''
  const organizationId = environment.organization.id || ''
  const projectId = environment.project.id || ''

  const { data: services } = useServices({ environmentId, suspense: true })
  const { data: deploymentStages } = useListDeploymentStages({ environmentId, suspense: true })

  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const navigate = useNavigate()

  // Build map of service_id -> is_skipped for quick lookup
  const skippedServicesMap = useMemo(() => {
    const map = new Map<string, boolean>()
    deploymentStages?.forEach((stage) => {
      stage.services?.forEach((service) => {
        if (service.service_id && service.is_skipped) {
          map.set(service.service_id, true)
        }
      })
    })
    return map
  }, [deploymentStages])

  const actualServices = useMemo(() => {
    return services.map((service) => {
      return {
        ...service,
        status: match(service)
          .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, () => service.deploymentStatus?.state)
          .otherwise(() => service.runningStatus?.state),
      }
    })
  }, [services])

  const sortedServices = useMemo(() => {
    return [...actualServices].sort((a, b) => {
      const aIsSkipped = skippedServicesMap.get(a.id) || false
      const bIsSkipped = skippedServicesMap.get(b.id) || false

      if (aIsSkipped !== bIsSkipped) {
        return aIsSkipped ? 1 : -1
      }

      return 0
    })
  }, [actualServices, skippedServicesMap])

  const columnHelper = createColumnHelper<(typeof actualServices)[number]>()
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        enableColumnFilter: false,
        enableSorting: false,
        header: ({ table }) => (
          <div className="flex h-full w-full items-center pl-4">
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
        cell: ({ row }) => {
          const isDisabled = !row.getCanSelect()
          const checkbox = (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={isDisabled}
              onCheckedChange={(checked) => {
                if (checked === 'indeterminate') {
                  return
                }
                row.toggleSelected(checked)
              }}
            />
          )

          return (
            <div className="flex h-full w-full items-center pl-4">
              <label onClick={(e) => e.stopPropagation()}>
                {isDisabled ? (
                  <Tooltip content="This service is skipped and cannot be selected for bulk deployment">
                    <span>{checkbox}</span>
                  </Tooltip>
                ) : (
                  checkbox
                )}
              </label>
            </div>
          )
        },
      }),
      columnHelper.accessor('name', {
        header: 'Service',
        enableColumnFilter: false,
        enableSorting: true,
        size: 57,
        cell: (info) => {
          return <ServiceNameCell service={info.row.original} environment={environment} />
        },
      }),
      columnHelper.accessor('status', {
        header: () => null,
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          const serviceStatus = match(info.row.original)
            .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, () => info.row.original.deploymentStatus?.state)
            .otherwise(() => info.row.original.runningStatus?.state)

          return <StatusChip status={serviceStatus} />
        },
      }),
      columnHelper.display({
        id: 'last_deployment',
        header: 'Last deployment',
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => <ServiceLastDeploymentCell service={info.row.original} environment={environment} />,
      }),
      columnHelper.accessor('version', {
        header: 'Target version',
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          return (
            <ServiceVersionCell service={info.row.original} organizationId={organizationId} projectId={projectId} />
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          return (
            <div className="flex h-full items-center" onClick={(e) => e.stopPropagation()}>
              <ServiceActions serviceId={info.row.original.id} environment={environment} />
            </div>
          )
        },
      }),
    ],
    [columnHelper, environment, organizationId, projectId]
  )

  const table = useReactTable({
    data: sortedServices,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: (row) => {
      return !skippedServicesMap.get(row.original.id)
    },
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

  const selectedRows = table.getSelectedRowModel().rows.map(({ original }) => original)

  const statusFacetedUniqueValues = Array.from(table.getColumn('status')?.getFacetedUniqueValues().entries() ?? [])

  if (services.length === 0) {
    return (
      <EmptyState
        title="No service found"
        description="You can create a service from the button on the top"
        className="border-none"
      >
        <Link
          as="button"
          size="md"
          color="neutral"
          className="gap-2"
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/new"
          params={{ organizationId, projectId, environmentId }}
        >
          <Icon iconName="circle-plus" iconStyle="regular" />
          New service
        </Link>
      </EmptyState>
    )
  }

  return (
    <div>
      <div className="flex gap-2 bg-surface-neutral px-4 py-2">
        {statusFacetedUniqueValues.some(([value]) => value === undefined) ? (
          <Skeleton height={24} width={70} />
        ) : (
          statusFacetedUniqueValues.map(([value, count]: [string, number]) => (
            <Badge
              key={value}
              variant="surface"
              color={match(value)
                .with('RUNNING', () => 'green' as const)
                .with('ERROR', () => 'red' as const)
                .otherwise(() => 'neutral' as const)}
              className="text-ssm font-medium"
            >
              {count} {value.toLowerCase()}
            </Badge>
          ))
        )}
      </div>
      <div className="flex grow flex-col justify-between">
        <Table.Root
          className={twMerge(
            'w-full min-w-[1080px] overflow-x-scroll overflow-y-scroll rounded-lg text-xs xl:overflow-auto',
            className
          )}
          containerClassName={twMerge('rounded-none border-none', containerClassName)}
          {...props}
        >
          <Table.Header className="border-t border-neutral">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} className={twMerge('w-full', tableGridLayoutClassName)}>
                {headerGroup.headers.map((header, i) => (
                  <Table.ColumnHeaderCell
                    key={header.id}
                    className={twMerge('relative flex items-center', i === 1 || i === 0 ? 'border-none p-0' : '')}
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
                  className={twMerge(
                    'h-[60px] w-full cursor-pointer hover:bg-surface-neutral-subtle',
                    tableGridLayoutClassName
                  )}
                  onClick={() => {
                    navigate({
                      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
                      params: { organizationId, projectId, environmentId, serviceId: row.original.id },
                    })
                  }}
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <Table.Cell
                      key={cell.id}
                      className={twMerge(
                        'relative flex h-full items-center border-r border-neutral last:border-r-0',
                        i === 1 || i === 0 ? 'border-none p-0' : ''
                      )}
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
    </div>
  )
}

export default ServiceList
