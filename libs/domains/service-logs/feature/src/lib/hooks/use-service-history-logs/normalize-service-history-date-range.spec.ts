import { normalizeServiceHistoryDateRange } from './normalize-service-history-date-range'

describe('normalizeServiceHistoryDateRange', () => {
  const now = new Date('2026-07-13T12:00:00.000Z')

  it('expands identical dates into a one-hour range', () => {
    const date = new Date('2026-07-13T10:00:00.000Z')

    const result = normalizeServiceHistoryDateRange(date, date, now)

    expect(result).toEqual({
      startDate: new Date('2026-07-13T09:30:00.000Z'),
      endDate: new Date('2026-07-13T10:30:00.000Z'),
    })
  })

  it('caps the end date to the current time', () => {
    const date = new Date('2026-07-13T12:00:00.000Z')

    const result = normalizeServiceHistoryDateRange(date, date, now)

    expect(result).toEqual({
      startDate: new Date('2026-07-13T11:00:00.000Z'),
      endDate: now,
    })
  })

  it('keeps different dates unchanged', () => {
    const startDate = new Date('2026-07-13T10:00:00.000Z')
    const endDate = new Date('2026-07-13T11:00:00.000Z')

    const result = normalizeServiceHistoryDateRange(startDate, endDate, now)

    expect(result).toEqual({ startDate, endDate })
  })

  it('keeps an incomplete range unchanged', () => {
    const startDate = new Date('2026-07-13T10:00:00.000Z')

    const result = normalizeServiceHistoryDateRange(startDate, undefined, now)

    expect(result).toEqual({ startDate, endDate: undefined })
  })
})
