import { getByDisplayValue, getByTestId, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type BillingInfo } from 'qovery-typescript-axios'
import BillingDetails, { type BillingDetailsProps } from './billing-details'

const props: BillingDetailsProps = {
  onSubmit: jest.fn(),
  loadingBillingInfos: false,
  editInProcess: false,
  countryValues: [
    { label: 'France', value: 'FR' },
    { label: 'United States', value: 'US' },
  ],
}

const defaultValues = {
  first_name: 'John',
  last_name: 'Doe',
  company: 'Qovery',
  address: '1 rue de la paix',
  city: 'Paris',
  state: 'Ile de France',
  zip: '75000',
  country_code: 'FR',
  vat_number: 'FR123456789',
  email: 'bdebon@qovery.com',
}

describe('BillingDetails', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfo>(<BillingDetails {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should init the form well', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfo>(<BillingDetails {...props} />, {
        defaultValues,
      })
    )
    getByDisplayValue(baseElement, 'John')
  })

  it('should show form spinner', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfo>(<BillingDetails {...props} loadingBillingInfos={true} />, {
        defaultValues,
      })
    )

    getByTestId(baseElement, 'spinner')
  })

  it('should show button spinner', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfo>(<BillingDetails {...props} editInProcess={true} />, {
        defaultValues,
      })
    )

    getByTestId(baseElement, 'spinner')
  })
})
