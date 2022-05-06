import { render } from '@testing-library/react'

import ModalConfirmation from './modal-confirmation'

describe('ModalConfirmation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModalConfirmation />)
    expect(baseElement).toBeTruthy()
  })
})
