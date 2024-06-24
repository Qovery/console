import { fireEvent, renderWithProviders, screen } from '@qovery/shared/util-tests'
import DatePicker from './date-picker'

describe('DatePicker', () => {
  it('should render successfully', () => {
    const mockOnChange = jest.fn()
    const { baseElement } = renderWithProviders(<DatePicker onChange={mockOnChange} isOpen />)
    expect(baseElement).toBeTruthy()
  })

  it('calls onChange with selected dates when Apply button is clicked', () => {
    const mockOnChange = jest.fn()
    const { getByText } = renderWithProviders(<DatePicker onChange={mockOnChange} isOpen />)

    const applyButton = getByText('Apply')
    applyButton.click()

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('calls onChange function with selected times when Apply button is clicked', () => {
    const mockOnChange = jest.fn()
    renderWithProviders(<DatePicker onChange={mockOnChange} isOpen showTimeInput />)

    const startTime = '09:00'
    const endTime = '18:30'

    fireEvent.change(screen.getAllByTestId('input-text')[0], { target: { value: startTime } })
    fireEvent.change(screen.getAllByTestId('input-text')[1], { target: { value: endTime } })
    fireEvent.click(screen.getByText('Apply'))

    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Date), expect.any(Date))

    const [startDateTime, endDateTime] = mockOnChange.mock.calls[0]
    expect(startDateTime.getHours()).toBe(9)
    expect(startDateTime.getMinutes()).toBe(0)
    expect(endDateTime.getHours()).toBe(18)
    expect(endDateTime.getMinutes()).toBe(30)
  })
})
