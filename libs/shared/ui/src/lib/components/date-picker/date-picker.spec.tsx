import { render } from '__tests__/utils/setup-jest'
import DatePicker from './date-picker'

describe('DatePicker', () => {
  it('should render successfully', () => {
    const mockOnChange = jest.fn()
    const { baseElement } = render(<DatePicker onChange={mockOnChange} />)
    expect(baseElement).toBeTruthy()
  })

  it('calls onChange with selected dates when Apply button is clicked', () => {
    const mockOnChange = jest.fn()
    const { getByText } = render(<DatePicker onChange={mockOnChange} />)

    const applyButton = getByText('Apply')
    applyButton.click()

    expect(mockOnChange).toHaveBeenCalled()
  })
})
