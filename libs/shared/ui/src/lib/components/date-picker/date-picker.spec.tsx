import { fireEvent, render } from '__tests__/utils/setup-jest'
import DatePicker from './date-picker'

describe('DatePicker', () => {
  it('should render successfully', () => {
    const mockOnChange = jest.fn()
    const { baseElement } = render(<DatePicker onChange={mockOnChange} isOpen />)
    expect(baseElement).toBeTruthy()
  })

  it('calls onChange with selected dates when Apply button is clicked', () => {
    const mockOnChange = jest.fn()
    const { getByText } = render(<DatePicker onChange={mockOnChange} isOpen />)

    const applyButton = getByText('Apply')
    applyButton.click()

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('calls onChange function with selected times when Apply button is clicked', () => {
    const mockOnChange = jest.fn()
    const { getByText, getAllByTestId } = render(<DatePicker onChange={mockOnChange} isOpen showTimeInput />)

    const startTime = '09:00'
    const endTime = '18:30'

    fireEvent.change(getAllByTestId('input-text')[0], { target: { value: startTime } })
    fireEvent.change(getAllByTestId('input-text')[1], { target: { value: endTime } })
    fireEvent.click(getByText('Apply'))

    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Date), expect.any(Date))

    const [startDateTime, endDateTime] = mockOnChange.mock.calls[0]
    expect(startDateTime.getHours()).toBe(9)
    expect(startDateTime.getMinutes()).toBe(0)
    expect(endDateTime.getHours()).toBe(18)
    expect(endDateTime.getMinutes()).toBe(30)
  })

  it('calls onChange with selected dates when a date range is selected', () => {
    const mockOnChange = jest.fn()
    const { getByText } = render(<DatePicker onChange={mockOnChange} isOpen />)

    const expectedStartDate = new Date(2023, 5, 15)
    const expectedEndDate = new Date(2023, 5, 20)

    fireEvent.click(getByText('15'))
    fireEvent.click(getByText('20'))
    fireEvent.click(getByText('Apply'))

    const [receivedStartDate, receivedEndDate] = mockOnChange.mock.calls[0]

    // reset hours to 0 to avoid timezone and test only the date
    expectedStartDate.setHours(0, 0, 0, 0)
    expectedEndDate.setHours(0, 0, 0, 0)
    receivedStartDate.setHours(0, 0, 0, 0)
    receivedEndDate.setHours(0, 0, 0, 0)

    expect(receivedStartDate).toEqual(expectedStartDate)
    expect(receivedEndDate).toEqual(expectedEndDate)
  })
})
