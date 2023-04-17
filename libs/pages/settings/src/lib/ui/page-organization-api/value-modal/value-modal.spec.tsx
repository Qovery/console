import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ValueModal, ValueModalProps } from './value-modal'

const props: ValueModalProps = {
  onClose: jest.fn(),
  token: 'token',
}

describe('CrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ValueModal {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
