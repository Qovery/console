import { render } from '__tests__/utils/setup-jest'
import PageSettingsDomainsFeature from './page-settings-domains-feature'

describe('PageSettingsDomainsFeature', () => {
  beforeEach(() => {})

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDomainsFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should fetch the app if not already loaded', () => {})
})
