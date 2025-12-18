import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { GitProviderEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import GitRepositorySettings, { type GitRepositorySettingsProps } from './git-repository-settings'

const mockOpenModal = jest.fn()
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
  }),
}))

const mockUseGitTokens = jest.fn()
jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useGitTokens: (props: unknown) => mockUseGitTokens(props),
}))

describe('GitRepositorySettings', () => {
  const props: GitRepositorySettingsProps = {
    gitDisabled: true,
    editGitSettings: jest.fn(),
    currentProvider: 'GITHUB',
    currentRepository: 'qovery/console',
    organizationId: 'org-123',
  }

  const defaultValues = {
    provider: GitProviderEnum.GITHUB,
    repository: 'qovery/console',
    branch: 'main',
    root_path: '/',
  }

  beforeEach(() => {
    // Default mock implementation for all tests
    mockUseGitTokens.mockReturnValue({
      data: [],
      isLoading: false,
    })
  })

  afterEach(() => {
    mockUseGitTokens.mockClear()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<GitRepositorySettings {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render disabled fields', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
        defaultValues: defaultValues,
      })
    )

    screen.getByDisplayValue(defaultValues.provider)
    screen.getByDisplayValue(defaultValues.repository)
    screen.getByDisplayValue(defaultValues.branch)
    screen.getByDisplayValue(defaultValues.root_path)
  })

  it('should dispatch open modal if click on edit', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const buttonEdit = screen.getByText('Edit')
    await userEvent.click(buttonEdit)

    expect(mockOpenModal).toHaveBeenCalled()
  })

  describe('expired token warnings (AC-4, AC-5)', () => {
    beforeEach(() => {
      mockUseGitTokens.mockReset()
    })

    it('should display warning when selected token is expired', () => {
      const expiredToken = {
        id: 'token-123',
        name: 'My Token',
        type: 'GITHUB',
        expired_at: '2020-01-01T00:00:00Z',
        isExpired: true,
      }

      mockUseGitTokens.mockReturnValue({
        data: [expiredToken],
        isLoading: false,
      })

      const defaultValuesWithToken = {
        ...defaultValues,
        git_token_id: 'token-123',
      }

      renderWithProviders(
        wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
          defaultValues: defaultValuesWithToken,
        })
      )

      expect(screen.getByText(/The selected git token has expired/i)).toBeInTheDocument()
      expect(
        screen.getByText(/Please update it in organization settings to ensure deployments work correctly/i)
      ).toBeInTheDocument()
    })

    it('should not display warning when selected token is valid', () => {
      const validToken = {
        id: 'token-123',
        name: 'My Token',
        type: 'GITHUB',
        expired_at: '2099-12-31T23:59:59Z',
        isExpired: false,
      }

      mockUseGitTokens.mockReturnValue({
        data: [validToken],
        isLoading: false,
      })

      const defaultValuesWithToken = {
        ...defaultValues,
        git_token_id: 'token-123',
      }

      renderWithProviders(
        wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
          defaultValues: defaultValuesWithToken,
        })
      )

      expect(screen.queryByText(/The selected git token has expired/i)).not.toBeInTheDocument()
    })

    it('should not display warning when token has no expiration date', () => {
      const tokenWithoutExpiration = {
        id: 'token-123',
        name: 'My Token',
        type: 'GITHUB',
        expired_at: null,
        isExpired: false,
      }

      mockUseGitTokens.mockReturnValue({
        data: [tokenWithoutExpiration],
        isLoading: false,
      })

      const defaultValuesWithToken = {
        ...defaultValues,
        git_token_id: 'token-123',
      }

      renderWithProviders(
        wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
          defaultValues: defaultValuesWithToken,
        })
      )

      expect(screen.queryByText(/The selected git token has expired/i)).not.toBeInTheDocument()
    })

    it('should not display warning when no token is selected', () => {
      mockUseGitTokens.mockReturnValue({
        data: [],
        isLoading: false,
      })

      renderWithProviders(
        wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
          defaultValues: defaultValues,
        })
      )

      expect(screen.queryByText(/The selected git token has expired/i)).not.toBeInTheDocument()
    })

    it('should handle token list with multiple tokens and select the correct one', () => {
      const tokens = [
        {
          id: 'token-1',
          name: 'Valid Token',
          type: 'GITHUB',
          expired_at: '2099-12-31T23:59:59Z',
          isExpired: false,
        },
        {
          id: 'token-2',
          name: 'Expired Token',
          type: 'GITHUB',
          expired_at: '2020-01-01T00:00:00Z',
          isExpired: true,
        },
      ]

      mockUseGitTokens.mockReturnValue({
        data: tokens,
        isLoading: false,
      })

      // Select the expired token
      const defaultValuesWithExpiredToken = {
        ...defaultValues,
        git_token_id: 'token-2',
      }

      renderWithProviders(
        wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
          defaultValues: defaultValuesWithExpiredToken,
        })
      )

      expect(screen.getByText(/The selected git token has expired/i)).toBeInTheDocument()
    })
  })
})
