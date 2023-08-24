import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type CreditCardFormValues } from '../../credit-card-form/ui/credit-card-form'
import AddCreditCardModal from './add-credit-card-modal'

describe('AddCreditCardModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<CreditCardFormValues>(
        <AddCreditCardModal closeModal={jest.fn()} onSubmit={jest.fn()} loading={false} />,
        {
          defaultValues: {
            expiry: '',
            card_number: '',
            cvc: '',
          },
        }
      )
    )
    expect(baseElement).toBeTruthy()
  })
})
