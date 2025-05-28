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
  timeAgo,
} from './util-dates'

describe('util-dates', () => {
  const now = new Date('2023-08-30T12:00:00Z')
  const pastDate = new Date('2023-08-30T11:55:00Z')

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
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

  it('should format time ago in compact format', () => {
    const date = new Date()
    date.setHours(date.getHours() - 2)
    const result = timeAgo(date, true)
    expect(result).toBe('2h')
  })

  it('should format time ago in full format', () => {
    const date = new Date()
    date.setHours(date.getHours() - 2)
    const result = timeAgo(date)
    expect(result).toBe('2 hours')
  })
})
