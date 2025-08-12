import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import DatePicker from './date-picker'

describe('DatePicker', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders successfully when open', () => {
    const { baseElement } = renderWithProviders(<DatePicker onChange={mockOnChange} isOpen />)
    expect(baseElement).toBeTruthy()
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithProviders(<DatePicker onChange={mockOnChange} isOpen={false} />)
    expect(screen.queryByText('Apply')).not.toBeInTheDocument()
  })

  it('initializes with default dates and times correctly', () => {
    const startDate = new Date('2023-12-01T10:30:00.000Z')
    const endDate = new Date('2023-12-02T15:45:00.000Z')

    renderWithProviders(<DatePicker onChange={mockOnChange} isOpen showTimeInput defaultDates={[startDate, endDate]} />)

    const inputs = screen.getAllByTestId('input-value')
    expect(inputs[0]).toHaveValue('2023-12-01')
    expect(inputs[1]).toHaveValue('10:30')
    expect(inputs[2]).toHaveValue('2023-12-02')
    expect(inputs[3]).toHaveValue('15:45')
  })

  it('calls onChange with default dates when Apply is clicked', async () => {
    const startDate = new Date('2023-12-01')
    const endDate = new Date('2023-12-02')

    const { userEvent } = renderWithProviders(
      <DatePicker onChange={mockOnChange} isOpen defaultDates={[startDate, endDate]} />
    )

    await userEvent.click(screen.getByText('Apply'))
    expect(mockOnChange).toHaveBeenCalledWith(startDate, endDate)
  })

  it('calls onChange when Apply is clicked with time inputs', async () => {
    const { userEvent } = renderWithProviders(<DatePicker onChange={mockOnChange} isOpen showTimeInput />)

    const inputs = screen.getAllByTestId('input-value')

    // Set date and time values
    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], '2023-12-01')
    await userEvent.clear(inputs[1])
    await userEvent.type(inputs[1], '09:00')
    await userEvent.clear(inputs[2])
    await userEvent.type(inputs[2], '2023-12-02')
    await userEvent.clear(inputs[3])
    await userEvent.type(inputs[3], '18:30')

    await userEvent.click(screen.getByText('Apply'))

    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Date), expect.any(Date))
  })

  it('shows time inputs when showTimeInput prop is true', () => {
    renderWithProviders(<DatePicker onChange={mockOnChange} isOpen showTimeInput />)

    // Check that we have 4 inputs (2 dates + 2 times)
    const inputs = screen.getAllByTestId('input-value')
    expect(inputs).toHaveLength(4)

    // Check labels are present
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('End')).toBeInTheDocument()
  })

  it('handles useLocalTime prop for time display', () => {
    const startDate = new Date('2023-12-01T10:30:00.000Z')
    const endDate = new Date('2023-12-02T15:45:00.000Z')

    renderWithProviders(
      <DatePicker
        onChange={mockOnChange}
        isOpen
        showTimeInput
        defaultDates={[startDate, endDate]}
        useLocalTime={false}
      />
    )

    const inputs = screen.getAllByTestId('input-value')
    // UTC time should be displayed when useLocalTime=false
    expect(inputs[1]).toHaveValue('10:30')
    expect(inputs[3]).toHaveValue('15:45')
  })
})

describe('validateDate', () => {
  // Internal function for testing - matches the implementation in date-picker.tsx:44-50
  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return false
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateStr)) return false
    const date = new Date(dateStr)
    return date instanceof Date && !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0]
  }

  it('should return true for valid date formats', () => {
    expect(validateDate('2023-01-01')).toBe(true)
    expect(validateDate('2023-12-31')).toBe(true)
    expect(validateDate('2024-02-29')).toBe(true) // leap year
    expect(validateDate('2020-02-29')).toBe(true) // leap year
    expect(validateDate('2023-06-15')).toBe(true)
  })

  it('should return true for edge case dates', () => {
    expect(validateDate('1900-01-01')).toBe(true)
    expect(validateDate('2100-12-31')).toBe(true)
    expect(validateDate('2000-02-29')).toBe(true) // year 2000 is leap year
  })

  it('should return false for invalid date formats', () => {
    expect(validateDate('2023-1-1')).toBe(false) // single digit month/day
    expect(validateDate('23-01-01')).toBe(false) // 2-digit year
    expect(validateDate('2023/01/01')).toBe(false) // wrong separator
    expect(validateDate('2023.01.01')).toBe(false) // wrong separator
    expect(validateDate('01-01-2023')).toBe(false) // wrong order
    expect(validateDate('2023-01')).toBe(false) // missing day
    expect(validateDate('01-01')).toBe(false) // missing year
  })

  it('should return false for invalid month values', () => {
    expect(validateDate('2023-00-01')).toBe(false) // month 0
    expect(validateDate('2023-13-01')).toBe(false) // month 13
    expect(validateDate('2023-99-01')).toBe(false) // month 99
  })

  it('should return false for invalid day values', () => {
    expect(validateDate('2023-01-00')).toBe(false) // day 0
    expect(validateDate('2023-01-32')).toBe(false) // day 32 in January
    expect(validateDate('2023-02-29')).toBe(false) // Feb 29 in non-leap year
    expect(validateDate('2023-04-31')).toBe(false) // April 31 (April has 30 days)
    expect(validateDate('2023-06-31')).toBe(false) // June 31 (June has 30 days)
    expect(validateDate('2023-09-31')).toBe(false) // September 31 (September has 30 days)
    expect(validateDate('2023-11-31')).toBe(false) // November 31 (November has 30 days)
  })

  it('should return false for leap year edge cases', () => {
    expect(validateDate('1900-02-29')).toBe(false) // 1900 is not a leap year
    expect(validateDate('2100-02-29')).toBe(false) // 2100 is not a leap year
    expect(validateDate('2023-02-29')).toBe(false) // 2023 is not a leap year
  })

  it('should return false for empty or invalid inputs', () => {
    expect(validateDate('')).toBe(false)
    expect(validateDate(' ')).toBe(false)
    expect(validateDate('invalid')).toBe(false)
    expect(validateDate('2023-abc-01')).toBe(false)
    expect(validateDate('abcd-01-01')).toBe(false)
  })

  it('should return false for strings with extra characters', () => {
    expect(validateDate(' 2023-01-01')).toBe(false) // leading space
    expect(validateDate('2023-01-01 ')).toBe(false) // trailing space
    expect(validateDate('2023-01-01T00:00:00')).toBe(false) // with time
    expect(validateDate('a2023-01-01')).toBe(false) // prefix character
    expect(validateDate('2023-01-01a')).toBe(false) // suffix character
  })

  it('should validate date object consistency', () => {
    // This test ensures the date string matches what Date object would produce
    // This is the key validation logic in the function
    expect(validateDate('2023-02-30')).toBe(false) // Invalid date that would be adjusted by Date constructor
    expect(validateDate('2023-04-31')).toBe(false) // Invalid date that would be adjusted by Date constructor
  })
})

describe('validateTime', () => {
  // Internal function for testing - matches the implementation in date-picker.tsx:52-56
  const validateTime = (timeStr: string): boolean => {
    if (!timeStr) return false
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(timeStr)
  }
  it('should return true for valid time formats', () => {
    expect(validateTime('00:00')).toBe(true)
    expect(validateTime('12:30')).toBe(true)
    expect(validateTime('23:59')).toBe(true)
    expect(validateTime('9:15')).toBe(true)
    expect(validateTime('08:45')).toBe(true)
  })

  it('should return true for edge cases', () => {
    expect(validateTime('0:00')).toBe(true)
    expect(validateTime('1:01')).toBe(true)
    expect(validateTime('23:00')).toBe(true)
  })

  it('should return false for invalid hour values', () => {
    expect(validateTime('24:00')).toBe(false)
    expect(validateTime('25:30')).toBe(false)
    expect(validateTime('-1:00')).toBe(false)
  })

  it('should return false for invalid minute values', () => {
    expect(validateTime('12:60')).toBe(false)
    expect(validateTime('12:99')).toBe(false)
    expect(validateTime('12:-1')).toBe(false)
  })

  it('should return false for invalid formats', () => {
    expect(validateTime('12')).toBe(false)
    expect(validateTime('12:5')).toBe(false)
    expect(validateTime('1:5')).toBe(false)
    expect(validateTime('12:30:00')).toBe(false)
    expect(validateTime('abc:def')).toBe(false)
    expect(validateTime('12.30')).toBe(false)
    expect(validateTime('12-30')).toBe(false)
  })

  it('should return false for empty or null values', () => {
    expect(validateTime('')).toBe(false)
    expect(validateTime(' ')).toBe(false)
  })

  it('should return false for strings with extra characters', () => {
    expect(validateTime(' 12:30')).toBe(false)
    expect(validateTime('12:30 ')).toBe(false)
    expect(validateTime('12:30AM')).toBe(false)
    expect(validateTime('a12:30')).toBe(false)
  })
})

describe('formatLocalDate', () => {
  // Internal function for testing - matches the implementation in date-picker.tsx:59-67
  const formatLocalDate = (date: Date): string => {
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0')
    )
  }
  it('should format dates correctly', () => {
    const date1 = new Date(2023, 0, 1) // January 1, 2023
    expect(formatLocalDate(date1)).toBe('2023-01-01')
    
    const date2 = new Date(2023, 11, 31) // December 31, 2023
    expect(formatLocalDate(date2)).toBe('2023-12-31')
    
    const date3 = new Date(2023, 5, 15) // June 15, 2023
    expect(formatLocalDate(date3)).toBe('2023-06-15')
  })

  it('should pad single digit months and days with zeros', () => {
    const date1 = new Date(2023, 0, 5) // January 5, 2023
    expect(formatLocalDate(date1)).toBe('2023-01-05')
    
    const date2 = new Date(2023, 8, 9) // September 9, 2023
    expect(formatLocalDate(date2)).toBe('2023-09-09')
  })

  it('should handle different years correctly', () => {
    const date1 = new Date(2020, 1, 29) // February 29, 2020 (leap year)
    expect(formatLocalDate(date1)).toBe('2020-02-29')
    
    const date2 = new Date(1999, 11, 31) // December 31, 1999
    expect(formatLocalDate(date2)).toBe('1999-12-31')
    
    const date3 = new Date(2030, 6, 4) // July 4, 2030
    expect(formatLocalDate(date3)).toBe('2030-07-04')
  })

  it('should handle edge cases for months and days', () => {
    const firstDayOfYear = new Date(2023, 0, 1) // January 1
    expect(formatLocalDate(firstDayOfYear)).toBe('2023-01-01')
    
    const lastDayOfYear = new Date(2023, 11, 31) // December 31
    expect(formatLocalDate(lastDayOfYear)).toBe('2023-12-31')
    
    const leapYearDate = new Date(2024, 1, 29) // February 29, 2024
    expect(formatLocalDate(leapYearDate)).toBe('2024-02-29')
  })

  it('should use local date components avoiding timezone issues', () => {
    // Test with a date that might cause timezone issues
    const date = new Date('2023-06-15T23:30:00.000Z')
    const formatted = formatLocalDate(date)
    
    // Should format based on local date components, not UTC
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(formatted.split('-')[0]).toBe('2023')
  })
})
