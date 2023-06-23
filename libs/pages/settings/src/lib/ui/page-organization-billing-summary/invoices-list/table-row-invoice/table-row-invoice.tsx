import { Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import {
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  IconAwesomeEnum,
  TableFilterProps,
  TableHeadProps,
  TableRow,
  Tag,
  TagSize,
} from '@qovery/shared/ui'
import { costToHuman, dateToFormat } from '@qovery/shared/utils'

export interface TableRowInvoiceProps {
  dataHead: TableHeadProps<Invoice>[]
  data: Invoice
  filter: TableFilterProps[]
  columnsWidth?: string
  isLoading?: boolean
  index?: number
  downloadInvoice?: (invoiceId: string) => void
}

export function TableRowInvoice(props: TableRowInvoiceProps) {
  const { dataHead, columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`, data, filter, downloadInvoice } = props

  const statusBadgeClassNames: Record<InvoiceStatusEnum, string> = {
    [InvoiceStatusEnum.PAID]: 'bg-success-50 text-success-500 border-success-500',
    [InvoiceStatusEnum.NOT_PAID]: 'bg-warning-50 text-warning-500 border-warning-500',
    [InvoiceStatusEnum.PENDING]: 'bg-warning-50 text-warning-500 border-warning-500',
    [InvoiceStatusEnum.POSTED]: 'bg-warning-50 text-warning-500 border-warning-500',
    [InvoiceStatusEnum.UNKNOWN]: 'bg-brand-50 text-brand-500 border-brand-500',
    [InvoiceStatusEnum.PAYMENT_DUE]: 'bg-warning-50 text-warning-500 border-warning-500',
    [InvoiceStatusEnum.VOIDED]: 'bg-brand-50 text-brand-500 border-brand-500',
  }

  return (
    <TableRow
      data={data}
      filter={filter}
      columnsWidth={columnsWidth}
      className={`border-b last-of-type:border-b-0 bg-white`}
    >
      <>
        <div className="px-4 text-xs text-text-500 font-medium">{dateToFormat(data.created_at, 'MMM dd, Y')}</div>
        <div className="px-4 text-xs text-text-500 font-medium">
          <Tag className={`border  ${statusBadgeClassNames[data.status]}`} size={TagSize.SMALL}>
            {data.status.replace('_', ' ')}
          </Tag>
        </div>
        <div className="px-4 text-xs text-text-500 font-medium">
          {costToHuman(data.total_in_cents / 100, data.currency_code)}
        </div>
        <div className="px-4 text-xs text-text-500 font-medium">
          <ButtonIcon
            dataTestId="download-invoice-btn"
            className="bg-transparent !w-9 !h-8"
            iconClassName="text-text-500"
            external
            loading={props.isLoading}
            onClick={() => {
              if (!downloadInvoice) return
              downloadInvoice(data?.id || '')
            }}
            icon={IconAwesomeEnum.DOWNLOAD}
            style={ButtonIconStyle.STROKED}
            size={ButtonSize.SMALL}
          />
        </div>
      </>
    </TableRow>
  )
}

export default TableRowInvoice
