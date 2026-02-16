import { type Auth0ProviderOptions } from '@auth0/auth0-react'
import { GitProviderEnum } from 'qovery-typescript-axios'
import { act, getByTestId, getByText, renderWithProviders, screen } from '@qovery/shared/util-tests'
import SectionGithubApp, { type SectionGithubAppProps } from './section-github-app'

const props: SectionGithubAppProps = {
  onDisconnect: jest.fn(),
  onConfigure: jest.fn(),
  authProviderLoading: false,
  githubAuthProvider: {
    name: 'GITHUB',
    owner: 'owner',
    id: 'id',
    use_bot: true,
  },
  githubConnectURL: 'githubConnectURL',
  repositories: [],
  repositoriesLoading: false,
}

const mockGetTokenSilently = jest.fn()
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: Auth0ProviderOptions) => children,
  useAuth0: () => {
    return {
      getAccessTokenSilently: mockGetTokenSilently,
    }
  },
}))

const mockRefetchAuthProviders = jest.fn()

describe('SectionGithubApp', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SectionGithubApp {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display install button if githubAuthProvider does not use_bot', async () => {
    const testProps = {
      ...props,
      githubAuthProvider: {
        ...props.githubAuthProvider,
        use_bot: false,
      },
    }
    const { baseElement } = renderWithProviders(<SectionGithubApp {...testProps} />)

    await act(() => {
      getByTestId(baseElement, 'install-button').click()
    })

    expect(props.onConfigure).toHaveBeenCalled()
  })

  it('should display disconnect and manage permissions buttons if githubAuthProvider use_bot', async () => {
    const { baseElement } = renderWithProviders(<SectionGithubApp {...props} />)
    const disconnectButton = getByTestId(baseElement, 'disconnect-button')
    const permissionButton = getByTestId(baseElement, 'permission-button')

    await act(() => {
      disconnectButton.click()
      permissionButton.click()
    })

    expect(props.onDisconnect).toHaveBeenCalled()
    expect(props.onConfigure).toHaveBeenCalled()
  })

  it('should display repository list if repositories are not empty and not loading', () => {
    const testProps: SectionGithubAppProps = {
      ...props,
      repositories: [
        {
          id: 'id',
          name: 'name',
          url: 'url',
          provider: GitProviderEnum.GITHUB,
          is_private: false,
          default_branch: 'default_branch',
          branches: {
            loadingStatus: 'loaded',
            items: [],
          },
        },
      ],
    }
    const { baseElement } = renderWithProviders(<SectionGithubApp {...testProps} />)
    getByText(baseElement, 'name')
  })
})
