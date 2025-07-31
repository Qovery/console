import { type MetricData } from '../../hooks/use-metrics/use-metrics'
import { processMetricsData } from './process-metrics-data'

describe('processMetricsData', () => {
  const mockMetricData: MetricData = {
    metric: {
      container: 'test-container',
      cpu: '0',
      endpoint: 'test-endpoint',
      id: 'test-id',
      image: 'test-image',
      instance: 'test-instance',
      job: 'test-job',
      metrics_path: '/metrics',
      name: 'test-name',
      namespace: 'test-namespace',
      node: 'test-node',
      pod: 'test-pod',
      prometheus: 'test-prometheus',
      service: 'test-service',
    },
    values: [
      [1704067200, '50.5'],
      [1704067260, '75.2'],
      [1704067320, '25.8'],
    ],
  }

  const mockMetricsResponse = {
    data: {
      result: [mockMetricData],
    },
  }

  let timeSeriesMap: Map<
    number,
    { timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }
  >

  beforeEach(() => {
    timeSeriesMap = new Map()
  })

  it('should process metrics data and populate timeSeriesMap', () => {
    processMetricsData(
      mockMetricsResponse,
      timeSeriesMap,
      (series, index) => `series-${index}`,
      (value) => parseFloat(value),
      false
    )

    expect(timeSeriesMap.size).toBe(3)
    expect(timeSeriesMap.has(1704067200000)).toBe(true)
    expect(timeSeriesMap.has(1704067260000)).toBe(true)
    expect(timeSeriesMap.has(1704067320000)).toBe(true)
  })

  it('should create proper data structure with timestamp conversion', () => {
    processMetricsData(
      mockMetricsResponse,
      timeSeriesMap,
      (series, index) => `cpu-${index}`,
      (value) => parseFloat(value),
      false
    )

    const dataPoint = timeSeriesMap.get(1704067200000)
    expect(dataPoint).toBeDefined()
    expect(dataPoint?.timestamp).toBe(1704067200000)
    expect(dataPoint?.time).toBe('00:00:00')
    expect(dataPoint?.fullTime).toBe('Jan 1, 2024, 00:00:00 UTC')
    expect(dataPoint?.['cpu-0']).toBe(50.5)
  })

  it('should handle value transformation correctly', () => {
    processMetricsData(
      mockMetricsResponse,
      timeSeriesMap,
      (series, index) => 'memory',
      (value) => parseFloat(value) * 1024,
      false
    )

    const dataPoint = timeSeriesMap.get(1704067200000)
    expect(dataPoint?.memory).toBe(50.5 * 1024)
  })

  it('should handle multiple series correctly', () => {
    const multiSeriesData = {
      data: {
        result: [
          mockMetricData,
          {
            ...mockMetricData,
            metric: { ...mockMetricData.metric, container: 'second-container' },
            values: [[1704067200, '100.0']],
          },
        ],
      },
    }

    processMetricsData(
      multiSeriesData,
      timeSeriesMap,
      (_, index) => `series-${index}`,
      (value) => parseFloat(value),
      false
    )

    const dataPoint = timeSeriesMap.get(1704067200000)
    expect(dataPoint?.['series-0']).toBe(50.5)
    expect(dataPoint?.['series-1']).toBe(100.0)
  })

  it('should handle NaN values by converting to 0', () => {
    const dataWithNaN = {
      data: {
        result: [
          {
            ...mockMetricData,
            values: [[1704067200, 'invalid-number']],
          },
        ],
      },
    }

    processMetricsData(
      dataWithNaN,
      timeSeriesMap,
      (series, index) => 'test-series',
      (value) => parseFloat(value),
      false
    )

    const dataPoint = timeSeriesMap.get(1704067200000)
    expect(dataPoint?.['test-series']).toBe(0)
  })

  it('should handle undefined metricsData', () => {
    processMetricsData(
      undefined,
      timeSeriesMap,
      (series, index) => 'test',
      (value) => parseFloat(value),
      false
    )

    expect(timeSeriesMap.size).toBe(0)
  })

  it('should handle metricsData without data property', () => {
    processMetricsData(
      {},
      timeSeriesMap,
      (series, index) => 'test',
      (value) => parseFloat(value),
      false
    )

    expect(timeSeriesMap.size).toBe(0)
  })

  it('should handle metricsData without result property', () => {
    processMetricsData(
      { data: {} },
      timeSeriesMap,
      (series, index) => 'test',
      (value) => parseFloat(value),
      false
    )

    expect(timeSeriesMap.size).toBe(0)
  })

  it('should use custom getSeriesName function', () => {
    processMetricsData(
      mockMetricsResponse,
      timeSeriesMap,
      (series) => series.metric.container,
      (value) => parseFloat(value),
      false
    )

    const dataPoint = timeSeriesMap.get(1704067200000)
    expect(dataPoint?.['test-container']).toBe(50.5)
  })

  it('should format timestamp with local time when useLocalTime is true', () => {
    processMetricsData(
      mockMetricsResponse,
      timeSeriesMap,
      (_, index) => `series-${index}`,
      (value) => parseFloat(value),
      true
    )

    const dataPoint = timeSeriesMap.get(1704067200000)
    expect(dataPoint?.fullTime).not.toContain('UTC')
  })
})
