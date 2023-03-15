import { render } from '@testing-library/react'
import CheckoutUpgradeModalFeature from './checkout-upgrade-modal-feature'

describe('CheckoutUpgradeModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CheckoutUpgradeModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
