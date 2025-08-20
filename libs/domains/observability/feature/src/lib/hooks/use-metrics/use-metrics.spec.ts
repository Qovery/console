import { calculateDynamicRange } from './use-metrics'

describe('calculateDynamicRange', () => {
  it('should return 30000ms for 1 hour duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704070800' // Jan 1, 2024 01:00:00 (1 hour)

    expect(calculateDynamicRange(startTimestamp, endTimestamp)).toBe('30000ms')
  })

  it('should return 600000ms for 23 hours duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704150000' // Jan 1, 2024 23:00:00 (23 hours)

    expect(calculateDynamicRange(startTimestamp, endTimestamp)).toBe('600000ms')
  })

  it('should return 600000ms for 24 hours duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704153600' // Jan 2, 2024 00:00:00 (24 hours)

    expect(calculateDynamicRange(startTimestamp, endTimestamp)).toBe('600000ms')
  })

  it('should return 1800000ms for 48 hours duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704240000' // Jan 3, 2024 00:00:00 (48 hours)

    expect(calculateDynamicRange(startTimestamp, endTimestamp)).toBe('1800000ms')
  })

  it('should return 7200000ms for 7 days duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704672000' // Jan 8, 2024 00:00:00 (7 days)

    expect(calculateDynamicRange(startTimestamp, endTimestamp)).toBe('7200000ms')
  })

  it('should return 21600000ms for 30 days duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1706659200' // Jan 31, 2024 00:00:00 (30 days)

    expect(calculateDynamicRange(startTimestamp, endTimestamp)).toBe('21600000ms')
  })

  it('should return 21600000ms for 60 days duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1709251200' // Mar 1, 2024 00:00:00 (60 days)

    expect(calculateDynamicRange(startTimestamp, endTimestamp)).toBe('21600000ms')
  })

  it('should apply offset multiplier', () => {
    const startTimestamp = '1704067200'
    const endTimestamp = '1704070800'
    const offsetMultiplier = 5

    expect(calculateDynamicRange(startTimestamp, endTimestamp, offsetMultiplier)).toBe('30500ms')
  })

  it('should handle edge case: exactly 12 hours', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704110400' // Jan 1, 2024 12:00:00 (exactly 12 hours)

    expect(calculateDynamicRange(startTimestamp, endTimestamp)).toBe('300000ms')
  })

  it('should handle edge case: exactly 24 hours', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704153600' // Jan 2, 2024 00:00:00 (exactly 24 hours)

    expect(calculateDynamicRange(startTimestamp, endTimestamp)).toBe('600000ms')
  })
})
