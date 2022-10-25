import { render } from '__tests__/utils/setup-jest'
import PageOrganizationRolesFeature from './page-organization-roles-feature'

describe('PageOrganizationRolesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationRolesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
