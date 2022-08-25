import { render } from '@testing-library/react'
import PageSettingsResources from './page-settings-resources'

describe('PageSettingsResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsResources />)
    expect(baseElement).toBeTruthy()
  })
})
