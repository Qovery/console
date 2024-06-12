import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import AddCreditCardModalFeature, { type AddCreditCardModalFeatureProps } from './add-credit-card-modal-feature'

import SpyInstance = jest.SpyInstance

const useAddCreditCardSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useAddCreditCard')

const props: AddCreditCardModalFeatureProps = {
  organizationId: '1',
}

describe('AddCreditCardModalFeature', () => {
  beforeEach(() => {
    useAddCreditCardSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<AddCreditCardModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch addCreditCard action', async () => {
    const { userEvent } = renderWithProviders(<AddCreditCardModalFeature organizationId="1" />)

    const button = screen.getByTestId('submit-button')
    const cardNumberInput = screen.getByLabelText('Card number')
    const cardExpiryInput = screen.getByLabelText('Expiration date')
    const cardCVCInput = screen.getByLabelText('CVC')

    await userEvent.type(cardNumberInput, '4444444444444444')
    await userEvent.type(cardExpiryInput, '0320')
    await userEvent.type(cardCVCInput, '032')

    expect(button).toBeEnabled()

    await userEvent.click(button)

    expect(useAddCreditCardSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '1',
      creditCardRequest: {
        cvv: '032',
        number: '4444 4444 4444 4444',
        expiry_year: 20,
        expiry_month: 3,
      },
    })
  })
})
