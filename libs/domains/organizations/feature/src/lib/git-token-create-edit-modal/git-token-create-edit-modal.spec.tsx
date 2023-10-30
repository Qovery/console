import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import GitTokenCreateEditModal, { type GitTokenCreateEditModalProps } from './git-token-create-edit-modal'

const props: GitTokenCreateEditModalProps = {
  onClose: jest.fn(),
}

describe('GitTokenCreateEditModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GitTokenCreateEditModal {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
