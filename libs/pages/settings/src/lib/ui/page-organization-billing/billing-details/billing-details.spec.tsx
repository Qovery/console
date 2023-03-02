import { render } from '@testing-library/react'
import BillingDetails from './billing-details'

describe('BillingDetails', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BillingDetails />)
    expect(baseElement).toBeTruthy()
  })
})
