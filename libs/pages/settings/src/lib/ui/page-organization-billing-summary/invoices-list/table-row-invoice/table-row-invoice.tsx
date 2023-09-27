import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import {
  Badge,
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacySize,
  IconAwesomeEnum,
  type TableFilterProps,
  type TableHeadProps,
  TableRow,
} from '@qovery/shared/ui'
import { dateToFormat } from '@qovery/shared/util-dates'
import { costToHuman } from '@qovery/shared/util-js'

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

  const statusLabel = data.status.replace('_', ' ')
  const badge = match(data.status)
    .with(InvoiceStatusEnum.PAID, () => (
      <Badge color="green" variant="surface" size="xs">
        {statusLabel}
      </Badge>
    ))
    .with(
      InvoiceStatusEnum.NOT_PAID,
      InvoiceStatusEnum.PENDING,
      InvoiceStatusEnum.POSTED,
      InvoiceStatusEnum.PAYMENT_DUE,
      () => (
        <Badge color="yellow" variant="surface" size="xs">
          {statusLabel}
        </Badge>
      )
    )
    .with(InvoiceStatusEnum.UNKNOWN, InvoiceStatusEnum.VOIDED, () => (
      <Badge color="brand" variant="surface" size="xs">
        {statusLabel}
      </Badge>
    ))
    .exhaustive()

  return (
    <TableRow
      data={data}
      filter={filter}
      columnsWidth={columnsWidth}
      className="border-b last-of-type:border-b-0 bg-white"
    >
      <>
        <div className="px-4 text-xs text-neutral-400 font-medium">{dateToFormat(data.created_at, 'MMM dd, Y')}</div>
        <div className="px-4 text-xs text-neutral-400 font-medium">{badge}</div>
        <div className="px-4 text-xs text-neutral-400 font-medium">
          {costToHuman(data.total_in_cents / 100, data.currency_code)}
        </div>
        <div className="px-4 text-xs text-neutral-400 font-medium">
          <ButtonIcon
            dataTestId="download-invoice-btn"
            className="bg-transparent !w-9 !h-8"
            iconClassName="text-neutral-400"
            external
            loading={props.isLoading}
            onClick={() => {
              if (!downloadInvoice) return
              downloadInvoice(data?.id || '')
            }}
            icon={IconAwesomeEnum.DOWNLOAD}
            style={ButtonIconStyle.STROKED}
            size={ButtonLegacySize.SMALL}
          />
        </div>
      </>
    </TableRow>
  )
}

export default TableRowInvoice
