import { render } from '__tests__/utils/setup-jest'
import { DatePickerHeader } from './date-picker-header'

describe('DatePickerHeader', () => {
  const mockDate = new Date(2023, 4, 31) // May 31, 2023

  it('renders the correct month and year', () => {
    const { getByText } = render(
      <DatePickerHeader
        date={mockDate}
        decreaseMonth={jest.fn()}
        increaseMonth={jest.fn()}
        prevMonthButtonDisabled={false}
        nextMonthButtonDisabled={false}
      />
    )

    expect(getByText('May')).toBeInTheDocument()
    expect(getByText('2023')).toBeInTheDocument()
  })

  it('calls the decreaseMonth and increaseMonth functions when buttons are clicked', () => {
    const decreaseMonthMock = jest.fn()
    const increaseMonthMock = jest.fn()

    const { getByTestId } = render(
      <DatePickerHeader
        date={mockDate}
        decreaseMonth={decreaseMonthMock}
        increaseMonth={increaseMonthMock}
        prevMonthButtonDisabled={false}
        nextMonthButtonDisabled={false}
      />
    )

    getByTestId('date-picker-header-previous-btn').click()
    getByTestId('date-picker-header-next-btn').click()

    expect(decreaseMonthMock).toHaveBeenCalledTimes(1)
    expect(increaseMonthMock).toHaveBeenCalledTimes(1)
  })

  it('disables the buttons when prevMonthButtonDisabled or nextMonthButtonDisabled is true', () => {
    const { getByTestId } = render(
      <DatePickerHeader
        date={mockDate}
        decreaseMonth={jest.fn()}
        increaseMonth={jest.fn()}
        prevMonthButtonDisabled={true}
        nextMonthButtonDisabled={true}
      />
    )

    expect(getByTestId('date-picker-header-previous-btn')).toBeDisabled()
    expect(getByTestId('date-picker-header-next-btn')).toBeDisabled()
  })
})
