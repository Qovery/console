import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { Badge, Button, Icon, type TableFilterProps, type TableHeadProps, TableRow } from '@qovery/shared/ui'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
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
      <Badge color="green" variant="surface">
        {statusLabel}
      </Badge>
    ))
    .with(
      InvoiceStatusEnum.NOT_PAID,
      InvoiceStatusEnum.PENDING,
      InvoiceStatusEnum.POSTED,
      InvoiceStatusEnum.PAYMENT_DUE,
      () => (
        <Badge color="yellow" variant="surface">
          {statusLabel}
        </Badge>
      )
    )
    .with(InvoiceStatusEnum.UNKNOWN, InvoiceStatusEnum.VOIDED, () => (
      <Badge color="brand" variant="surface">
        {statusLabel}
      </Badge>
    ))
    .exhaustive()

  return (
    <TableRow
      data={data}
      filter={filter}
      columnsWidth={columnsWidth}
      className="border-b bg-white last-of-type:border-b-0"
    >
      <>
        <div className="px-4 text-xs font-medium text-neutral-400">{dateMediumLocalFormat(data.created_at)}</div>
        <div className="px-4 text-xs font-medium text-neutral-400">{badge}</div>
        <div className="px-4 text-xs font-medium text-neutral-400">
          {costToHuman(data.total_in_cents / 100, data.currency_code)}
        </div>
        <div className="px-4 text-xs font-medium text-neutral-400">
          <Button
            data-testid="download-invoice-btn"
            type="button"
            variant="outline"
            color="neutral"
            size="md"
            loading={props.isLoading}
            onClick={() => {
              if (!downloadInvoice) return
              downloadInvoice(data?.id || '')
            }}
          >
            <Icon iconName="download" iconStyle="regular" />
          </Button>
        </div>
      </>
    </TableRow>
  )
}

export default TableRowInvoice
