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
import { Icon, IconAwesomeEnum, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { useVariables } from '../hooks/use-variables/use-variables'

const { Table } = TablePrimitives

function VariableValue({ variable }: { variable: Variable }) {
  const [visible, setVisible] = useState(false)
  const [icon, setIcon] = useState(IconAwesomeEnum.COPY)
  const [, copyToClipboard] = useCopyToClipboard()

  const onClickCopyToClipboard = (content: string) => {
    copyToClipboard(content)
    setIcon(IconAwesomeEnum.CHECK)
    setTimeout(() => {
      setIcon(IconAwesomeEnum.COPY)
    }, 1000)
  }

  return variable.is_secret ? (
    <span className="flex items-center gap-2 text-sm text-neutral-300">
      <Tooltip content="Secret variable">
        <span>
          <Icon className="block w-4" name={IconAwesomeEnum.LOCK} />
        </span>
      </Tooltip>
      <span className="text-2xl font-medium pt-1.5">*************</span>
    </span>
  ) : (
    <span className="flex items-center gap-2 text-sm">
      <Tooltip content={visible ? 'Hide variable' : 'View variable'}>
        <button type="button" className="w-4 text-brand-500" onClick={() => setVisible((visible) => !visible)}>
          {visible ? <Icon name={IconAwesomeEnum.EYE_SLASH} /> : <Icon name={IconAwesomeEnum.EYE} />}
        </button>
      </Tooltip>
      {visible ? (
        <>
          <span className="text-brand-500">{variable.value}</span>
          {Boolean(variable.value) && (
            <Tooltip content="Copy">
              <button
                className="text-brand-500"
                onClick={() => variable.value !== null && onClickCopyToClipboard(variable.value)}
              >
                <Icon name={icon} />
              </button>
            </Tooltip>
          )}
        </>
      ) : (
        <span className="text-neutral-350 text-2xl font-medium pt-1.5">*************</span>
      )}
    </span>
  )
}

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
                <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-neutral-350" />
              </span>
            </Tooltip>
          </>
        ),
        enableSorting: true,
        size: 50,
        cell: (info) => {
          const key = info.getValue()
          return <span className="text-sm text-neutral-350">{key}</span>
        },
      }),
      columnHelper.accessor('value', {
        header: 'Value',
        enableSorting: false,
        size: 50,
        cell: (info) => {
          return <VariableValue variable={info.row.original} />
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

  return (
    <div className="border rounded overflow-hidden">
      <Table.Root className={twMerge('w-full text-xs min-w-[800px] table-auto', className)} {...props}>
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
                        .with('asc', () => <Icon className="text-xs" name={IconAwesomeEnum.ARROW_DOWN} />)
                        .with('desc', () => <Icon className="text-xs" name={IconAwesomeEnum.ARROW_UP} />)
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
