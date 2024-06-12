import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import BillingDetailsFeature from './billing-details-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

const useBillingInfoMockSpy = jest.spyOn(organizationsDomain, 'useBillingInfo') as jest.Mock
const useEditBillingInfoMockSpy = jest.spyOn(organizationsDomain, 'useEditBillingInfo') as jest.Mock

describe('BillingDetailsFeature', () => {
  beforeEach(() => {
    useBillingInfoMockSpy.mockReturnValue({
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
    })
    useEditBillingInfoMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<BillingDetailsFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should fetch the billing info', () => {
    renderWithProviders(<BillingDetailsFeature />)
    expect(useBillingInfoMockSpy).toHaveBeenCalled()
  })

  it('should dispatch the editBillingInfo', async () => {
    const { userEvent } = renderWithProviders(<BillingDetailsFeature />)

    const input = screen.getByLabelText('First name')
    await userEvent.clear(input)
    await userEvent.type(input, 'test')

    const button = screen.getByTestId('submit-button')

    expect(button).toBeEnabled()
    await userEvent.click(button)

    expect(useEditBillingInfoMockSpy().mutateAsync).toHaveBeenCalledWith({
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
