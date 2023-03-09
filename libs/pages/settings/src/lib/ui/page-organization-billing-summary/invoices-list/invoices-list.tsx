import { Invoice } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Value } from '@qovery/shared/interfaces'
import {
  Button,
  ButtonStyle,
  IconAwesomeEnum,
  InputSelectSmall,
  LoaderSpinner,
  Table,
  TableFilterProps,
  TableHeadProps,
} from '@qovery/shared/ui'
import { dateToFormat } from '@qovery/shared/utils'
import TableRowInvoice from './table-row-invoice/table-row-invoice'

export interface InvoicesListProps {
  invoices?: Invoice[]
  invoicesLoading?: boolean
  downloadAll?: () => void
  downloadLoading?: boolean
  downloadOne?: (invoiceId: string) => void
  yearsForSorting?: Value[]
  onFilterByYear?: (year?: string) => void
}

export function InvoicesList(props: InvoicesListProps) {
  const dataHead: TableHeadProps<Invoice>[] = [
    {
      title: 'Date',
      filter: [
        {
          title: 'Filter by date',
          key: 'created_at',
          itemContentCustom: (item) => (
            <span className="text-text-500 text-sm font-medium">{dateToFormat(item.created_at, 'MMM dd, Y')}</span>
          ),
        },
      ],
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
            className="w-[200px] relative z-[1000]"
            onChange={(value) => {
              props.onFilterByYear && props.onFilterByYear(value)
            }}
          />
          <Button
            style={ButtonStyle.STROKED}
            dataTestId="download-all-btn"
            iconRight={IconAwesomeEnum.DOWNLOAD}
            loading={props.downloadLoading}
            onClick={props.downloadAll}
          >
            Download all
          </Button>
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
              isLoading={props.invoicesLoading}
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
