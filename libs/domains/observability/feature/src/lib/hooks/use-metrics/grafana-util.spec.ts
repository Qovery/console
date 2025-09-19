import { alignedRangeInMinutes } from './grafana-util'

describe('alignedRangeInMinutes', () => {
  it('should return padded 1 minute for 3 minutes duration (rounds down)', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704067380' // Jan 1, 2024 00:03:00 (3 minutes)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('000001')
  })

  it('should return padded 5 minutes for 10 minutes duration (rounds down)', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704067800' // Jan 1, 2024 00:10:00 (10 minutes)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('000005')
  })

  it('should return padded 5 minutes for exactly 5 minutes duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704067500' // Jan 1, 2024 00:05:00 (5 minutes)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('000005')
  })

  it('should return padded 15 minutes for 25 minutes duration (rounds down)', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704068700' // Jan 1, 2024 00:25:00 (25 minutes)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('000015')
  })

  it('should return padded 60 minutes for 1 hour duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704070800' // Jan 1, 2024 01:00:00 (1 hour)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('000060')
  })

  it('should return padded 60 minutes for 90 minutes duration (rounds down)', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704072600' // Jan 1, 2024 01:30:00 (1.5 hours)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('000060')
  })

  it('should return padded 180 minutes for 3 hours duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704078000' // Jan 1, 2024 03:00:00 (3 hours)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('000180')
  })

  it('should return padded 360 minutes for 6 hours duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704088800' // Jan 1, 2024 06:00:00 (6 hours)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('000360')
  })

  it('should return padded 720 minutes for 12 hours duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704110400' // Jan 1, 2024 12:00:00 (12 hours)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('000720')
  })

  it('should return padded 1440 minutes for 24 hours duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704153600' // Jan 2, 2024 00:00:00 (24 hours)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('001440')
  })

  it('should return padded 2880 minutes for 2 days duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704240000' // Jan 3, 2024 00:00:00 (48 hours)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('002880')
  })

  it('should return padded 10080 minutes for 7 days duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704672000' // Jan 8, 2024 00:00:00 (7 days)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('010080')
  })

  it('should return padded 20160 minutes for 14 days duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1705276800' // Jan 15, 2024 00:00:00 (14 days)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('020160')
  })

  it('should return padded 30240 minutes for 21 days duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1705881600' // Jan 22, 2024 00:00:00 (21 days)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('030240')
  })

  it('should return padded 40320 minutes for 28 days duration', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1706486400' // Jan 29, 2024 00:00:00 (28 days)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('040320')
  })

  it('should handle very small duration (30 seconds) and return padded 1 minute', () => {
    const startTimestamp = '1704067200' // Jan 1, 2024 00:00:00
    const endTimestamp = '1704067230' // Jan 1, 2024 00:00:30 (30 seconds)

    expect(alignedRangeInMinutes(startTimestamp, endTimestamp)).toBe('000001')
  })

  it('should return "na" when no timestamps provided', () => {
    expect(alignedRangeInMinutes()).toBe('na')
  })

  it('should return "na" when undefined timestamps provided', () => {
    expect(alignedRangeInMinutes(undefined, undefined)).toBe('na')
  })

  it('should return "na" for invalid string timestamp', () => {
    expect(alignedRangeInMinutes('invalid', '1704067200')).toBe('na')
  })

  it('should return "na" for invalid number timestamp', () => {
    expect(alignedRangeInMinutes('NaN', '1704067200')).toBe('na')
  })
})
