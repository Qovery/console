import { render } from '@testing-library/react'
import PageSettingsFeaturesFeature from './page-settings-features-feature'

describe('PageSettingsFeaturesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsFeaturesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
