import { act, getByTestId, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import ShowUsageModal, { type ShowUsageModalProps } from './show-usage-modal'

const props: ShowUsageModalProps = {
  isSubmitting: false,
  onClose: jest.fn(),
  onSubmit: jest.fn((e) => e.preventDefault()),
}

describe('ShowUsageModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm<{ code: string }>(<ShowUsageModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should show spinner', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<{ code: string }>(<ShowUsageModal {...props} isSubmitting={true} />)
    )
    getByTestId(baseElement, 'spinner')
  })

  it('should call on Submit', async () => {
    const spy = jest.fn((e) => e.preventDefault())
    props.onSubmit = spy

    const { baseElement } = render(
      wrapWithReactHookForm<{ code: string }>(<ShowUsageModal {...props} onSubmit={spy} />, {
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
