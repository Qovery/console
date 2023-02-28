import { render } from '@testing-library/react'
import PageOrganizationBillingFeature from './page-organization-billing-feature'

describe('PageOrganizationBillingFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationBillingFeature />)
    expect(baseElement).toBeTruthy()
  })
})
