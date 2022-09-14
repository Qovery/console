import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { authProviderFactoryMock } from '@qovery/domains/organization'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import GitRepositorySettingsFeature, { authProvidersValues } from './git-repository-settings-feature'

describe('GitRepositorySettingsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<GitRepositorySettingsFeature />))
    expect(baseElement).toBeTruthy()
  })

  it('should have function to create input auth providers values', () => {
    const authProviders = authProviderFactoryMock(1)
    const value = authProvidersValues(authProviders)[0]

    expect(value.label).toBe(`${upperCaseFirstLetter(authProviders[0].name)} (${authProviders[0].owner})`)
    expect(value.value).toBe(authProviders[0].name)
  })
})
