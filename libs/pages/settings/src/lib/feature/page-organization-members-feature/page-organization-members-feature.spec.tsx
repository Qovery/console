import { render } from '__tests__/utils/setup-jest'
import PageOrganizationMembersFeature from './page-organization-members-feature'

describe('PageOrganizationMembersFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationMembersFeature />)
    expect(baseElement).toBeTruthy()
  })
})
