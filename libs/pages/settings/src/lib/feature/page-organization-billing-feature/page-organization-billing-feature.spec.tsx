import { render } from '__tests__/utils/setup-jest'
import PageOrganizationBillingFeature from './page-organization-billing-feature'

describe('PageOrganizationBillingFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationBillingFeature />)
    expect(baseElement).toBeTruthy()
  })
})
