import { render } from '@testing-library/react'
import PageOrganizationBillingSummary from './page-organization-billing-summary'

describe('PageOrganizationBillingSummary', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationBillingSummary />)
    expect(baseElement).toBeTruthy()
  })
})
