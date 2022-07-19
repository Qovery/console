import { render } from '@testing-library/react'

import PageSettingsDangerZoneFeature from './page-settings-danger-zone-feature'

describe('PageSettingsDangerZoneFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDangerZoneFeature />)
    expect(baseElement).toBeTruthy()
  })
})
