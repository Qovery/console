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
    { label: 'Japan', value: 'JP' },
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

  it('should show "VAT number" label for EU country', () => {
    const { getByText, queryByText } = render(
      wrapWithReactHookForm<BillingInfo>(<BillingDetails {...props} />, {
        defaultValues: { ...defaultValues, country_code: 'FR' },
      })
    )
    expect(getByText('VAT number')).toBeTruthy()
    expect(queryByText('VAT number (optional)')).toBeNull()
  })

  it('should show "EIN (optional)" label for US', () => {
    const { getByText } = render(
      wrapWithReactHookForm<BillingInfo>(<BillingDetails {...props} />, {
        defaultValues: { ...defaultValues, country_code: 'US' },
      })
    )
    expect(getByText('EIN (optional)')).toBeTruthy()
  })

  it('should show "VAT number (optional)" label for non-EU, non-US country', () => {
    const { getByText } = render(
      wrapWithReactHookForm<BillingInfo>(<BillingDetails {...props} />, {
        defaultValues: { ...defaultValues, country_code: 'JP' },
      })
    )
    expect(getByText('VAT number (optional)')).toBeTruthy()
  })
})
