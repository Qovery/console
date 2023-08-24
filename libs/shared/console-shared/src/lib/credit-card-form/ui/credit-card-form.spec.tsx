import { getByLabelText, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import CreditCardForm, { type CreditCardFormValues } from './credit-card-form'

describe('CreditCardForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<CreditCardFormValues>(<CreditCardForm />, {
        defaultValues: {
          expiry: '',
          card_number: '',
          cvc: '',
          full_name: '',
          country: '',
        },
      })
    )
    expect(baseElement).toBeTruthy()

    getByLabelText(baseElement, 'Card number')
    getByLabelText(baseElement, 'Expiration date')
    getByLabelText(baseElement, 'CVC')
  })
})
