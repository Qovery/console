import { render } from '@testing-library/react'

import PageSettingsGeneralFeature from './page-settings-general-feature'

describe('PageSettingsGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})
