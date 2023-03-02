import { render } from '@testing-library/react'
import BillingDetailsFeature from './billing-details-feature'

describe('BillingDetailsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BillingDetailsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
