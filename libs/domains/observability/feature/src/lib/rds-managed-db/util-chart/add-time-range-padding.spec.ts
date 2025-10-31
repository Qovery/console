import { addTimeRangePadding } from './add-time-range-padding'

describe('addTimeRangePadding', () => {
  const mockChartData = [
    {
      timestamp: 1704067200000,
      time: '00:00:00',
      fullTime: 'Jan 1, 2024, 00:00:00',
      cpu: 50,
      memory: 100,
    },
    {
      timestamp: 1704067260000,
      time: '00:01:00',
      fullTime: 'Jan 1, 2024, 00:01:00',
      cpu: 75,
      memory: 150,
    },
  ]

  it('should return empty array when chartData is empty', () => {
    const result = addTimeRangePadding([], '0', '1000', false)
    expect(result).toEqual([])
  })

  it('should add padding points before and after data', () => {
    const result = addTimeRangePadding(mockChartData, '1704067180', '1704067320', false)

    expect(result.length).toBeGreaterThan(mockChartData.length)
    const timestamps = result.map((d) => d.timestamp).sort((a, b) => a - b)
    expect(timestamps[0]).toBeLessThan(mockChartData[0].timestamp)
    expect(timestamps[timestamps.length - 1]).toBeGreaterThan(mockChartData[mockChartData.length - 1].timestamp)
  })

  it('should fill gaps between existing data points', () => {
    const dataWithGap = [
      {
        timestamp: 1704067200000,
        time: '00:00:00',
        fullTime: 'Jan 1, 2024, 00:00:00',
        cpu: 50,
      },
      {
        timestamp: 1704067800000,
        time: '00:10:00',
        fullTime: 'Jan 1, 2024, 00:10:00',
        cpu: 75,
      },
    ]

    const result = addTimeRangePadding(dataWithGap, '1704067100', '1704067900', false)

    expect(result.length).toBeGreaterThan(dataWithGap.length)
    const timestamps = result.map((d) => d.timestamp).sort((a, b) => a - b)
    expect(timestamps).toEqual([...new Set(timestamps)])
  })

  it('should exclude specified keys from padding', () => {
    const result = addTimeRangePadding(mockChartData, '1704067180', '1704067320', false, ['cpu'])

    const paddingPoints = result.filter((d) => d.cpu === 0)
    expect(paddingPoints.length).toBeGreaterThan(0)

    const nonPaddingPoints = result.filter((d) => d.cpu !== 0 && d.cpu !== null)
    expect(nonPaddingPoints.length).toBe(2)
  })

  it('should use local time when useLocalTime is true', () => {
    const result = addTimeRangePadding(mockChartData, '1704067180', '1704067320', true)

    const paddingPoint = result.find((d) => !mockChartData.some((md) => md.timestamp === d.timestamp))
    expect(paddingPoint?.time).toBeDefined()
    expect(paddingPoint?.fullTime).toBeDefined()
    expect(paddingPoint?.fullTime).not.toContain('UTC')
  })

  it('should sort results by timestamp', () => {
    const result = addTimeRangePadding(mockChartData, '1704067180', '1704067320', false)

    const timestamps = result.map((d) => d.timestamp)
    const sortedTimestamps = [...timestamps].sort((a, b) => a - b)
    expect(timestamps).toEqual(sortedTimestamps)
  })

  it('should preserve existing data values', () => {
    const result = addTimeRangePadding(mockChartData, '1704067180', '1704067320', false)

    mockChartData.forEach((originalData) => {
      const foundData = result.find((d) => d.timestamp === originalData.timestamp)
      expect(foundData).toBeDefined()
      expect(foundData?.cpu).toBe(originalData.cpu)
      expect(foundData?.memory).toBe(originalData.memory)
    })
  })
})
