import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type BillingInfoRequest } from 'qovery-typescript-axios'
import BillingDetails, { type BillingDetailsProps } from './billing-details'

const props: BillingDetailsProps = {
  onSubmit: jest.fn(),
  editInProcess: false,
  countryValues: [
    { label: 'France', value: 'FR' },
    { label: 'United States', value: 'US' },
  ],
}

const defaultValues: BillingInfoRequest = {
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
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<BillingInfoRequest>(<BillingDetails {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should init the form well', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<BillingInfoRequest>(<BillingDetails {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
  })

  it('should show button spinner', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<BillingInfoRequest>(<BillingDetails {...props} editInProcess={true} />, {
        defaultValues,
      })
    )

    expect(baseElement).toBeTruthy()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })
})
