import {
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type VariableResponse as Variable } from 'qovery-typescript-axios'
import { type ComponentProps, Fragment, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { Icon, PasswordShowHide, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useVariables } from '../hooks/use-variables/use-variables'

const { Table } = TablePrimitives

interface JobOutputVariablesProps extends ComponentProps<typeof Table.Root> {
  serviceId: string
}

export function OutputVariables({ serviceId, className, ...props }: JobOutputVariablesProps) {
  const { data = [] } = useVariables({ parentId: serviceId, scope: 'JOB' })
  const [sorting, setSorting] = useState<SortingState>([])
  const keyPrefix = `QOVERY_OUTPUT_JOB_Z${serviceId.split('-')[0].toUpperCase()}_`

  const variables: Variable[] = useMemo(() => {
    return data
      .filter(({ key }) => key.startsWith(keyPrefix))
      .map((v) => ({ ...v, key: v.key.slice(keyPrefix.length) }))
  }, [data])

  const columnHelper = createColumnHelper<Variable>()
  const columns = useMemo(
    () => [
      columnHelper.accessor('key', {
        header: () => (
          <>
            Job output variables
            <Tooltip
              content={
                <>
                  The Job output is injected as environment variables <br />
                  to any service within this environment
                </>
              }
            >
              <span>
                <Icon iconName="circle-info" className="text-neutral-350" />
              </span>
            </Tooltip>
          </>
        ),
        enableSorting: true,
        size: 50,
        cell: (info) => {
          const { key, description } = info.row.original
          return (
            <div className="flex items-center gap-1">
              <span className="text-sm text-neutral-350">{key}</span>{' '}
              {description && (
                <Tooltip content={description}>
                  <span>
                    <Icon iconName="circle-info" className="text-neutral-350" />
                  </span>
                </Tooltip>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor('value', {
        header: 'Value',
        enableSorting: false,
        size: 50,
        cell: (info) => {
          const { is_secret, value } = info.row.original
          return <PasswordShowHide value={value ?? ''} isSecret={is_secret} />
        },
      }),
    ],
    []
  )

  const table = useReactTable({
    data: variables,
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

  if (variables.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden rounded border">
      <Table.Root className={twMerge('w-full text-xs', className)} {...props}>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeaderCell
                  className="font-medium"
                  key={header.id}
                  style={{ width: `${header.getSize()}%` }}
                >
                  {header.column.getCanSort() ? (
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
              <Table.Row className="h-12">
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id} style={{ width: `${cell.column.getSize()}%` }}>
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

export default OutputVariables
