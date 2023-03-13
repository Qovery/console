import { Invoice } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Value } from '@qovery/shared/interfaces'
import { InputSelectSmall, LoaderSpinner, Table, TableFilterProps, TableHeadProps } from '@qovery/shared/ui'
import TableRowInvoice from './table-row-invoice/table-row-invoice'

export interface InvoicesListProps {
  invoices?: Invoice[]
  invoicesLoading?: boolean
  downloadOne?: (invoiceId: string) => void
  yearsForSorting?: Value[]
  onFilterByYear?: (year?: string) => void
  idOfInvoiceToDownload?: string | undefined
}

export function InvoicesList(props: InvoicesListProps) {
  const dataHead: TableHeadProps<Invoice>[] = [
    {
      title: 'Date',
    },
    {
      title: 'Plan',
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
  const [filter, setFilter] = useState<TableFilterProps>({})
  const columnWidth = '30% 20% 20% 20% 10%'

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-3 py-5 ">
        <h1 className="h5 text-text-700 mb-2">Invoices</h1>
        <div className="flex gap-3">
          <InputSelectSmall
            dataTestId="year-select"
            items={props.yearsForSorting || []}
            name="year"
            inputClassName="h-9 !py-[0.4rem]"
            className="w-[200px] relative z-50"
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
        className="border border-element-light-lighter-400 rounded overflow-hidden"
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
