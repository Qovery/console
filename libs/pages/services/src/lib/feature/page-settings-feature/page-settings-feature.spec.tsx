import { render } from '@testing-library/react'

import PageSettingsFeature from './page-settings-feature'

describe('PageSettingsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
