import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type BillingInfoRequest } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import BillingDetails, { type BillingDetailsProps } from './billing-details'

const props: BillingDetailsProps = {
  onSubmit: jest.fn(),
  editInProcess: false,
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

  it('should require a VAT number for an EU country', () => {
    renderWithProviders(
      wrapWithReactHookForm<BillingInfoRequest>(<BillingDetails {...props} />, {
        defaultValues: { ...defaultValues, country_code: 'FR' },
      })
    )
    expect(screen.getByText('VAT number')).toBeInTheDocument()
    expect(screen.queryByText('VAT number (optional)')).not.toBeInTheDocument()
  })

  it('should make the VAT number optional for a non-EU country', () => {
    renderWithProviders(
      wrapWithReactHookForm<BillingInfoRequest>(<BillingDetails {...props} />, {
        defaultValues: { ...defaultValues, country_code: 'US' },
      })
    )
    expect(screen.getByText('VAT number (optional)')).toBeInTheDocument()
  })

  it('should update the VAT requirement when the country changes', async () => {
    renderWithProviders(
      wrapWithReactHookForm<BillingInfoRequest>(<BillingDetails {...props} />, {
        defaultValues: { ...defaultValues, country_code: 'JP' },
      })
    )

    expect(screen.getByText('VAT number (optional)')).toBeInTheDocument()

    await selectEvent.select(screen.getByLabelText('Country'), 'France')

    expect(screen.getByText('VAT number')).toBeInTheDocument()
    expect(screen.queryByText('VAT number (optional)')).not.toBeInTheDocument()
  })
})
