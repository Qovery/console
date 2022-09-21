import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import GitRepositorySettingsFeature from './git-repository-settings-feature'

describe('GitRepositorySettingsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<GitRepositorySettingsFeature />))
    expect(baseElement).toBeTruthy()
  })
})
