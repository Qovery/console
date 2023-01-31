import { render } from '__tests__/utils/setup-jest'
import PageSettingsResourcesFeature from './page-settings-resources-feature'

describe('PageSettingsResourcesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
