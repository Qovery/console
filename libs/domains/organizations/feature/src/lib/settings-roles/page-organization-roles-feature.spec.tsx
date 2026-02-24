import { render } from '__tests__/utils/setup-jest'
import PageOrganizationRolesFeature from '../../../../../../pages/settings/src/lib/feature/page-organization-roles-feature/page-organization-roles-feature'

describe('PageOrganizationRolesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationRolesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
