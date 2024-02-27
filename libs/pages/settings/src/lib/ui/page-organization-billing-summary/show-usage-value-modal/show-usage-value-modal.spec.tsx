import { getByDisplayValue, getByTestId, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ShowUsageValueModal, type ShowUsageValueModalProps } from './show-usage-value-modal'

const props: ShowUsageValueModalProps = {
  onClose: jest.fn(),
  token: 'token',
}

describe('ShowUsageValueModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ShowUsageValueModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render copy paste widget', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ShowUsageValueModal {...props} />))
    getByTestId(baseElement, 'copy-container')
  })

  it('should render token value', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ShowUsageValueModal {...props} />))
    getByDisplayValue(baseElement, 'token')
  })
})
