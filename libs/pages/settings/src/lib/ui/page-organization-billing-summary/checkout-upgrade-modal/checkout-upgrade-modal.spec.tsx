import { render } from '@testing-library/react'
import CheckoutUpgradeModal from './checkout-upgrade-modal'

describe('CheckoutUpgradeModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CheckoutUpgradeModal />)
    expect(baseElement).toBeTruthy()
  })
})
