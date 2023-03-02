import { act, fireEvent, getByLabelText, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import * as storeOrganization from '@qovery/domains/organization'
import AddCreditCardModalFeature from './add-credit-card-modal-feature'

import SpyInstance = jest.SpyInstance

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('AddCreditCardModalFeature', () => {
  beforeEach(() => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))
  })

  it('should render successfully', () => {
    const { baseElement } = render(<AddCreditCardModalFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch addCreditCard action', async () => {
    const addCreditCardSpy: SpyInstance = jest.spyOn(storeOrganization, 'addCreditCard')
    const { baseElement } = render(<AddCreditCardModalFeature organizationId="1" />)

    const button = getByTestId(baseElement, 'submit-button')
    const cardNumberInput = getByLabelText(baseElement, 'Card number')
    const cardExpiryInput = getByLabelText(baseElement, 'Expiration date')
    const cardCVCInput = getByLabelText(baseElement, 'CVC')

    await act(() => {
      fireEvent.change(cardNumberInput, { target: { value: '4444444444444444' } })
      fireEvent.input(cardExpiryInput, { target: { value: '0320' } })
      fireEvent.input(cardCVCInput, { target: { value: '032' } })
    })

    expect(button).not.toBeDisabled()

    await act(() => {
      button.click()
    })

    expect(addCreditCardSpy).toHaveBeenCalledWith({
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
