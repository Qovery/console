import {
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type ReactElement, useMemo, useState } from 'react'
import { type TerraformResource } from '@qovery/shared/interfaces'
import { Badge, Icon, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

const { Table } = TablePrimitives

function getSortIcon(sortDirection: false | 'asc' | 'desc'): string {
  if (sortDirection === 'asc') return 'icon-solid-arrow-up'
  if (sortDirection === 'desc') return 'icon-solid-arrow-down'
  return 'icon-solid-arrow-up-down'
}

export interface TerraformResourcesTableProps {
  resources: TerraformResource[]
  className?: string
}

export function TerraformResourcesTable({ resources, className }: TerraformResourcesTableProps): ReactElement {
  const [sorting, setSorting] = useState<SortingState>([])

  const columnHelper = createColumnHelper<TerraformResource>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('displayName', {
        id: 'type',
        header: 'Resource Type',
        enableSorting: true,
        size: 200,
        cell: (info) => {
          const resource = info.row.original
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-neutral-400">{resource.displayName}</span>
              <span className="text-xs text-neutral-350">{resource.resourceType}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        enableSorting: true,
        size: 180,
        cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('address', {
        header: 'Resource Address',
        enableSorting: true,
        size: 220,
        cell: (info) => {
          const address = info.getValue()
          return (
            <Tooltip content={address}>
              <code className="text-xs text-neutral-400">{address}</code>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor('keyAttributes', {
        header: 'Key Attributes',
        enableSorting: false,
        size: 300,
        cell: (info) => {
          const attributes = info.getValue()
          if (!attributes || attributes.length === 0) {
            return <span className="text-xs text-neutral-350">-</span>
          }
          return (
            <div className="flex flex-wrap gap-1">
              {attributes.map((attr) => (
                <Tooltip key={attr.key} content={`${attr.displayName}: ${attr.value}`}>
                  <Badge size="sm" variant="surface">
                    {attr.displayName}
                  </Badge>
                </Tooltip>
              ))}
            </div>
          )
        },
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: resources,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className={twMerge('w-full overflow-x-auto', className)}>
      <Table.Root className="w-full min-w-max text-ssm">
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeaderCell
                  key={header.id}
                  style={{ width: `${header.getSize()}px` }}
                  className={twMerge(header.column.getCanSort() && 'cursor-pointer select-none')}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : (
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <Icon name={getSortIcon(header.column.getIsSorted())} className="text-xs text-neutral-350" />
                      )}
                    </div>
                  )}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row key={row.id} className="hover:bg-neutral-100">
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  )
}
