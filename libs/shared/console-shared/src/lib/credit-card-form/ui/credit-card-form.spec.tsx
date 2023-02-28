import { render } from '@testing-library/react'
import CreditCardForm from './credit-card-form'

describe('CreditCardForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CreditCardForm />)
    expect(baseElement).toBeTruthy()
  })
})
