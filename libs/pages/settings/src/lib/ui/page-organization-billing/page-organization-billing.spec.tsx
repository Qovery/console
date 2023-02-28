import { render } from '@testing-library/react'
import PageOrganizationBilling from './page-organization-billing'

describe('PageOrganizationBilling', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationBilling />)
    expect(baseElement).toBeTruthy()
  })
})
