import { getByLabelText, getByTestId, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { BillingInfo } from 'qovery-typescript-axios'
import * as storeOrganization from '@qovery/domains/organization'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { act, fireEvent } from '../../../../../../../../__tests__/utils/setup-jest'
import BillingDetailsFeature from './billing-details-feature'

import SpyInstance = jest.SpyInstance

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

const mockOrganization = organizationFactoryMock(1)[0]
mockOrganization.billingInfos = {
  loadingStatus: 'loaded',
  value: {
    city: 'city',
    company: 'company',
    address: 'address',
    state: '',
    zip: 'zip',
    email: 'email',
    first_name: 'first_name',
    vat_number: 'vat_number',
    last_name: 'last_name',
    country_code: 'FR',
  },
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

describe('BillingDetailsFeature', () => {
  beforeEach(() => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve<{ data: BillingInfo }>({
          data: {
            city: 'city',
            company: 'company',
            address: 'address',
            state: '',
            zip: 'zip',
            email: 'email',
            first_name: 'first_name',
            vat_number: 'vat_number',
            last_name: 'last_name',
            country_code: 'FR',
          },
        }),
    }))

    jest.spyOn(storeOrganization, 'selectOrganizationById').mockReturnValue(mockOrganization)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<BillingDetailsFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should fetch the billing info', () => {
    const fetchBillingInfoSpy: SpyInstance = jest.spyOn(storeOrganization, 'fetchBillingInfo')
    jest
      .spyOn(storeOrganization, 'selectOrganizationById')
      .mockReturnValue({ ...mockOrganization, billingInfos: { loadingStatus: undefined } })

    render(<BillingDetailsFeature />)

    expect(fetchBillingInfoSpy).toHaveBeenCalled()
  })

  it('should dispatch the editBillingInfo', async () => {
    const editBillingInfoSpy: SpyInstance = jest.spyOn(storeOrganization, 'editBillingInfo')
    const { baseElement } = render(<BillingDetailsFeature />)

    await act(() => {
      const input = getByLabelText(baseElement, 'First name')
      fireEvent.input(input, { target: { value: 'test' } })
    })

    const button = getByTestId(baseElement, 'submit-button')
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })

    await act(() => {
      button.click()
    })

    await waitFor(() => {
      expect(editBillingInfoSpy).toHaveBeenCalledWith({
        organizationId: '1',
        billingInfoRequest: {
          city: 'city',
          company: 'company',
          address: 'address',
          state: '',
          zip: 'zip',
          email: 'email',
          first_name: 'test',
          vat_number: 'vat_number',
          last_name: 'last_name',
          country_code: 'FR',
        },
      })
    })
  })
})
