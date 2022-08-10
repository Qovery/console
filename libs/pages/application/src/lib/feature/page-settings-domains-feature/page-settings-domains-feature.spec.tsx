import { render } from '@testing-library/react'
import PageSettingsDomainsFeature from './page-settings-domains-feature'

describe('PageSettingsDomainsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDomainsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
