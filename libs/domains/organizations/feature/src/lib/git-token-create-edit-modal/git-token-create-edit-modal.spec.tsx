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
        id: '',
        type: GitProviderEnum.GITLAB,
        name: 'my-token-name',
        token: 'my-token-value',
        description: '',
        workspace: undefined,
        git_api_url: undefined,
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
            git_api_url: 'https://api.github.com',
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
        id: '1111-1111-1111',
        git_api_url: 'https://api.github.com',
        type: GitProviderEnum.GITHUB,
        name: 'my-token-name',
        token: 'my-token-value',
        description: '',
        workspace: undefined,
      },
    })

    expect(props.onClose).toHaveBeenCalled()
  })

  describe('expired token warning banner', () => {
    describe('Warning banner display for expired tokens', () => {
      it('should show expiration warning banner when editing expired token', () => {
        const expiredToken: typeof props.gitToken = {
          id: '1111-1111-1111',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          name: 'my-token',
          description: '',
          type: GitProviderEnum.GITHUB,
          expired_at: '2023-06-15T10:30:00Z', // Past date - expired
          associated_services_count: 0,
          git_api_url: '',
        }

        renderWithProviders(
          wrapWithReactHookForm(<GitTokenCreateEditModal {...props} isEdit gitToken={expiredToken} />)
        )

        expect(screen.getByText(/this token expired on/i)).toBeInTheDocument()
        expect(screen.getByText(/please update the token value below/i)).toBeInTheDocument()
      })
    })

    describe('No warning for non-expired tokens', () => {
      it('should not show warning banner when editing non-expired token', () => {
        const validToken: typeof props.gitToken = {
          id: '1111-1111-1111',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          name: 'my-token',
          description: '',
          type: GitProviderEnum.GITHUB,
          expired_at: '2099-12-31T23:59:59Z', // Future date - not expired
          associated_services_count: 0,
          git_api_url: '',
        }

        renderWithProviders(wrapWithReactHookForm(<GitTokenCreateEditModal {...props} isEdit gitToken={validToken} />))

        expect(screen.queryByText(/this token expired on/i)).not.toBeInTheDocument()
      })

      it('should not show warning banner when creating new token', () => {
        renderWithProviders(wrapWithReactHookForm(<GitTokenCreateEditModal {...props} />))

        expect(screen.queryByText(/this token expired on/i)).not.toBeInTheDocument()
      })
    })

    describe('Token without expiration date', () => {
      it('should not show warning banner when token has no expiration date', () => {
        const tokenWithoutExpiration: typeof props.gitToken = {
          id: '1111-1111-1111',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          name: 'my-token',
          description: '',
          type: GitProviderEnum.GITHUB,
          expired_at: undefined, // No expiration
          associated_services_count: 0,
          git_api_url: '',
        }

        renderWithProviders(
          wrapWithReactHookForm(<GitTokenCreateEditModal {...props} isEdit gitToken={tokenWithoutExpiration} />)
        )

        expect(screen.queryByText(/this token expired on/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Mutation failure handling', () => {
    it('should keep modal open when edit mutation fails', async () => {
      const mockError = new Error('Network error')
      useEditGitTokenMockSpy.mockReturnValue({
        mutateAsync: jest.fn().mockRejectedValue(mockError),
      })

      const expiredToken: typeof props.gitToken = {
        id: '1111-1111-1111',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        name: 'my-token',
        description: '',
        type: GitProviderEnum.GITHUB,
        expired_at: '2020-01-01T00:00:00Z',
        associated_services_count: 0,
        git_api_url: '',
      }

      const { userEvent } = renderWithProviders(
        wrapWithReactHookForm(<GitTokenCreateEditModal {...props} isEdit gitToken={expiredToken} />)
      )

      const inputTokenValue = screen.getByLabelText('Token value')
      await userEvent.type(inputTokenValue, 'new-token-value')

      const btn = screen.getByRole('button', { name: 'Confirm' })
      await userEvent.click(btn)

      // onClose should NOT be called when mutation fails
      expect(props.onClose).not.toHaveBeenCalled()

      // Warning banner should still be visible (modal still open)
      expect(screen.getByText(/this token expired on/i)).toBeInTheDocument()
    })
  })
})
