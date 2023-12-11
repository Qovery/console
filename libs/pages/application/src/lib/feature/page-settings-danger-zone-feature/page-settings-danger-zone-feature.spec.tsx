import { renderWithProviders } from '@qovery/shared/util-tests'
import PageSettingsDangerZoneFeature from './page-settings-danger-zone-feature'

describe('PageSettingsDangerZoneFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsDangerZoneFeature />)
    expect(baseElement).toBeTruthy()
  })
})
