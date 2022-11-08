import { render } from '@testing-library/react'
import ModalAlert from './modal-alert'

describe('ModalAlert', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModalAlert />)
    expect(baseElement).toBeTruthy()
  })
})
