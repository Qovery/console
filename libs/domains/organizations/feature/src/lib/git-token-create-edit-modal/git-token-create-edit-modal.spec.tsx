import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { GitProviderEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useCreateGitToken from '../hooks/use-create-git-token/use-create-git-token'
import * as useEditGitToken from '../hooks/use-edit-git-token/use-edit-git-token'
import GitTokenCreateEditModal, { type GitTokenCreateEditModalProps } from './git-token-create-edit-modal'

const useCreateGitTokenMockSpy = jest.spyOn(useCreateGitToken, 'useCreateGitToken') as jest.Mock
const useEditGitTokenMockSpy = jest.spyOn(useEditGitToken, 'useEditGitToken') as jest.Mock

const props: GitTokenCreateEditModalProps = {
  organizationId: '0000-0000-0000',
  onClose: jest.fn(),
}

describe('GitTokenCreateEditModal', () => {
  beforeEach(() => {
    useCreateGitTokenMockSpy.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: '000' }),
    })
    useEditGitTokenMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GitTokenCreateEditModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should display the ID field when in edit mode', async () => {
    const gitToken = {
      id: '1111-1111-1111',
      created_at: '',
      associated_services_count: 0,
      name: 'my-token',
      type: GitProviderEnum.GITHUB,
      token: 'my-token-value',
      description: 'description',
    }

    renderWithProviders(<GitTokenCreateEditModal {...props} isEdit gitToken={gitToken} />)

    const idInput = screen.getByLabelText('Qovery ID')
    expect(idInput).toBeInTheDocument()
    expect(idInput).toHaveValue('1111-1111-1111')
    expect(idInput).toBeDisabled()
  })

  it('should not display the ID field when in create mode', () => {
    renderWithProviders(wrapWithReactHookForm(<GitTokenCreateEditModal {...props} />))
    expect(screen.queryByLabelText('Token ID')).not.toBeInTheDocument()
  })

  it('should submit the form to create a git token', async () => {
    const { userEvent } = renderWithProviders(<GitTokenCreateEditModal {...props} />)

    const inputName = screen.getByLabelText('Token name')
    const inputToken = screen.getByLabelText('Token value')
    const selectType = screen.getByLabelText('Type')

    await userEvent.type(inputName, 'my-token-name')
    await userEvent.type(inputToken, 'my-token-value')
    await selectEvent.select(selectType, 'Gitlab')

    const btn = screen.getByRole('button', { name: 'Confirm' })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(useCreateGitTokenMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      gitTokenRequest: {
        type: GitProviderEnum.GITLAB,
        name: 'my-token-name',
        token: 'my-token-value',
        description: '',
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })

  it('should submit the form to edit a git token', async () => {
    const gitToken = {
      id: '1111-1111-1111',
      created_at: '',
      associated_services_count: 0,
      name: 'my-token',
      type: GitProviderEnum.GITHUB,
      token: 'my-token-value',
      description: 'description',
    }

    const { userEvent } = renderWithProviders(<GitTokenCreateEditModal {...props} isEdit gitToken={gitToken} />)

    const inputName = screen.getByLabelText('Token name')
    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'my-token-name')

    const btn = screen.getByRole('button', { name: 'Confirm' })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(useEditGitTokenMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      gitTokenId: '1111-1111-1111',
      gitTokenRequest: {
        type: GitProviderEnum.GITHUB,
        name: 'my-token-name',
        token: 'my-token-value',
        description: 'description',
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })
})
