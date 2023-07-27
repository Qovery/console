import { act, getAllByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import * as storeOrganization from '@qovery/domains/organization'
import { organizationFactoryMock } from '@qovery/shared/factories'
import InvoicesListFeature, { getListOfYears } from './invoices-list-feature'

import SpyInstance = jest.SpyInstance

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({ organizationId: '1' }),
}))

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

const mockOrganization = organizationFactoryMock(1)[0]
mockOrganization.invoices = {
  loadingStatus: 'loaded',
  items: invoices,
}

jest.mock('@qovery/domains/organization', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  selectOrganizationById: () => mockOrganization,
}))

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('InvoicesListFeature', () => {
  beforeEach(() => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.resolve({ url: 'url' }),
    }))

    mockOrganization.invoices = {
      loadingStatus: 'not loaded',
      items: invoices,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<InvoicesListFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch fetchInvoices', () => {
    const fetchBillingInfoSpy: SpyInstance = jest.spyOn(storeOrganization, 'fetchInvoices')
    mockOrganization.invoices = {
      loadingStatus: undefined,
      items: invoices,
    }

    render(<InvoicesListFeature />)
    expect(fetchBillingInfoSpy).toHaveBeenCalledWith({
      organizationId: '1',
    })
  })

  it('should dispatch downloadOne', async () => {
    const spy: SpyInstance = jest.spyOn(storeOrganization, 'fetchInvoiceUrl')
    mockOrganization.invoices = {
      loadingStatus: 'loaded',
      items: invoices,
    }
    jest.spyOn(storeOrganization, 'selectOrganizationById').mockReturnValue(mockOrganization)
    window.open = jest.fn((url: string, target: string) => ({}))
    const { baseElement } = render(<InvoicesListFeature />)
    const button = getAllByTestId(baseElement, 'download-invoice-btn')[0]

    await act(() => {
      button.click()
    })

    expect(spy).toHaveBeenCalledWith({ organizationId: '1', invoiceId: '1' })
  })
})

describe('getListOfYears', () => {
  it('should return an array of years', () => {
    const result = getListOfYears(invoices)
    expect(result).toEqual([2023, 2021, 2020, 2018])
  })
})
