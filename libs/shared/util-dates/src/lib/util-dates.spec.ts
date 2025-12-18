import * as formatModule from 'date-fns-tz'
import {
  convertDatetoTimestamp,
  dateDifference,
  dateDifferenceMinutes,
  dateFullFormat,
  dateToFormat,
  dateToHours,
  dateYearMonthDayHourMinuteSecond,
  formatDuration,
  formatDurationMinutesSeconds,
  isDatePast,
  timeAgo,
} from './util-dates'

describe('util-dates', () => {
  const now = new Date('2023-08-30T12:00:00Z')
  const pastDate = new Date('2023-08-30T11:55:00Z')

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('dateDifferenceMinutes', () => {
    const result = dateDifferenceMinutes(now, pastDate)
    expect(result).toBe(5)
  })

  it('dateDifference', () => {
    const result = dateDifference(now, pastDate)
    expect(result).toBe('00:05:00')
  })

  it('dateToHours', () => {
    const result = dateToHours('2023-08-30T10:10:00Z')
    expect(result).toBe('10:10')
  })

  it('dateYearMonthDayHourMinuteSecond', () => {
    const result = dateYearMonthDayHourMinuteSecond(now, false)
    expect(result).toBe('2023-08-30')
  })

  it('dateFullFormat', () => {
    Date.now = jest.fn(() => new Date('2023-09-15T10:23:20').getTime())

    const mockFormatInTimeZone = jest.spyOn(formatModule, 'formatInTimeZone')
    mockFormatInTimeZone.mockImplementation(() => '15 Sep, 2023, 10:23:20')

    const resultDefault = dateFullFormat('2023-09-15T10:23:20')

    expect(resultDefault).toBe('15 Sep, 2023, 10:23:20')
  })

  it('dateToFormat', () => {
    const result = dateToFormat('2023-08-30T10:23:20Z', 'yyyy-MM-dd HH:mm:ss')
    expect(result).toBe('2023-08-30 10:23:20')
  })

  it('convertDatetoTimestamp', () => {
    const result = convertDatetoTimestamp('2023-08-30T10:23:20Z')
    expect(result).toBe(1693391000)
  })

  it('should format a duration with hours, minutes, and seconds correctly', () => {
    const result = formatDuration('PT2H30M15S')
    expect(result).toBe('02:30:15')
  })

  it('should format a duration with only minutes and seconds', () => {
    const result = formatDuration('PT45M20S')
    expect(result).toBe('00:45:20')
  })

  it('should format a duration with only seconds', () => {
    const result = formatDuration('PT50S')
    expect(result).toBe('00:00:50')
  })

  it('should format duration with minutes and seconds', () => {
    const result = formatDurationMinutesSeconds('PT32M13.659S')
    expect(result).toBe('32m 13s')
  })

  it('should convert hours to minutes in the output', () => {
    const result = formatDurationMinutesSeconds('PT1H32M13S')
    expect(result).toBe('92m 13s')
  })

  it('should handle duration with only seconds', () => {
    const result = formatDurationMinutesSeconds('PT45.5S')
    expect(result).toBe('45s')
  })

  it('should handle duration with only minutes', () => {
    const result = formatDurationMinutesSeconds('PT5M')
    expect(result).toBe('5m')
  })

  it('should handle duration with hours only', () => {
    const result = formatDurationMinutesSeconds('PT2H')
    expect(result).toBe('120m')
  })

  it('should handle complex duration with hours, minutes and fractional seconds', () => {
    const result = formatDurationMinutesSeconds('PT1H23M45.678S')
    expect(result).toBe('83m 45s')
  })
})

describe('timeAgo function', () => {
  it('should format time ago in compact format', () => {
    const now = new Date()
    const date = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    const result = timeAgo(date, true)
    expect(result).toBe('2h')
  })

  it('should format time ago in full format', () => {
    const now = new Date()
    const date = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    const result = timeAgo(date)
    expect(result).toBe('2 hours')
  })
})

describe('isDatePast', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2023-08-30T12:00:00Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should return true for dates in the past', () => {
    const pastDate = '2023-08-29T12:00:00Z' // Yesterday
    expect(isDatePast(pastDate)).toBe(true)
  })

  it('should return true for dates far in the past', () => {
    const pastDate = '2020-01-01T00:00:00Z'
    expect(isDatePast(pastDate)).toBe(true)
  })

  it('should return false for dates in the future', () => {
    const futureDate = '2023-08-31T12:00:00Z' // Tomorrow
    expect(isDatePast(futureDate)).toBe(false)
  })

  it('should return false for dates far in the future', () => {
    const futureDate = '2099-12-31T23:59:59Z'
    expect(isDatePast(futureDate)).toBe(false)
  })

  it('should return false for null date', () => {
    expect(isDatePast(null)).toBe(false)
  })

  it('should return false for undefined date', () => {
    expect(isDatePast(undefined)).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isDatePast('')).toBe(false)
  })

  it('should handle dates very close to current time', () => {
    // Test with a date 1 second in the past
    const pastDate = '2023-08-30T11:59:59Z'
    expect(isDatePast(pastDate)).toBe(true)

    // Test with a date 1 second in the future
    const futureDate = '2023-08-30T12:00:01Z'
    expect(isDatePast(futureDate)).toBe(false)
  })

  it('should handle tokens without expiration date (null) by returning false', () => {
    // AC-6: Tokens without expiration date should be treated as valid
    expect(isDatePast(null)).toBe(false)
  })

  it('should handle tokens without expiration date (undefined) by returning false', () => {
    // AC-6: Tokens without expiration date should be treated as valid
    expect(isDatePast(undefined)).toBe(false)
  })
})
