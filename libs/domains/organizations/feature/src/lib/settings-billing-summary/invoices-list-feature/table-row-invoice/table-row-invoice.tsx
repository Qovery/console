import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { Badge, Button, Icon, TablePrimitives } from '@qovery/shared/ui'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { costToHuman } from '@qovery/shared/util-js'

const { Table } = TablePrimitives

export interface TableRowInvoiceProps {
  data: Invoice
  isLoading?: boolean
  downloadInvoice?: (invoiceId: string) => void
  columnSizes?: number[]
}

export function TableRowInvoice(props: TableRowInvoiceProps) {
  const { data, downloadInvoice, isLoading, columnSizes = [30, 30, 30, 10] } = props

  const statusLabel = data.status?.replace('_', ' ') ?? ''
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
    <Table.Row>
      <Table.Cell style={{ width: `${columnSizes[0]}%` }} className="text-xs font-medium text-neutral">
        {dateMediumLocalFormat(data.created_at)}
      </Table.Cell>
      <Table.Cell style={{ width: `${columnSizes[1]}%` }} className="text-xs font-medium text-neutral">
        {badge}
      </Table.Cell>
      <Table.Cell style={{ width: `${columnSizes[2]}%` }} className="text-xs font-medium text-neutral">
        {costToHuman(data.total_in_cents / 100, data.currency_code)}
      </Table.Cell>
      <Table.Cell style={{ width: `${columnSizes[3]}%` }} className="text-xs font-medium text-neutral">
        <Button
          data-testid="download-invoice-btn"
          type="button"
          variant="outline"
          iconOnly
          color="neutral"
          size="md"
          loading={isLoading}
          onClick={() => {
            if (!downloadInvoice) return
            downloadInvoice(data?.id || '')
          }}
        >
          <Icon iconName="download" iconStyle="regular" />
        </Button>
      </Table.Cell>
    </Table.Row>
  )
}

export default TableRowInvoice
