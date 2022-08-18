import { render } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { authProviderFactoryMock } from '@console/domains/organization'
import { authProvidersValues } from '../../feature/git-repository-settings-feature/git-repository-settings-feature'
import GitRepositorySettings, { GitRepositorySettingsProps } from './git-repository-settings'

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

  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<GitRepositorySettings {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
