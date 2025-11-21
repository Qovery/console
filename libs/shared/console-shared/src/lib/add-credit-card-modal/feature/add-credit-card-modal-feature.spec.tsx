import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as chargebeeUtils from '../../chargebee/chargebee-utils'
import AddCreditCardModalFeature, { type AddCreditCardModalFeatureProps } from './add-credit-card-modal-feature'

import SpyInstance = jest.SpyInstance

const useAddCreditCardSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useAddCreditCard')
const loadChargebeeSpy: SpyInstance = jest.spyOn(chargebeeUtils, 'loadChargebee')

const props: AddCreditCardModalFeatureProps = {
  organizationId: '1',
}

// Mock Chargebee React wrapper
jest.mock('@chargebee/chargebee-js-react-wrapper', () => ({
  Provider: ({ children }: any) => children,
  CardComponent: ({ onReady, children }: any) => {
    // Simulate ready event
    setTimeout(() => onReady?.(), 0)
    return <div data-testid="chargebee-card-component">{children}</div>
  },
  CardNumber: () => <div data-testid="card-number-field" />,
  CardExpiry: () => <div data-testid="card-expiry-field" />,
  CardCVV: () => <div data-testid="card-cvv-field" />,
}))

describe('AddCreditCardModalFeature', () => {
  let mockChargebeeInstance: any

  beforeEach(() => {
    useAddCreditCardSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })

    // Mock Chargebee instance
    mockChargebeeInstance = {
      load: jest.fn().mockResolvedValue(undefined),
    }

    loadChargebeeSpy.mockResolvedValue(mockChargebeeInstance)
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<AddCreditCardModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should initialize Chargebee and show loading state', async () => {
    renderWithProviders(<AddCreditCardModalFeature organizationId="1" />)

    // Wait for Chargebee to load
    await waitFor(() => {
      expect(loadChargebeeSpy).toHaveBeenCalled()
    })

    // Check that submit button is initially disabled (loading state)
    const button = screen.getByTestId('submit-button')
    expect(button).toHaveClass('pointer-events-none')
  })
})
