import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type BillingInfoRequest } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import BillingDetails, { type BillingDetailsProps } from './billing-details'

const props: BillingDetailsProps = {
  onSubmit: jest.fn(),
  editInProcess: false,
  countryValues: [
    { label: 'France', value: 'FR' },
    { label: 'United States', value: 'US' },
    { label: 'Japan', value: 'JP' },
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

  it('should show "VAT number" label for EU country', () => {
    const { getByText, queryByText } = renderWithProviders(
      wrapWithReactHookForm<BillingInfoRequest>(<BillingDetails {...props} />, {
        defaultValues: { ...defaultValues, country_code: 'FR' },
      })
    )
    expect(getByText('VAT number')).toBeInTheDocument()
    expect(queryByText('VAT number (optional)')).not.toBeInTheDocument()
  })

  it('should show "VAT number" label for US', () => {
    const { getByText, queryByText } = renderWithProviders(
      wrapWithReactHookForm<BillingInfoRequest>(<BillingDetails {...props} />, {
        defaultValues: { ...defaultValues, country_code: 'US' },
      })
    )
    expect(getByText('VAT number')).toBeInTheDocument()
    expect(queryByText('EIN (optional)')).not.toBeInTheDocument()
  })

  it('should show "VAT number" label for non-EU, non-US country', () => {
    const { getByText, queryByText } = renderWithProviders(
      wrapWithReactHookForm<BillingInfoRequest>(<BillingDetails {...props} />, {
        defaultValues: { ...defaultValues, country_code: 'JP' },
      })
    )
    expect(getByText('VAT number')).toBeInTheDocument()
    expect(queryByText('VAT number (optional)')).not.toBeInTheDocument()
  })
})
