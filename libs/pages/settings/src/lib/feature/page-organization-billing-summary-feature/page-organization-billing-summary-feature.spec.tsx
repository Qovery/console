import { render } from '@testing-library/react'
import PageOrganizationBillingSummaryFeature from './page-organization-billing-summary-feature'

describe('PageOrganizationBillingSummaryFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationBillingSummaryFeature />)
    expect(baseElement).toBeTruthy()
  })
})
