import { render } from '@testing-library/react'

import PageSettingsV2 from './page-settings-v2'

describe('PageSettingsV2', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsV2 />)
    expect(baseElement).toBeTruthy()
  })
})
