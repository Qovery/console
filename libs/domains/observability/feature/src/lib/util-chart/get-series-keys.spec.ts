import { getSeriesKeys } from './get-series-keys'

describe('getSeriesKeys', () => {
  it('should return an empty array for empty data', () => {
    expect(getSeriesKeys([])).toEqual([])
  })

  it('should exclude timestamp, time and fullTime fields', () => {
    const data = [{ timestamp: 1, time: '00:00:00', fullTime: 'Jan 1, 2024, 00:00:00', cpu: 50 }]

    expect(getSeriesKeys(data)).toEqual(['cpu'])
  })

  it('should collect the union of series keys across all points', () => {
    const data = [
      { timestamp: 1, time: '00:00:00', fullTime: 'Jan 1, 2024, 00:00:00', 'p50 (nginx)': 10 },
      { timestamp: 2, time: '00:01:00', fullTime: 'Jan 1, 2024, 00:01:00', 'p50 (envoy)': 20 },
    ]

    expect(getSeriesKeys(data)).toEqual(['p50 (nginx)', 'p50 (envoy)'])
  })

  it('should not duplicate keys shared across points', () => {
    const data = [
      { timestamp: 1, time: '00:00:00', fullTime: 'Jan 1, 2024, 00:00:00', cpu: 50 },
      { timestamp: 2, time: '00:01:00', fullTime: 'Jan 1, 2024, 00:01:00', cpu: 75 },
    ]

    expect(getSeriesKeys(data)).toEqual(['cpu'])
  })
})
