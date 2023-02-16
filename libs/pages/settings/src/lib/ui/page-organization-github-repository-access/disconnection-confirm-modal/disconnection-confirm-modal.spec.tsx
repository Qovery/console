import { render } from '@testing-library/react'
import DisconnectionConfirmModal from './disconnection-confirm-modal'

describe('DisconnectionConfirmModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DisconnectionConfirmModal />)
    expect(baseElement).toBeTruthy()
  })
})
