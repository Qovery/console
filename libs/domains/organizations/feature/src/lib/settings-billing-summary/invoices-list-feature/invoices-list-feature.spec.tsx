import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import InvoicesListFeature, { getListOfYears } from './invoices-list-feature'

import SpyInstance = jest.SpyInstance

const useInvoicesSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useInvoices')
const useInvoiceUrlSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useInvoiceUrl')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

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

describe('InvoicesListFeature', () => {
  beforeEach(() => {
    useInvoicesSpy.mockReturnValue({
      data: invoicesMock,
    })
    useInvoiceUrlSpy.mockReturnValue({
      mutateAsync: jest.fn(),
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
    })
  })

  it('should download invoice', async () => {
    window.open = jest.fn((url: string, target: string) => ({}))
    const { userEvent } = renderWithProviders(<InvoicesListFeature />)
    const button = screen.getAllByTestId('download-invoice-btn')[0]

    await userEvent.click(button)

    expect(useInvoiceUrlSpy().mutateAsync).toHaveBeenCalledWith({ organizationId: '1', invoiceId: '1' })
  })
})

describe('getListOfYears', () => {
  it('should return an array of years', () => {
    const result = getListOfYears(invoicesMock)
    expect(result).toEqual([2023, 2021, 2020, 2018])
  })
})
