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
import {
  Badge,
  Checkbox,
  EmptyState,
  Icon,
  Link,
  Skeleton,
  TableFilter,
  TablePrimitives,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useListDeploymentStages } from '../hooks/use-list-deployment-stages/use-list-deployment-stages'
import { useServices } from '../hooks/use-services/use-services'
import { ServiceAvatar } from '../service-avatar/service-avatar'
import { ServiceListActionBar } from './service-list-action-bar'
import {
  ServiceLastDeploymentCell,
  ServiceNameCell,
  ServiceRunningStatusCell,
  ServiceVersionCell,
} from './service-list-cells'

const { Table } = TablePrimitives
type ServiceListRows = ReturnType<typeof useServices>['data']
type ServiceListRow = ServiceListRows[number]

export interface ServiceListProps extends ComponentProps<typeof Table.Root> {
  environment: Environment
  enableSelection?: boolean
  servicesOverride?: ServiceListRows
  argocdStatusByServiceId?: Record<string, 'Synced' | 'Out of sync'>
  argocdOperationByServiceId?: Record<string, string>
  argocdTargetVersionByServiceId?: Record<string, { primary: string; secondary: string }>
  argocdLastDeploymentByServiceId?: Record<string, string>
}

export function ServiceList({
  className,
  containerClassName,
  environment,
  enableSelection = true,
  servicesOverride,
  argocdStatusByServiceId,
  argocdOperationByServiceId,
  argocdTargetVersionByServiceId,
  argocdLastDeploymentByServiceId,
  ...props
}: ServiceListProps) {
  const clusterId = environment.cluster_id || ''
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

  const sourceServices: ServiceListRows = servicesOverride ?? services
  const hasSelectionColumn = enableSelection

  const sortedServices = useMemo(() => {
    return [...sourceServices].sort((a, b) => {
      const aIsSkipped = skippedServicesMap.get(a.id) || false
      const bIsSkipped = skippedServicesMap.get(b.id) || false

      if (aIsSkipped !== bIsSkipped) {
        return aIsSkipped ? 1 : -1
      }

      return 0
    })
  }, [sourceServices, skippedServicesMap])

  const columnHelper = createColumnHelper<ServiceListRow>()
  const columns = useMemo(
    () => [
      ...(enableSelection
        ? [
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
                  <label
                    className="absolute inset-y-0 left-0 flex items-center p-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isDisabled ? (
                      <Tooltip content="This service is skipped and cannot be selected for bulk deployment">
                        <span>{checkbox}</span>
                      </Tooltip>
                    ) : (
                      checkbox
                    )}
                  </label>
                )
              },
            }),
          ]
        : []),
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
                environment={environment}
                argocdOperationLabelOverride={argocdOperationByServiceId?.[info.row.original.id]}
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
              statusLabelOverride={argocdStatusByServiceId?.[info.row.original.id]}
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
            <ServiceVersionCell
              service={info.row.original}
              organizationId={organizationId}
              projectId={projectId}
              versionOverride={argocdTargetVersionByServiceId?.[info.row.original.id]}
            />
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
              timeLabelOverride={argocdLastDeploymentByServiceId?.[info.row.original.id]}
            />
          )
        },
      }),
    ],
    [
      columnHelper,
      environment,
      clusterId,
      organizationId,
      projectId,
      environmentId,
      argocdStatusByServiceId,
      argocdOperationByServiceId,
      argocdLastDeploymentByServiceId,
      argocdTargetVersionByServiceId,
      enableSelection,
    ]
  )

  const table = useReactTable<ServiceListRow>({
    data: sortedServices,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: enableSelection
      ? (row) => {
          return !skippedServicesMap.get(row.original.id)
        }
      : false,
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

  const statusFacetedUniqueValues = Array.from(
    table.getColumn('runningStatus')?.getFacetedUniqueValues().entries() ?? []
  )

  if (sourceServices.length === 0) {
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
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/new"
          params={{ organizationId, projectId, environmentId }}
        >
          New service
          <Icon iconName="circle-plus" iconStyle="regular" />
        </Link>
      </EmptyState>
    )
  }

  return (
    <div>
      <div className="flex gap-2 px-4 py-2">
        {statusFacetedUniqueValues.some(([value]) => value === undefined) ? (
          <Skeleton height={24} width={70} />
        ) : (
          statusFacetedUniqueValues.map(([value, count]: [string, number]) => (
            <Badge key={value}>
              {count} {value}
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
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header, i) => (
                  <Table.ColumnHeaderCell
                    className={
                      hasSelectionColumn
                        ? `px-6 ${i === 0 ? 'pl-4' : ''} ${i === 1 ? 'border-r border-neutral pl-0' : ''} font-medium`
                        : twMerge('px-6 font-medium', i === 0 && 'border-r border-neutral pl-4')
                    }
                    key={header.id}
                    style={{ width: hasSelectionColumn && i === 0 ? '20px' : `${header.getSize()}%` }}
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
                    navigate({
                      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
                      params: { organizationId, projectId, environmentId, serviceId: row.original.id },
                    })
                  }}
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <Table.Cell
                      key={cell.id}
                      className={
                        hasSelectionColumn
                          ? `px-6 ${i === 1 ? 'border-r border-neutral pl-0' : ''} first:relative`
                          : twMerge('px-6', i === 0 && 'border-r border-neutral pl-4')
                      }
                      style={{ width: hasSelectionColumn && i === 0 ? '20px' : `${cell.column.getSize()}%` }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              </Fragment>
            ))}
          </Table.Body>
        </Table.Root>
        {enableSelection ? (
          <ServiceListActionBar
            environment={environment}
            selectedRows={selectedRows}
            resetRowSelection={() => table.resetRowSelection()}
          />
        ) : null}
      </div>
    </div>
  )
}

export default ServiceList
