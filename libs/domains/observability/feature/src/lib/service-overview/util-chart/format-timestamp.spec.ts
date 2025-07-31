import { formatTimestamp } from './format-timestamp'

describe('formatTimestamp', () => {
  const testTimestamp = 1704067200000 // January 1, 2024, 00:00:00 UTC

  it('should format timestamp with UTC time when useLocalTime is false', () => {
    const result = formatTimestamp(testTimestamp, false)

    expect(result.timeString).toBe('00:00:00')
    expect(result.fullTimeString).toBe('Jan 1, 2024, 00:00:00 UTC')
  })

  it('should format timestamp with local time when useLocalTime is true', () => {
    const result = formatTimestamp(testTimestamp, true)

    expect(result.timeString).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    expect(result.fullTimeString).toMatch(/^Jan \d{1,2}, 2024, \d{2}:\d{2}:\d{2}$/)
    expect(result.fullTimeString).not.toContain('UTC')
  })

  it('should use 24-hour format for time strings', () => {
    const afternoonTimestamp = 1704081600000 // January 1, 2024, 04:00:00 UTC
    const result = formatTimestamp(afternoonTimestamp, false)

    expect(result.timeString).toBe('04:00:00')
    expect(result.timeString).not.toContain('AM')
    expect(result.timeString).not.toContain('PM')
  })

  it('should handle different timestamps correctly', () => {
    const timestamps = [
      1704067200000, // Jan 1, 2024, 00:00:00 UTC
      1704153600000, // Jan 2, 2024, 00:00:00 UTC
      1704240000000, // Jan 3, 2024, 00:00:00 UTC
    ]

    timestamps.forEach((timestamp) => {
      const result = formatTimestamp(timestamp, false)
      expect(result.timeString).toMatch(/^\d{2}:\d{2}:\d{2}$/)
      expect(result.fullTimeString).toMatch(/^Jan \d{1,2}, 2024, \d{2}:\d{2}:\d{2} UTC$/)
    })
  })

  it('should format seconds correctly', () => {
    const timestampWithSeconds = 1704067245000 // January 1, 2024, 00:00:45 UTC
    const result = formatTimestamp(timestampWithSeconds, false)

    expect(result.timeString).toBe('00:00:45')
    expect(result.fullTimeString).toBe('Jan 1, 2024, 00:00:45 UTC')
  })

  it('should format minutes correctly', () => {
    const timestampWithMinutes = 1704067805000 // January 1, 2024, 00:10:05 UTC
    const result = formatTimestamp(timestampWithMinutes, false)

    expect(result.timeString).toBe('00:10:05')
    expect(result.fullTimeString).toBe('Jan 1, 2024, 00:10:05 UTC')
  })

  it('should return consistent format structure', () => {
    const result = formatTimestamp(testTimestamp, false)

    expect(result).toHaveProperty('timeString')
    expect(result).toHaveProperty('fullTimeString')
    expect(typeof result.timeString).toBe('string')
    expect(typeof result.fullTimeString).toBe('string')
  })
})
