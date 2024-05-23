import { type Invoice } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type Value } from '@qovery/shared/interfaces'
import { InputSelectSmall, LoaderSpinner, Table, type TableFilterProps, type TableHeadProps } from '@qovery/shared/ui'
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
        <h1 className="h5 mb-2 text-neutral-400">Invoices</h1>
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
        className="overflow-hidden rounded border border-neutral-200"
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

export default InvoicesList
