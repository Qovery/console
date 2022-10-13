import { render } from '@testing-library/react'
import PageOrganizationMembers from './page-organization-members'

describe('PageOrganizationMembers', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationMembers />)
    expect(baseElement).toBeTruthy()
  })
})
