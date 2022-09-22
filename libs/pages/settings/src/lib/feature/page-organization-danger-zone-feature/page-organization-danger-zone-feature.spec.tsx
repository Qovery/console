import { render } from '__tests__/utils/setup-jest'
import PageOrganizationDangerZoneFeature from './page-organization-danger-zone-feature'

describe('PageOrganizationDangerZoneFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationDangerZoneFeature />)
    expect(baseElement).toBeTruthy()
  })
})
