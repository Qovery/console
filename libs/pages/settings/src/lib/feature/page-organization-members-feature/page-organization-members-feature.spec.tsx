import { render } from '@testing-library/react'
import PageOrganizationMembersFeature from './page-organization-members-feature'

describe('PageOrganizationMembersFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationMembersFeature />)
    expect(baseElement).toBeTruthy()
  })
})
