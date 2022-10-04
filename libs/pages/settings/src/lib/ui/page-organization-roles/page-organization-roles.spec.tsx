import { render } from '@testing-library/react'
import PageOrganizationRoles from './page-organization-roles'

describe('PageOrganizationRoles', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationRoles />)
    expect(baseElement).toBeTruthy()
  })
})
