import { getByTestId, getByText, render } from '__tests__/utils/setup-jest'
import { InvoiceStatusEnum } from 'qovery-typescript-axios'
import { dateToFormat } from '@qovery/shared/util-dates'
import { TableRowInvoice, type TableRowInvoiceProps } from './table-row-invoice'

let props: TableRowInvoiceProps

beforeEach(() => {
  props = {
    downloadInvoice: jest.fn(),
    data: {
      status: InvoiceStatusEnum.UNKNOWN,
      currency_code: 'EUR',
      created_at: '2021-01-01T00:00:00.000Z',
      id: '22',
      total: 100,
      total_in_cents: 10000,
    },
    filter: [],
    dataHead: [
      {
        title: 'Date',
        filter: [
          {
            title: 'Filter by date',
            key: 'created_at',
            itemContentCustom: (item) => (
              <span className="text-sm font-medium text-neutral-400">{dateToFormat(item.created_at, 'MMM dd, Y')}</span>
            ),
          },
        ],
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
    ],
  }
})

describe('TableRowDeployment', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowInvoice {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the different cells correctly', () => {
    const { baseElement } = render(<TableRowInvoice {...props} />)

    getByText(baseElement, 'Jan 1, 2021')
    getByText(baseElement, 'UNKNOWN')
    getByText(baseElement, '€100')
    getByTestId(baseElement, 'download-invoice-btn')
  })

  it('should call the downloadInvoice function when clicking on the download button', () => {
    const { baseElement } = render(<TableRowInvoice {...props} />)
    const button = getByTestId(baseElement, 'download-invoice-btn')
    button.click()
    expect(props.downloadInvoice).toHaveBeenCalled()
  })
})
