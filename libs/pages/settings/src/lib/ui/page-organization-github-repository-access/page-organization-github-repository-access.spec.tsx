import { act, getByTestId, getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { GitProviderEnum } from 'qovery-typescript-axios'
import PageOrganizationGithubRepositoryAccess, {
  PageOrganizationGithubRepositoryAccessProps,
} from './page-organization-github-repository-access'

const props: PageOrganizationGithubRepositoryAccessProps = {
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

describe('PageOrganizationGithubRepositoryAccess', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationGithubRepositoryAccess {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display a spinner on auth provider loading', () => {
    const { getByTestId } = render(<PageOrganizationGithubRepositoryAccess {...props} authProviderLoading />)
    expect(getByTestId('spinner')).toBeTruthy()
  })

  it('should display install button if githubAuthProvider does not use_bot', async () => {
    const testProps = {
      ...props,
      githubAuthProvider: {
        ...props.githubAuthProvider,
        use_bot: false,
      },
    }
    const { baseElement } = render(<PageOrganizationGithubRepositoryAccess {...testProps} />)

    await act(() => {
      getByTestId(baseElement, 'install-button').click()
    })

    expect(props.onConfigure).toHaveBeenCalled()
  })

  it('should display disconnect and manage permissions buttons if githubAuthProvider use_bot', async () => {
    const { baseElement } = render(<PageOrganizationGithubRepositoryAccess {...props} />)
    const disconnectButton = getByTestId(baseElement, 'disconnect-button')
    const permissionButton = getByTestId(baseElement, 'permission-button')

    await act(() => {
      disconnectButton.click()
      permissionButton.click()
    })

    expect(props.onDisconnect).toHaveBeenCalled()
    expect(props.onConfigure).toHaveBeenCalled()
  })

  it('should display repository spinner on repositories loading', () => {
    const { getByTestId } = render(<PageOrganizationGithubRepositoryAccess {...props} repositoriesLoading />)
    expect(getByTestId('spinner')).toBeTruthy()
  })

  it('should display repository list if repositories are not empty and not loading', () => {
    const testProps: PageOrganizationGithubRepositoryAccessProps = {
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
    const { baseElement } = render(<PageOrganizationGithubRepositoryAccess {...testProps} />)
    getByText(baseElement, 'name')
  })
})
