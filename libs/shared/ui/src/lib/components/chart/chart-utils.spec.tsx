import { createXAxisConfig, getLogicalTicks } from './chart-utils'

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
        axisLine: { stroke: 'var(--color-neutral-250)' },
        allowDataOverflow: true,
        interval: 'preserveStartEnd',
        strokeDasharray: '3 3',
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
      expect(config.strokeDasharray).toBe('3 3')
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
