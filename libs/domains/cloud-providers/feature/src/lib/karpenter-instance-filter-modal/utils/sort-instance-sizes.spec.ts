import { sortInstanceSizes } from './sort-instance-sizes'

describe('sortInstanceSizes', () => {
  it('should sort basic sizes correctly', () => {
    const input = ['large', 'small', 'medium', 'xlarge']
    const expected = ['small', 'medium', 'large', 'xlarge']
    expect(sortInstanceSizes(input)).toEqual(expected)
  })

  it('should sort numeric xlarge sizes correctly', () => {
    const input = ['16xlarge', '2xlarge', '8xlarge', '4xlarge']
    const expected = ['2xlarge', '4xlarge', '8xlarge', '16xlarge']
    expect(sortInstanceSizes(input)).toEqual(expected)
  })

  it('should sort mixed sizes correctly', () => {
    const input = ['16xlarge', 'small', '2xlarge', 'medium', 'xlarge']
    const expected = ['small', 'medium', 'xlarge', '2xlarge', '16xlarge']
    expect(sortInstanceSizes(input)).toEqual(expected)
  })

  it('should handle empty array', () => {
    expect(sortInstanceSizes([])).toEqual([])
  })

  it('should handle single item array', () => {
    expect(sortInstanceSizes(['medium'])).toEqual(['medium'])
  })

  it('should maintain order of equal items', () => {
    const input = ['medium', 'medium', 'small', 'small']
    const expected = ['small', 'small', 'medium', 'medium']
    expect(sortInstanceSizes(input)).toEqual(expected)
  })
})
