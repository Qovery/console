import * as formatModule from 'date-fns-tz'
import {
  convertDatetoTimestamp,
  dateDifference,
  dateDifferenceMinutes,
  dateFullFormat,
  dateToFormat,
  dateToHours,
  dateYearMonthDayHourMinuteSecond,
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
})
