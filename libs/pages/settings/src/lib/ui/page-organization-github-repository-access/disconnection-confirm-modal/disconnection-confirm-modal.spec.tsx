import { act, getByTestId, render } from '__tests__/utils/setup-jest'
import DisconnectionConfirmModal from './disconnection-confirm-modal'

const mockOnClose = jest.fn()
const mockOnSubmit = jest.fn()

describe('DisconnectionConfirmModal', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(<DisconnectionConfirmModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    expect(baseElement).toBeTruthy()

    const cancelButton = getByTestId(baseElement, 'cancel-button')
    await act(() => {
      cancelButton.click()
    })
    expect(mockOnClose).toHaveBeenCalled()

    const submitButton = getByTestId(baseElement, 'submit-button')
    await act(() => {
      submitButton.click()
    })
    expect(mockOnSubmit).toHaveBeenCalled()
  })
})
