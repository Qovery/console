import { act, getByTestId, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PromoCodeModal, { type PromoCodeModalProps } from './promo-code-modal'

const props: PromoCodeModalProps = {
  isSubmitting: false,
  onClose: jest.fn(),
  onSubmit: jest.fn((e) => e.preventDefault()),
}

describe('PromocodeModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm<{ code: string }>(<PromoCodeModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should show spinner', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<{ code: string }>(<PromoCodeModal {...props} isSubmitting={true} />)
    )
    getByTestId(baseElement, 'spinner')
  })

  it('should call on Submit', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy

    const { baseElement } = render(
      wrapWithReactHookForm<{ code: string }>(<PromoCodeModal {...props} onSubmit={spy} />, {
        defaultValues: { code: 'test' },
      })
    )
    const button = getByTestId(baseElement, 'submit-button')
    await act(() => {
      button.click()
    })

    expect(spy).toHaveBeenCalled()
  })
})
