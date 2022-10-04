import { render } from '@testing-library/react'
import PageOrganizationRolesFeature from './page-organization-roles-feature'

describe('PageOrganizationRolesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationRolesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
