import { getByDisplayValue, getByTestId, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ValueModal, type ValueModalProps } from './value-modal'

const props: ValueModalProps = {
  onClose: jest.fn(),
  token: 'token',
}

describe('ValueModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ValueModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render copy paste widget', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ValueModal {...props} />))
    getByTestId(baseElement, 'copy-container')
  })

  it('should render token value', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ValueModal {...props} />))
    getByDisplayValue(baseElement, 'token')
  })
})
