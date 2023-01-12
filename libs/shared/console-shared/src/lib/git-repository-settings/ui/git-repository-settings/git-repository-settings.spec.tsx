import { act, render, screen } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { GitProviderEnum } from 'qovery-typescript-axios'
import { authProviderFactoryMock } from '@qovery/shared/factories'
import { authProvidersValues } from '../../utils/auth-providers-values'
import GitRepositorySettings, { GitRepositorySettingsProps } from './git-repository-settings'

const mockOpenModal = jest.fn()
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
  }),
}))

describe('GitRepositorySettings', () => {
  const authProviders = authProviderFactoryMock(1)

  const props: GitRepositorySettingsProps = {
    gitDisabled: false,
    editGitSettings: jest.fn(),
    authProviders: authProvidersValues(authProviders),
    repositories: [],
    branches: [],
    loadingStatusAuthProviders: 'loaded',
    loadingStatusRepositories: 'loading',
    loadingStatusBranches: 'not loaded',
    currentAuthProvider: 'GITHUB',
  }

  const defaultValues = {
    provider: GitProviderEnum.GITHUB,
    repository: 'qovery/console',
    branch: 'main',
    root_path: '/',
  }

  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<GitRepositorySettings {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should have loader for repositories request', async () => {
    props.loadingStatusAuthProviders = 'loaded'
    props.loadingStatusRepositories = 'loading'

    const { queryByTestId } = render(
      wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const authProvider = screen.getByTestId('input-provider')
    const loaderRepository = screen.getByTestId('loader')

    expect(authProvider).toBeVisible()
    expect(loaderRepository).toBeVisible()
    expect(queryByTestId('input-repository')?.parentElement).toHaveClass('hidden')
    expect(queryByTestId('input-branch')?.parentElement).toHaveClass('hidden')
    expect(queryByTestId('input-root-path-wrapper')).toHaveClass('hidden')
    expect(queryByTestId('button-edit')).not.toBeInTheDocument()
  })

  it('should have loader for branches request', async () => {
    props.loadingStatusAuthProviders = 'loaded'
    props.loadingStatusRepositories = 'loaded'
    props.loadingStatusBranches = 'loading'

    const { queryByTestId } = render(
      wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const authProvider = screen.getByTestId('input-provider')
    const repository = screen.getByTestId('input-repository')
    const loaderBranch = screen.getByTestId('loader')

    expect(authProvider).toBeVisible()
    expect(repository?.parentElement).not.toHaveClass('hidden')
    expect(loaderBranch).toBeVisible()
    expect(queryByTestId('input-branch')?.parentElement).toHaveClass('hidden')
    expect(queryByTestId('input-root-path-wrapper')).toHaveClass('hidden')
    expect(queryByTestId('button-edit')).not.toBeInTheDocument()
  })

  it('should have all inputs when all loading status are loaded', async () => {
    props.loadingStatusAuthProviders = 'loaded'
    props.loadingStatusRepositories = 'loaded'
    props.loadingStatusBranches = 'loaded'

    render(
      wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const authProvider = screen.getByTestId('input-provider')
    const repository = screen.getByTestId('input-repository')
    const branch = screen.getByTestId('input-branch')

    expect(authProvider).toBeVisible()
    expect(repository).toBeVisible()
    expect(branch).toBeVisible()
  })

  it('should have all inputs are disabled', async () => {
    props.loadingStatusAuthProviders = 'not loaded'
    props.loadingStatusRepositories = 'not loaded'
    props.loadingStatusBranches = 'not loaded'
    props.gitDisabled = true

    render(
      wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const authProvider = screen.getByTestId('input-provider')
    const repository = screen.getByTestId('input-repository')
    const branch = screen.getByTestId('input-branch')
    const rootPath = screen.getByTestId('input-root-path')
    const buttonEdit = screen.getByTestId('button-edit')

    expect(authProvider).toBeVisible()
    expect(authProvider.classList.contains('input--disabled'))
    expect(repository.classList.contains('input--disabled'))
    expect(branch.classList.contains('input--disabled'))
    expect(rootPath.classList.contains('input--disabled'))
    expect(buttonEdit).toBeVisible()

    expect(repository?.parentElement).not.toHaveClass('hidden')
    expect(branch?.parentElement).not.toHaveClass('hidden')
    expect(screen.getByTestId('input-root-path-wrapper')).not.toHaveClass('hidden')
  })

  it('should have inputs disabled', async () => {
    props.loadingStatusAuthProviders = 'loaded'
    props.loadingStatusRepositories = 'loading'
    props.loadingStatusBranches = 'not loaded'
    props.gitDisabled = false

    const { queryByTestId } = render(
      wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const authProvider = screen.getByTestId('input-provider')
    const loaderRepository = screen.getByTestId('loader')

    expect(authProvider).toBeVisible()
    expect(loaderRepository).toBeVisible()
    expect(queryByTestId('button-edit')).not.toBeInTheDocument()
  })

  it('should dispatch open modal if click on edit', async () => {
    props.gitDisabled = true

    const { queryByTestId } = render(
      wrapWithReactHookForm(<GitRepositorySettings {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const buttonEdit = queryByTestId('button-edit')

    await act(() => {
      buttonEdit?.click()
    })

    expect(mockOpenModal).toHaveBeenCalled()
  })
})
