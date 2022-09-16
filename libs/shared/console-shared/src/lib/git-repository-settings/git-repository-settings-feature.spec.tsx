import { render } from '__tests__/utils/setup-jest'
import GitRepositorySettingsFeature from './git-repository-settings-feature'

describe('GitRepositorySettingsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GitRepositorySettingsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
