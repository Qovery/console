import { act, fireEvent, getAllByTestId, getByRole, getByTestId, render } from '__tests__/utils/setup-jest'
import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import InvoicesList, { type InvoicesListProps } from './invoices-list'

const invoices: Invoice[] = [
  {
    status: InvoiceStatusEnum.UNKNOWN,
    currency_code: 'EUR',
    created_at: '2018-01-01T00:00:00.000Z',
    id: '1',
    total: 100,
    total_in_cents: 10000,
  },
  {
    status: InvoiceStatusEnum.UNKNOWN,
    currency_code: 'EUR',
    created_at: '2021-01-01T00:00:00.000Z',
    id: '2',
    total: 100,
    total_in_cents: 10000,
  },
  {
    status: InvoiceStatusEnum.UNKNOWN,
    currency_code: 'EUR',
    created_at: '2021-01-01T00:00:00.000Z',
    id: '22',
    total: 100,
    total_in_cents: 10000,
  },
]

const props: InvoicesListProps = {
  onFilterByYear: jest.fn(),
  yearsForSorting: [
    {
      label: '2021',
      value: '2021',
    },
    {
      label: '2018',
      value: '2018',
    },
  ],
  invoicesLoading: false,
  invoices: invoices,
  downloadOne: jest.fn(),
}

describe('InvoicesList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InvoicesList {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should print three rows', () => {
    const { baseElement } = render(<InvoicesList {...props} />)
    expect(getAllByTestId(baseElement, 'download-invoice-btn')).toHaveLength(3)
  })

  it('should have two options in years', () => {
    const { baseElement } = render(<InvoicesList {...props} />)
    getByRole(baseElement, 'option', { name: '2021' })
    getByRole(baseElement, 'option', { name: '2018' })
  })

  it('should call onFilterByYear on select change', async () => {
    const { baseElement } = render(<InvoicesList {...props} />)
    const select = getByTestId(baseElement, 'year-select')

    await act(() => {
      fireEvent.change(select, { target: { value: '2018' } })
    })

    expect(props.onFilterByYear).toHaveBeenCalledWith('2018')
  })

  it('should display one spinner', async () => {
    const { baseElement } = render(<InvoicesList {...props} invoicesLoading={true} />)
    getByTestId(baseElement, 'spinner')
  })
})
