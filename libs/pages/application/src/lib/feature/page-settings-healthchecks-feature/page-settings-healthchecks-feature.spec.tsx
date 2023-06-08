import { render } from '@testing-library/react'
import PageSettingsHealthchecksFeature from './page-settings-healthchecks-feature'

describe('PageSettingsHealthchecksFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsHealthchecksFeature />)
    expect(baseElement).toBeTruthy()
  })
})
