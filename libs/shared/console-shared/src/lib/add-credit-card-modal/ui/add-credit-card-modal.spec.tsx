import { render } from '@testing-library/react'
import AddCreditCardModal from './add-credit-card-modal'

describe('AddCreditCardModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AddCreditCardModal />)
    expect(baseElement).toBeTruthy()
  })
})
