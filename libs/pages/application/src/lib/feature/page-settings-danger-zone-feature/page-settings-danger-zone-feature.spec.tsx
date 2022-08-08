import { render } from '__tests__/utils/setup-jest'
import PageSettingsDangerZoneFeature from './page-settings-danger-zone-feature'

describe('PageSettingsDangerZoneFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDangerZoneFeature />)
    expect(baseElement).toBeTruthy()
  })
})
