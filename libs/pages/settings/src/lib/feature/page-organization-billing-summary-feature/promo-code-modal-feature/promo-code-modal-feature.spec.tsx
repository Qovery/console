import { act, fireEvent, getByLabelText, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import * as organizationDomains from '@qovery/domains/organization'
import PromoCodeModalFeature, { PromocodeModalFeatureProps } from './promo-code-modal-feature'

const props: PromocodeModalFeatureProps = {
  closeModal: jest.fn(),
  organizationId: '1',
}

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('PromoCodeModalFeature', () => {
  beforeEach(() => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.resolve(),
    }))
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PromoCodeModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch addCreditCode with good params', async () => {
    const spy = jest.spyOn(organizationDomains, 'addCreditCode')
    const { baseElement } = render(<PromoCodeModalFeature {...props} />)

    const input = getByLabelText(baseElement, 'Promo code')
    await act(() => {
      fireEvent.input(input, { target: { value: 'test' } })
    })

    const button = getByTestId(baseElement, 'submit-button')
    await act(() => {
      button.click()
    })

    expect(spy).toHaveBeenCalledWith({ organizationId: '1', code: 'test' })
  })
})
