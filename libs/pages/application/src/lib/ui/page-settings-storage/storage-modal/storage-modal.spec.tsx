import StorageModal, { StorageModalProps } from './storage-modal'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'

const props: StorageModalProps = {
  onClose: jest.fn(),
  loading: false,
  onSubmit: jest.fn(),
  isEdit: false,
}

describe('StorageModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StorageModal {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
