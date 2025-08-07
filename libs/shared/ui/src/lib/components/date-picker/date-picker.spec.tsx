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
    const startDate = new Date('2023-12-01')
    const endDate = new Date('2023-12-02')
    const { getByText } = renderWithProviders(
      <DatePicker onChange={mockOnChange} isOpen defaultDates={[startDate, endDate]} />
    )

    const applyButton = getByText('Apply')
    applyButton.click()

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('calls onChange function with selected times when Apply button is clicked', () => {
    const mockOnChange = jest.fn()
    renderWithProviders(<DatePicker onChange={mockOnChange} isOpen showTimeInput />)

    const startDate = '2023-12-01'
    const startTime = '09:00'
    const endDate = '2023-12-02'
    const endTime = '18:30'

    // Update the 4 input fields: start date, start time, end date, end time
    const inputs = screen.getAllByTestId('input-text')
    fireEvent.change(inputs[0], { target: { value: startDate } })
    fireEvent.change(inputs[1], { target: { value: startTime } })
    fireEvent.change(inputs[2], { target: { value: endDate } })
    fireEvent.change(inputs[3], { target: { value: endTime } })

    fireEvent.click(screen.getByText('Apply'))

    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Date), expect.any(Date))

    const [startDateTime, endDateTime] = mockOnChange.mock.calls[0]
    expect(startDateTime.getHours()).toBe(9)
    expect(startDateTime.getMinutes()).toBe(0)
    expect(endDateTime.getHours()).toBe(18)
    expect(endDateTime.getMinutes()).toBe(30)
  })
})
