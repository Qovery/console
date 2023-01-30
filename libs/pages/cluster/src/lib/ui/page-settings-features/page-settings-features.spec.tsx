import { render } from '@testing-library/react'
import PageSettingsFeatures from './page-settings-features'

describe('PageSettingsFeatures', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsFeatures />)
    expect(baseElement).toBeTruthy()
  })
})
