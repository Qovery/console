import { useParams } from '@tanstack/react-router'
import {
  type FilterFn,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type Invoice } from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { type Value } from '@qovery/shared/interfaces'
import { Icon, InputSelectSmall, TableFilter, TablePrimitives } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useInvoiceUrl } from '../../hooks/use-invoice-url/use-invoice-url'
import { useInvoices } from '../../hooks/use-invoices/use-invoices'
import TableRowInvoice from './table-row-invoice/table-row-invoice'

const { Table } = TablePrimitives
const COLUMN_SIZES = [30, 30, 30, 10]
const columnHelper = createColumnHelper<Invoice>()
const formatStatusLabel = (status: string) => upperCaseFirstLetter(status.toLowerCase()).replace(/_/g, ' ')

const statusFilter: FilterFn<Invoice> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true
  return filterValue.includes(row.getValue<string>(columnId))
}

statusFilter.autoRemove = (value) => !value?.length

export interface InvoicesListProps {
  invoices?: Invoice[]
  downloadOne?: (invoiceId: string) => void
  yearsForSorting?: Value[]
  onFilterByYear?: (year?: string) => void
  idOfInvoiceToDownload?: string
}

export function InvoicesList(props: InvoicesListProps) {
  const hasInvoices = (props.invoices?.length ?? 0) > 0
  const columns = useMemo(
    () => [
      columnHelper.accessor('created_at', {
        header: 'Date',
        enableColumnFilter: false,
        size: COLUMN_SIZES[0],
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        enableColumnFilter: true,
        filterFn: statusFilter,
        size: COLUMN_SIZES[1],
        meta: {
          customFacetEntry({ value, count }) {
            return (
              <>
                <span className="text-sm font-medium">{formatStatusLabel(String(value))}</span>
                <span className="text-xs text-neutral-subtle">{count}</span>
              </>
            )
          },
          customFilterValue({ filterValue }) {
            const values = Array.isArray(filterValue) ? filterValue : []
            return values.length ? values.map((value) => formatStatusLabel(String(value))).join(', ') : 'Status'
          },
        },
      }),
      columnHelper.accessor('total_in_cents', {
        header: 'Charge',
        enableColumnFilter: false,
        size: COLUMN_SIZES[2],
      }),
      columnHelper.display({
        id: 'download',
        header: '',
        enableColumnFilter: false,
        size: COLUMN_SIZES[3],
      }),
    ],
    []
  )

  const table = useReactTable({
    data: props.invoices ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
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

  return (
    <div className="mb-3">
      <div className="mb-4 mt-7 flex items-center justify-between">
        <h1 className="text-base font-medium text-neutral">Invoices</h1>
        {hasInvoices ? (
          <div className="flex gap-3">
            <InputSelectSmall
              dataTestId="year-select"
              items={props.yearsForSorting || []}
              name="year"
              inputClassName="h-9 !py-[0.4rem]"
              className="w-[200px]"
              onChange={(value) => {
                props.onFilterByYear && props.onFilterByYear(value)
              }}
            />
          </div>
        ) : null}
      </div>
      {hasInvoices ? (
        <Table.Root className="w-full text-xs">
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeaderCell
                    key={header.id}
                    className="font-medium text-neutral-subtle"
                    style={{ width: `${header.getSize()}%` }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanFilter() ? (
                      <TableFilter column={header.column} />
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
              <TableRowInvoice
                key={row.id}
                data={row.original}
                isLoading={props.idOfInvoiceToDownload === row.original.id}
                downloadInvoice={props.downloadOne}
                columnSizes={COLUMN_SIZES}
              />
            ))}
          </Table.Body>
        </Table.Root>
      ) : (
        <div className="my-4 rounded border border-neutral bg-surface-neutral-subtle p-5 text-center">
          <Icon iconName="wave-pulse" className="text-neutral-subtle" />
          <p className="mt-1 text-xs font-medium text-neutral-subtle">You don't have any invoices yet.</p>
        </div>
      )}
    </div>
  )
}

export const getListOfYears = (invoices: Invoice[]) => {
  const years = invoices.map((invoice) => new Date(invoice.created_at).getFullYear())
  return [...new Set(years)].sort((a, b) => b - a)
}

export function InvoicesListFeature() {
  const { organizationId = '' } = useParams({ strict: false })
  const [yearsFilterOptions, setYearsFilterOptions] = useState<Value[]>([])
  const [idOfInvoiceToDownload, setIdOfInvoiceToDownload] = useState<string | undefined>(undefined)
  const { data: dataInvoices = [] } = useInvoices({ organizationId, suspense: true })
  const [invoices, setInvoices] = useState<Invoice[]>(dataInvoices)
  const { mutateAsync: mutateAsyncInvoice } = useInvoiceUrl()

  const downloadOne = async (invoiceId: string) => {
    if (organizationId && invoiceId) {
      setIdOfInvoiceToDownload(invoiceId)

      try {
        const invoiceUrl = await mutateAsyncInvoice({ organizationId, invoiceId })
        if (invoiceUrl?.url) {
          const link = document.createElement('a')
          link.href = invoiceUrl.url
          link.download = invoiceUrl.url.substring(invoiceUrl.url.lastIndexOf('/') + 1)
          link.click()
          setIdOfInvoiceToDownload(undefined)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    setInvoices(dataInvoices)
    const years = getListOfYears(dataInvoices)
    setYearsFilterOptions([
      { label: 'All', value: '' },
      ...years.map((year) => ({ label: `${year}`, value: `${year}` })),
    ])
  }, [dataInvoices])

  const filterByYear = (year?: string) => {
    if (!year) {
      setInvoices(dataInvoices)
      return
    }

    const filteredInvoices = dataInvoices.filter((invoice) => {
      const invoiceYear = new Date(invoice.created_at).getFullYear()
      return invoiceYear === parseInt(year, 10)
    })
    setInvoices(filteredInvoices)
  }

  return (
    <InvoicesList
      invoices={invoices}
      downloadOne={downloadOne}
      yearsForSorting={yearsFilterOptions}
      onFilterByYear={filterByYear}
      idOfInvoiceToDownload={idOfInvoiceToDownload}
    />
  )
}

export default InvoicesListFeature
