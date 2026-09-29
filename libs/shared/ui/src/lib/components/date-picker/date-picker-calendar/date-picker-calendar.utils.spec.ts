import { mergeDateWithTimeText, toCalendarDate } from './date-picker-calendar.utils'

describe('date-picker-calendar utils', () => {
  it('runs in a timezone ahead of UTC', () => {
    // Set by jest.global-setup.js; without an offset the UTC and local expectations below would coincide
    expect(new Date(2026, 0, 10).getTimezoneOffset()).toBe(-600)
  })

  describe('mergeDateWithTimeText', () => {
    // react-datepicker returns clicked days as local midnight
    const clickedDay = new Date(2026, 0, 10)

    it('keeps the picked day in UTC mode', () => {
      const result = mergeDateWithTimeText({ date: clickedDay, timeText: '08:30', useLocalTime: false })

      expect(result?.toISOString()).toBe('2026-01-10T08:30:00.000Z')
    })

    it('keeps the picked day in local mode', () => {
      const result = mergeDateWithTimeText({ date: clickedDay, timeText: '08:30', useLocalTime: true })

      expect(result?.toISOString()).toBe('2026-01-09T22:30:00.000Z')
    })

    it('gives different instants in UTC and local mode', () => {
      const utcResult = mergeDateWithTimeText({ date: clickedDay, timeText: '08:30', useLocalTime: false })
      const localResult = mergeDateWithTimeText({ date: clickedDay, timeText: '08:30', useLocalTime: true })

      expect(utcResult?.getTime()).not.toBe(localResult?.getTime())
    })
  })

  describe('toCalendarDate', () => {
    it('shows a UTC date on its UTC day and time', () => {
      const calendarDate = toCalendarDate(new Date('2026-01-10T02:00:00.000Z'), false)

      // 2026-01-10T02:00Z is 12:00 local at UTC+10, so this only passes if UTC components are used
      expect(calendarDate.getDate()).toBe(10)
      expect(calendarDate.getHours()).toBe(2)
    })

    it('returns the date unchanged in local mode', () => {
      const date = new Date('2026-01-10T02:00:00.000Z')

      expect(toCalendarDate(date, true)).toBe(date)
      expect(toCalendarDate(null, false)).toBeNull()
    })

    it('round-trips a UTC selection through the calendar', () => {
      const startDate = new Date('2026-01-10T02:00:00.000Z')

      const result = mergeDateWithTimeText({
        date: toCalendarDate(startDate, false),
        timeText: '02:00',
        useLocalTime: false,
      })

      expect(result?.toISOString()).toBe(startDate.toISOString())
    })
  })
})
