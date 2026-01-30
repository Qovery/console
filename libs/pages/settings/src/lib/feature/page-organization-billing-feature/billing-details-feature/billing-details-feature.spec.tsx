import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type BillingInfoRequest } from 'qovery-typescript-axios'
import BillingDetailsFeature from './billing-details-feature'

const mockOnSubmit = jest.fn()

const defaultBillingValues: BillingInfoRequest = {
  first_name: 'John',
  last_name: 'Doe',
  company: 'Qovery',
  address: '1 rue de la paix',
  city: 'Paris',
  state: 'Ile de France',
  zip: '75000',
  country_code: 'FR',
  vat_number: 'FR123456789',
  email: 'test@qovery.com',
}

const countryValues = [
  { label: 'France', value: 'FR' },
  { label: 'United States', value: 'US' },
]

describe('BillingDetailsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfoRequest>(
        <BillingDetailsFeature
          countryValues={countryValues}
          loadingBillingInfos={false}
          editInProcess={false}
          onSubmit={mockOnSubmit}
        />,
        {
          defaultValues: defaultBillingValues,
        }
      )
    )
    expect(baseElement).toBeTruthy()
  })
})
