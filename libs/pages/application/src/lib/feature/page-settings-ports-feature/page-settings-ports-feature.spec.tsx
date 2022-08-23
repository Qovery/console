import { render } from '@testing-library/react'
import PageSettingsPortsFeature from './page-settings-ports-feature'

describe('PageSettingsPortsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsPortsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
