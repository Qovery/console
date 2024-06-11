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

  it('should submit the form to create a git token', async () => {
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<GitTokenCreateEditModal {...props} />))

    const inputType = screen.getByLabelText('Type')
    await selectEvent.select(inputType, ['Gitlab'], {
      container: document.body,
    })

    const inputName = screen.getByLabelText('Token name')
    await userEvent.type(inputName, 'my-token-name')

    const inputTokenValue = screen.getByLabelText('Token value')
    await userEvent.type(inputTokenValue, 'my-token-value')

    const btn = screen.getByRole('button', { name: 'Create' })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(useCreateGitTokenMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0000-0000-0000',
      gitTokenRequest: {
        type: GitProviderEnum.GITLAB,
        name: 'my-token-name',
        token: 'my-token-value',
        description: '',
        workspace: undefined,
      },
    })

    expect(props.onClose).toHaveBeenCalledWith({ id: '000' })
  })

  it('should submit the form to edit a git token', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <GitTokenCreateEditModal
          {...props}
          isEdit
          gitToken={{
            id: '1111-1111-1111',
            created_at: '',
            updated_at: '',
            name: 'my-token',
            description: '',
            type: GitProviderEnum.GITHUB,
            associated_services_count: 0,
          }}
        />
      )
    )

    const inputName = screen.getByLabelText('Token name')
    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'my-token-name')

    const inputTokenValue = screen.getByLabelText('Token value')
    await userEvent.type(inputTokenValue, 'my-token-value')

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
        description: '',
        workspace: undefined,
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })
})
