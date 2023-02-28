import { render } from '@testing-library/react'
import AddCreditCardModalFeature from './add-credit-card-modal-feature'

describe('AddCreditCardModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AddCreditCardModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
