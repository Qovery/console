import { listInstanceTypeFormatter } from './list-instance-type-formatter'

describe('listInstanceTypeFormatter', () => {
  it('should format instance types correctly', () => {
    const input = [
      { name: 't3.medium', cpu: 2, ram_in_gb: 4, architecture: 'AMD64', type: 't3.medium' },
      { name: 't3.small', cpu: 1, ram_in_gb: 2, architecture: 'AMD64', type: 't3.small' },
    ]

    const result = listInstanceTypeFormatter(input as never[])

    expect(result).toHaveLength(2)
    expect(result[0].label).toBe('t3.small (1CPU - 2GB RAM - AMD64)')
    expect(result[0].value).toBe('t3.small')
    expect(result[1].label).toBe('t3.medium (2CPU - 4GB RAM - AMD64)')
    expect(result[1].value).toBe('t3.medium')
  })

  it('should sort by CPU then RAM', () => {
    const input = [
      { name: 'large', cpu: 4, ram_in_gb: 8, architecture: 'AMD64', type: 'large' },
      { name: 'small', cpu: 1, ram_in_gb: 2, architecture: 'AMD64', type: 'small' },
      { name: 'medium', cpu: 2, ram_in_gb: 4, architecture: 'AMD64', type: 'medium' },
    ]

    const result = listInstanceTypeFormatter(input as never[])

    expect(result[0].value).toBe('small')
    expect(result[1].value).toBe('medium')
    expect(result[2].value).toBe('large')
  })

  it('should return empty array for empty input', () => {
    const result = listInstanceTypeFormatter([])
    expect(result).toEqual([])
  })
})
