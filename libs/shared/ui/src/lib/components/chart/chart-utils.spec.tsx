import { createXAxisConfig, formatTimestampForDisplay, getLogicalTicks, getTimeGranularity } from './chart-utils'

describe('getLogicalTicks', () => {
  it('generates correct number of ticks for default count', () => {
    const startTimestamp = 1704067200 // Jan 1, 2024 00:00:00 UTC (in seconds)
    const endTimestamp = 1704070800 // Jan 1, 2024 01:00:00 UTC (in seconds)

    const ticks = getLogicalTicks(startTimestamp, endTimestamp)

    expect(ticks).toHaveLength(6)
    expect(ticks[0]).toBe(startTimestamp * 1000)
    expect(ticks[ticks.length - 1]).toBe(endTimestamp * 1000)
  })

  it('generates correct number of ticks for custom count', () => {
    const startTimestamp = 1704067200
    const endTimestamp = 1704070800
    const tickCount = 4

    const ticks = getLogicalTicks(startTimestamp, endTimestamp, tickCount)

    expect(ticks).toHaveLength(4)
    expect(ticks[0]).toBe(startTimestamp * 1000)
    expect(ticks[ticks.length - 1]).toBe(endTimestamp * 1000)
  })

  it('generates evenly spaced ticks', () => {
    const startTimestamp = 1704067200
    const endTimestamp = 1704070800
    const tickCount = 5

    const ticks = getLogicalTicks(startTimestamp, endTimestamp, tickCount)
    const expectedInterval = ((endTimestamp - startTimestamp) * 1000) / (tickCount - 1)

    for (let i = 1; i < ticks.length; i++) {
      const actualInterval = ticks[i] - ticks[i - 1]
      expect(actualInterval).toBe(expectedInterval)
    }
  })

  it('handles single tick correctly', () => {
    const startTimestamp = 1704067200
    const endTimestamp = 1704070800

    const ticks = getLogicalTicks(startTimestamp, endTimestamp, 1)

    expect(ticks).toHaveLength(1)
    // With tickCount = 1, interval becomes Infinity, resulting in NaN
    expect(ticks[0]).toBeNaN()
  })

  it('handles zero duration correctly', () => {
    const timestamp = 1704067200

    const ticks = getLogicalTicks(timestamp, timestamp)

    expect(ticks).toHaveLength(6)
    ticks.forEach((tick: number) => {
      expect(tick).toBe(timestamp * 1000)
    })
  })

  it('handles negative duration', () => {
    const startTimestamp = 1704070800
    const endTimestamp = 1704067200

    const ticks = getLogicalTicks(startTimestamp, endTimestamp)

    expect(ticks).toHaveLength(6)
    expect(ticks[0]).toBe(startTimestamp * 1000)
    expect(ticks[ticks.length - 1]).toBe(endTimestamp * 1000)
    // Should have decreasing values
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i]).toBeLessThan(ticks[i - 1])
    }
  })

  it('handles zero tick count', () => {
    const startTimestamp = 1704067200
    const endTimestamp = 1704070800

    const ticks = getLogicalTicks(startTimestamp, endTimestamp, 0)

    expect(ticks).toHaveLength(0)
  })

  it('handles large tick count', () => {
    const startTimestamp = 1704067200
    const endTimestamp = 1704070800
    const tickCount = 100

    const ticks = getLogicalTicks(startTimestamp, endTimestamp, tickCount)

    expect(ticks).toHaveLength(100)
    expect(ticks[0]).toBe(startTimestamp * 1000)
    expect(ticks[ticks.length - 1]).toBe(endTimestamp * 1000)
  })
})

describe('createXAxisConfig', () => {
  const startTimestamp = 1704067200
  const endTimestamp = 1704070800

  describe('default configuration', () => {
    it('creates config with default values', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp)

      expect(config).toEqual({
        dataKey: 'timestamp',
        type: 'number',
        scale: 'time',
        domain: [startTimestamp * 1000, endTimestamp * 1000],
        ticks: getLogicalTicks(startTimestamp, endTimestamp, 6),
        tick: { fontSize: 12, fill: 'var(--color-neutral-350)' },
        tickLine: { stroke: 'transparent' },
        axisLine: { stroke: 'var(--color-neutral-200)' },
        allowDataOverflow: true,
        interval: 'preserveStartEnd',
      })
    })

    it('uses default tick count of 6', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp)

      expect(config.ticks).toHaveLength(6)
    })
  })

  describe('custom options', () => {
    it('applies custom axisLineColor', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp, {
        axisLineColor: '#ff0000',
      })

      expect(config.axisLine.stroke).toBe('#ff0000')
    })

    it('applies custom tickColor', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp, {
        tickColor: '#00ff00',
      })

      expect(config.tick.fill).toBe('#00ff00')
    })

    it('applies custom tickCount', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp, {
        tickCount: 10,
      })

      expect(config.ticks).toHaveLength(10)
    })

    it('applies all custom options together', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp, {
        axisLineColor: '#ff0000',
        tickColor: '#00ff00',
        tickCount: 8,
      })

      expect(config.axisLine.stroke).toBe('#ff0000')
      expect(config.tick.fill).toBe('#00ff00')
      expect(config.ticks).toHaveLength(8)
    })
  })

  describe('domain calculation', () => {
    it('converts timestamps to milliseconds for domain', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp)

      expect(config.domain).toEqual([startTimestamp * 1000, endTimestamp * 1000])
    })

    it('handles equal start and end timestamps', () => {
      const config = createXAxisConfig(startTimestamp, startTimestamp)

      expect(config.domain).toEqual([startTimestamp * 1000, startTimestamp * 1000])
    })

    it('handles reversed timestamps', () => {
      const config = createXAxisConfig(endTimestamp, startTimestamp)

      expect(config.domain).toEqual([endTimestamp * 1000, startTimestamp * 1000])
    })
  })

  describe('ticks generation', () => {
    it('generates ticks using getLogicalTicks function', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp, { tickCount: 5 })
      const expectedTicks = getLogicalTicks(startTimestamp, endTimestamp, 5)

      expect(config.ticks).toEqual(expectedTicks)
    })
  })

  describe('fixed configuration properties', () => {
    it('always sets correct fixed properties', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp)

      expect(config.dataKey).toBe('timestamp')
      expect(config.type).toBe('number')
      expect(config.scale).toBe('time')
      expect(config.tick.fontSize).toBe(12)
      expect(config.tickLine.stroke).toBe('transparent')
      expect(config.allowDataOverflow).toBe(true)
      expect(config.interval).toBe('preserveStartEnd')
    })
  })

  describe('edge cases', () => {
    it('handles zero timestamps', () => {
      const config = createXAxisConfig(0, 0)

      expect(config.domain).toEqual([0, 0])
      expect(config.ticks).toHaveLength(6)
    })

    it('handles very large timestamps', () => {
      const largeStart = 9999999999
      const largeEnd = 9999999999 + 3600

      const config = createXAxisConfig(largeStart, largeEnd)

      expect(config.domain).toEqual([largeStart * 1000, largeEnd * 1000])
      expect(config.ticks[0]).toBe(largeStart * 1000)
      expect(config.ticks[config.ticks.length - 1]).toBe(largeEnd * 1000)
    })
  })
})

describe('getTimeGranularity', () => {
  describe('seconds granularity (< 10 minutes)', () => {
    it('returns "seconds" for 1 minute duration', () => {
      const startTime = 1704067200000 // Jan 1, 2024 00:00:00 UTC
      const endTime = startTime + 60 * 1000 // 1 minute later

      expect(getTimeGranularity(startTime, endTime)).toBe('seconds')
    })

    it('returns "seconds" for 5 minutes duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 5 * 60 * 1000 // 5 minutes later

      expect(getTimeGranularity(startTime, endTime)).toBe('seconds')
    })

    it('returns "seconds" for exactly 9.5 minutes duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 9.5 * 60 * 1000 // 9.5 minutes later

      expect(getTimeGranularity(startTime, endTime)).toBe('seconds')
    })
  })

  describe('minutes granularity (< 24 hours)', () => {
    it('returns "minutes" for exactly 10 minutes duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 10 * 60 * 1000 // 10 minutes later

      expect(getTimeGranularity(startTime, endTime)).toBe('minutes')
    })

    it('returns "minutes" for 1 hour duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 60 * 60 * 1000 // 1 hour later

      expect(getTimeGranularity(startTime, endTime)).toBe('minutes')
    })

    it('returns "minutes" for 12 hours duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 12 * 60 * 60 * 1000 // 12 hours later

      expect(getTimeGranularity(startTime, endTime)).toBe('minutes')
    })

    it('returns "minutes" for exactly 23.9 hours duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 23.9 * 60 * 60 * 1000 // 23.9 hours later

      expect(getTimeGranularity(startTime, endTime)).toBe('minutes')
    })
  })

  describe('days granularity (≥ 24 hours)', () => {
    it('returns "days" for exactly 24 hours duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 24 * 60 * 60 * 1000 // 24 hours later

      expect(getTimeGranularity(startTime, endTime)).toBe('days')
    })

    it('returns "days" for 2 days duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 2 * 24 * 60 * 60 * 1000 // 2 days later

      expect(getTimeGranularity(startTime, endTime)).toBe('days')
    })

    it('returns "days" for 1 week duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 7 * 24 * 60 * 60 * 1000 // 1 week later

      expect(getTimeGranularity(startTime, endTime)).toBe('days')
    })

    it('returns "days" for 1 month duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 30 * 24 * 60 * 60 * 1000 // 30 days later

      expect(getTimeGranularity(startTime, endTime)).toBe('days')
    })

    it('returns "days" for 1 year duration', () => {
      const startTime = 1704067200000
      const endTime = startTime + 365 * 24 * 60 * 60 * 1000 // 1 year later

      expect(getTimeGranularity(startTime, endTime)).toBe('days')
    })
  })

  describe('boundary conditions', () => {
    it('handles zero duration', () => {
      const timestamp = 1704067200000

      expect(getTimeGranularity(timestamp, timestamp)).toBe('seconds')
    })

    it('handles very small duration (1 second)', () => {
      const startTime = 1704067200000
      const endTime = startTime + 1000 // 1 second later

      expect(getTimeGranularity(startTime, endTime)).toBe('seconds')
    })

    it('handles exact 10-minute boundary', () => {
      const startTime = 1704067200000
      const endTime = startTime + 10 * 60 * 1000 // exactly 10 minutes

      expect(getTimeGranularity(startTime, endTime)).toBe('minutes')
    })

    it('handles exact 24-hour boundary', () => {
      const startTime = 1704067200000
      const endTime = startTime + 24 * 60 * 60 * 1000 // exactly 24 hours

      expect(getTimeGranularity(startTime, endTime)).toBe('days')
    })
  })

  describe('realistic use cases', () => {
    it('handles "last 2 days" selection (48 hours)', () => {
      const startTime = 1704067200000
      const endTime = startTime + 48 * 60 * 60 * 1000 // 48 hours later

      expect(getTimeGranularity(startTime, endTime)).toBe('days')
    })

    it('handles "last 6 hours" selection', () => {
      const startTime = 1704067200000
      const endTime = startTime + 6 * 60 * 60 * 1000 // 6 hours later

      expect(getTimeGranularity(startTime, endTime)).toBe('minutes')
    })

    it('handles zoomed-in 5-minute window', () => {
      const startTime = 1704067200000
      const endTime = startTime + 5 * 60 * 1000 // 5 minutes later

      expect(getTimeGranularity(startTime, endTime)).toBe('seconds')
    })

    it('handles zoomed-in 30-second window', () => {
      const startTime = 1704067200000
      const endTime = startTime + 30 * 1000 // 30 seconds later

      expect(getTimeGranularity(startTime, endTime)).toBe('seconds')
    })
  })

  describe('edge cases', () => {
    it('handles reversed time range', () => {
      const startTime = 1704067200000
      const endTime = startTime + 60 * 60 * 1000 // 1 hour later

      // Test with reversed parameters (negative duration)
      expect(getTimeGranularity(endTime, startTime)).toBe('minutes')
    })

    it('handles very large time ranges', () => {
      const startTime = 1704067200000
      const endTime = startTime + 10 * 365 * 24 * 60 * 60 * 1000 // 10 years later

      expect(getTimeGranularity(startTime, endTime)).toBe('days')
    })
  })
})

describe('formatTimestampForDisplay', () => {
  const testTimestamp = 1704067200000 // Jan 1, 2024 00:00:00 UTC

  describe('UTC time formatting', () => {
    it('formats UTC time correctly when useLocalTime is false', () => {
      const result = formatTimestampForDisplay(testTimestamp, false)

      expect(result).toBe('Jan 1, 2024, 00:00:00 UTC')
    })

    it('handles different UTC times correctly', () => {
      const noonTimestamp = 1704096000000 // Jan 1, 2024 12:00:00 UTC
      const result = formatTimestampForDisplay(noonTimestamp, false)

      expect(result).toBe('Jan 1, 2024, 08:00:00 UTC')
    })

    it('handles string timestamps for UTC', () => {
      const result = formatTimestampForDisplay('1704067200000', false)

      expect(result).toBe('Jan 1, 2024, 00:00:00 UTC')
    })
  })

  describe('local time formatting', () => {
    it('formats local time correctly when useLocalTime is true', () => {
      const result = formatTimestampForDisplay(testTimestamp, true)

      // The exact format depends on the user's timezone, so we check for key elements
      expect(result).toMatch(/Jan 1, 2024/)
      expect(result).toMatch(/00:00:00/)
      expect(result).not.toContain('UTC')
    })

    it('handles string timestamps for local time', () => {
      const result = formatTimestampForDisplay('1704067200000', true)

      // The exact format depends on the user's timezone, so we check for key elements
      expect(result).toMatch(/Jan 1, 2024/)
      expect(result).toMatch(/00:00:00/)
      expect(result).not.toContain('UTC')
    })
  })

  describe('edge cases', () => {
    it('handles zero timestamp', () => {
      const result = formatTimestampForDisplay(0, false)

      expect(result).toBe('Jan 1, 1970, 00:00:00 UTC')
    })

    it('handles negative timestamp', () => {
      const result = formatTimestampForDisplay(-1000, false)

      expect(result).toBe('Dec 31, 1969, 23:59:59 UTC')
    })

    it('handles very large timestamp', () => {
      const largeTimestamp = 9999999999999 // Far future date
      const result = formatTimestampForDisplay(largeTimestamp, false)

      expect(result).toMatch(/UTC$/)
      expect(result).toMatch(/^\w{3} \d{1,2}, \d{4}, \d{2}:\d{2}:\d{2} UTC$/)
    })

    it('handles invalid string timestamp gracefully', () => {
      const result = formatTimestampForDisplay('invalid', false)

      expect(result).toBe('undefined NaN, NaN, NaN:NaN:NaN UTC')
    })
  })

  describe('month abbreviations', () => {
    it('uses correct month abbreviations for different months', () => {
      const months = [
        { timestamp: 1704067200000, expected: 'Jan' }, // January
        { timestamp: 1711929600000, expected: 'Apr' }, // April 1
        { timestamp: 1714521600000, expected: 'May' }, // May 1
        { timestamp: 1717200000000, expected: 'Jun' }, // June 1
        { timestamp: 1719792000000, expected: 'Jul' }, // July 1
        { timestamp: 1722470400000, expected: 'Aug' }, // August 1
        { timestamp: 1725148800000, expected: 'Sep' }, // September 1
        { timestamp: 1727740800000, expected: 'Oct' }, // October 1
        { timestamp: 1730419200000, expected: 'Nov' }, // November 1
        { timestamp: 1733011200000, expected: 'Dec' }, // December 1
      ]

      months.forEach(({ timestamp, expected }) => {
        const result = formatTimestampForDisplay(timestamp, false)
        expect(result).toContain(expected)
      })
    })
  })
})
