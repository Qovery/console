import { render } from '@testing-library/react'
import PageSettingsResourcesFeature from './page-settings-resources-feature'

describe('PageSettingsResourcesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
