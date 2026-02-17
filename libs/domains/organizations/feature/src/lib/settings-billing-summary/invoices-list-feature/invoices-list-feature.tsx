import { useParams } from '@tanstack/react-router'
import { type Invoice } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type Value } from '@qovery/shared/interfaces'
import { InputSelectSmall, LoaderSpinner, Table, type TableFilterProps, type TableHeadProps } from '@qovery/shared/ui'
import { useInvoiceUrl } from '../../hooks/use-invoice-url/use-invoice-url'
import { useInvoices } from '../../hooks/use-invoices/use-invoices'
import TableRowInvoice from './table-row-invoice/table-row-invoice'

export interface InvoicesListProps {
  invoices?: Invoice[]
  invoicesLoading?: boolean
  downloadOne?: (invoiceId: string) => void
  yearsForSorting?: Value[]
  onFilterByYear?: (year?: string) => void
  idOfInvoiceToDownload?: string
}

export function InvoicesList(props: InvoicesListProps) {
  const dataHead: TableHeadProps<Invoice>[] = [
    {
      title: 'Date',
    },
    {
      title: 'Status',
      filter: [
        {
          title: 'Filter by status',
          key: 'status',
        },
      ],
    },
    {
      title: 'Charge',
    },
  ]
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const columnWidth = '30% 30% 30% 10%'

  return (
    <div className="mb-3">
      <div className="mb-3 flex items-center justify-between py-5 ">
        <h1 className="h5 mb-2 text-neutral">Invoices</h1>
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
      </div>
      <Table
        dataHead={dataHead}
        data={props.invoices}
        columnsWidth={columnWidth}
        setFilter={setFilter}
        filter={filter}
        className="overflow-hidden rounded border border-neutral"
      >
        <div>
          {props.invoicesLoading && (
            <div className="flex w-full justify-center py-5">
              <LoaderSpinner />
            </div>
          )}

          {props.invoices?.map((invoice, index) => (
            <TableRowInvoice
              key={index}
              filter={filter}
              data={invoice}
              index={index}
              dataHead={dataHead}
              isLoading={props.idOfInvoiceToDownload === invoice.id}
              columnsWidth={columnWidth}
              downloadInvoice={props.downloadOne}
            />
          ))}
        </div>
      </Table>
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
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const { data: dataInvoices = [], isLoading: isLoadingDataInvoices } = useInvoices({ organizationId })
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
    if (dataInvoices.length > 0) {
      setInvoices(dataInvoices)
      const years = getListOfYears(dataInvoices)
      setYearsFilterOptions([
        { label: 'All', value: '' },
        ...years.map((year) => ({ label: `${year}`, value: `${year}` })),
      ])
    }
  }, [dataInvoices])

  const filterByYear = (year?: string) => {
    if (invoices.length > 0) {
      if (!year) return setInvoices(dataInvoices)

      const filteredInvoices = dataInvoices.filter((invoice) => {
        const invoiceYear = new Date(invoice.created_at).getFullYear()
        return invoiceYear === parseInt(year, 10)
      })
      setInvoices(filteredInvoices)
    }
  }

  return (
    <InvoicesList
      invoices={invoices}
      invoicesLoading={isLoadingDataInvoices}
      downloadOne={downloadOne}
      yearsForSorting={yearsFilterOptions}
      onFilterByYear={filterByYear}
      idOfInvoiceToDownload={idOfInvoiceToDownload}
    />
  )
}

export default InvoicesListFeature
