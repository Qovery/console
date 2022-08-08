import { render } from '__tests__/utils/setup-jest'
import PageSettingsDomainsFeature from './page-settings-domains-feature'

describe('PageSettingsDomainsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDomainsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
