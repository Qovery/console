import { render } from '@testing-library/react'
import PagesSettingsDomainsFeature from './pages-settings-domains-feature'

describe('PagesSettingsDomainsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesSettingsDomainsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
