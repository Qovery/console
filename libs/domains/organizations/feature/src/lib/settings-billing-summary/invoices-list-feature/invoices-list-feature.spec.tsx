import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import * as iamFeature from '@qovery/shared/iam/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as invoiceUrlHooks from '../../hooks/use-invoice-url/use-invoice-url'
import * as invoiceHooks from '../../hooks/use-invoices/use-invoices'
import InvoicesListFeature, { InvoicesList, type InvoicesListProps, getListOfYears } from './invoices-list-feature'

const useInvoicesSpy = jest.spyOn(invoiceHooks, 'useInvoices')
const useInvoiceUrlSpy = jest.spyOn(invoiceUrlHooks, 'useInvoiceUrl')

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '1' }),
  useNavigate: () => jest.fn(),
}))

let mockRetryPaymentFlag = false
jest.mock('posthog-js/react', () => ({
  ...jest.requireActual('posthog-js/react'),
  useFeatureFlagEnabled: (flag: string) => (flag === 'billing-retry-payment' ? mockRetryPaymentFlag : false),
}))

const useCanManageBillingSpy = jest.spyOn(iamFeature, 'useCanManageBilling')

beforeEach(() => {
  mockRetryPaymentFlag = false
  useCanManageBillingSpy.mockReturnValue({ canManageBilling: false, loading: false })
})

const invoicesMock: Invoice[] = [
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
  {
    status: InvoiceStatusEnum.UNKNOWN,
    currency_code: 'EUR',
    created_at: '2020-01-01T00:00:00.000Z',
    id: '3',
    total: 100,
    total_in_cents: 10000,
  },
  {
    status: InvoiceStatusEnum.UNKNOWN,
    currency_code: 'EUR',
    created_at: '2023-01-01T00:00:00.000Z',
    id: '4',
    total: 100,
    total_in_cents: 10000,
  },
]

const listProps: InvoicesListProps = {
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
  invoices: invoicesMock.slice(0, 3),
  downloadOne: jest.fn(),
}

describe('InvoicesList', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<InvoicesList {...listProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should print three rows', () => {
    renderWithProviders(<InvoicesList {...listProps} />)
    expect(screen.getAllByTestId('download-invoice-btn')).toHaveLength(3)
  })

  it('should have two options in years', () => {
    renderWithProviders(<InvoicesList {...listProps} />)
    screen.getByRole('option', { name: '2021' })
    screen.getByRole('option', { name: '2018' })
  })

  it('should call onFilterByYear on select change', async () => {
    const { userEvent } = renderWithProviders(<InvoicesList {...listProps} />)
    const select = screen.getByTestId('year-select')

    await userEvent.selectOptions(select, '2018')

    expect(listProps.onFilterByYear).toHaveBeenCalledWith('2018')
  })

  it('should download every listed invoice', async () => {
    const onDownloadAll = jest.fn()
    const { userEvent } = renderWithProviders(<InvoicesList {...listProps} onDownloadAll={onDownloadAll} />)

    await userEvent.click(screen.getByRole('button', { name: /Download 3 invoices/ }))

    expect(onDownloadAll).toHaveBeenCalledWith(invoicesMock.slice(0, 3))
  })

  it('should not show the download all button without a handler', () => {
    renderWithProviders(<InvoicesList {...listProps} />)
    expect(screen.queryByTestId('download-all-invoices-btn')).not.toBeInTheDocument()
  })

  it('should show progress and allow cancelling a bulk download', async () => {
    const onCancelDownloadAll = jest.fn()
    const { userEvent } = renderWithProviders(
      <InvoicesList
        {...listProps}
        onDownloadAll={jest.fn()}
        onCancelDownloadAll={onCancelDownloadAll}
        downloadAllProgress={{ total: 3, completed: 1, failed: 0 }}
      />
    )

    expect(screen.getByText('Downloading 2 of 3')).toBeInTheDocument()
    expect(screen.queryByTestId('download-all-invoices-btn')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancelDownloadAll).toHaveBeenCalled()
  })

  it('should render empty state when there are no invoices', () => {
    renderWithProviders(<InvoicesList invoices={[]} />)
    screen.getByText("You don't have any invoices yet.")
  })
})

describe('InvoicesListFeature', () => {
  const mutateAsyncMock = jest.fn()

  beforeEach(() => {
    mutateAsyncMock.mockReset()
    useInvoicesSpy.mockReturnValue({
      data: invoicesMock,
    })
    useInvoiceUrlSpy.mockReturnValue({
      mutateAsync: mutateAsyncMock,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<InvoicesListFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch fetchInvoices', () => {
    renderWithProviders(<InvoicesListFeature />)
    expect(useInvoicesSpy).toHaveBeenCalledWith({
      organizationId: '1',
      suspense: true,
    })
  })

  it('should download invoice', async () => {
    const linkClickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    const { userEvent } = renderWithProviders(<InvoicesListFeature />)
    const button = screen.getAllByTestId('download-invoice-btn')[0]

    await userEvent.click(button)

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({ organizationId: '1', invoiceId: '1' })
    })

    linkClickSpy.mockRestore()
  })
})

describe('InvoicesListFeature payment button', () => {
  const unpaidInvoices: Invoice[] = [
    { ...invoicesMock[0], id: 'due', status: InvoiceStatusEnum.PAYMENT_DUE },
    { ...invoicesMock[1], id: 'not-paid', status: InvoiceStatusEnum.NOT_PAID },
    { ...invoicesMock[2], id: 'paid', status: InvoiceStatusEnum.PAID },
  ]

  beforeEach(() => {
    mockRetryPaymentFlag = true
    useCanManageBillingSpy.mockReturnValue({ canManageBilling: true, loading: false })
    useInvoicesSpy.mockReturnValue({ data: unpaidInvoices } as ReturnType<typeof invoiceHooks.useInvoices>)
    useInvoiceUrlSpy.mockReturnValue({ mutateAsync: jest.fn() } as unknown as ReturnType<
      typeof invoiceUrlHooks.useInvoiceUrl
    >)
  })

  it('shows a payment button on payment due and unpaid invoices only', () => {
    renderWithProviders(<InvoicesListFeature />)

    expect(screen.getByRole('button', { name: 'Pay now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry payment' })).toBeInTheDocument()
    expect(screen.getAllByTestId('retry-invoice-payment-btn')).toHaveLength(2)
  })

  it('hides the payment button while the flag is off', () => {
    mockRetryPaymentFlag = false
    renderWithProviders(<InvoicesListFeature />)

    expect(screen.queryByTestId('retry-invoice-payment-btn')).not.toBeInTheDocument()
  })

  it('hides the payment button for members without billing access', () => {
    useCanManageBillingSpy.mockReturnValue({ canManageBilling: false, loading: false })
    renderWithProviders(<InvoicesListFeature />)

    expect(screen.queryByTestId('retry-invoice-payment-btn')).not.toBeInTheDocument()
  })
})

describe('getListOfYears', () => {
  it('should return an array of years', () => {
    const result = getListOfYears(invoicesMock)
    expect(result).toEqual([2023, 2021, 2020, 2018])
  })
})
