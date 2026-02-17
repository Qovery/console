import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import { TablePrimitives } from '@qovery/shared/ui'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { costToHuman } from '@qovery/shared/util-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { TableRowInvoice, type TableRowInvoiceProps } from './table-row-invoice'

let props: TableRowInvoiceProps

const { Table } = TablePrimitives

const renderRow = (rowProps: TableRowInvoiceProps) =>
  renderWithProviders(
    <Table.Root>
      <Table.Body>
        <TableRowInvoice {...rowProps} />
      </Table.Body>
    </Table.Root>
  )

const invoice: Invoice = {
  status: InvoiceStatusEnum.UNKNOWN,
  currency_code: 'EUR',
  created_at: '2021-01-01T00:00:00.000Z',
  id: '22',
  total: 100,
  total_in_cents: 10000,
}

beforeEach(() => {
  props = {
    downloadInvoice: jest.fn(),
    data: invoice,
  }
})

describe('TableRowInvoice', () => {
  it('should render successfully', () => {
    const { baseElement } = renderRow(props)
    expect(baseElement).toBeTruthy()
  })

  it('should render the different cells correctly', () => {
    renderRow(props)

    screen.getByText(dateMediumLocalFormat(invoice.created_at))
    screen.getByText(String(invoice.status).replace('_', ' '))
    screen.getByText(costToHuman(invoice.total_in_cents / 100, invoice.currency_code))
    screen.getByTestId('download-invoice-btn')
  })

  it('should call the downloadInvoice function when clicking on the download button', async () => {
    const { userEvent } = renderRow(props)
    const button = screen.getByTestId('download-invoice-btn')

    await userEvent.click(button)

    expect(props.downloadInvoice).toHaveBeenCalledWith(invoice.id)
  })
})
