import { strictFilterVersion } from './strict-filter-version'

describe('strictFilterVersion', () => {
  it('returns true for exact match at the beginning', () => {
    expect(strictFilterVersion({ value: '1.8.1', label: '1.8.1' }, '1.')).toBe(true)
    expect(strictFilterVersion({ value: '1.8.0', label: '1.8.0' }, '1.')).toBe(true)
    expect(strictFilterVersion({ value: '1.7.1', label: '1.7.1' }, '1.7.')).toBe(true)
  })

  it('returns false for non-matching versions', () => {
    expect(strictFilterVersion({ value: '2.1.0', label: '2.1.0' }, '1.')).toBe(false)
    expect(strictFilterVersion({ value: '0.9.1', label: '0.9.1' }, '1.')).toBe(false)
  })

  it('returns false for partial matches', () => {
    expect(strictFilterVersion({ value: '1.8.1', label: '1.8.1' }, '1.8.1.')).toBe(false)
    expect(strictFilterVersion({ value: '1.8.1', label: '1.8.1' }, '1.8.2')).toBe(false)
  })

  it('handles edge cases with special characters', () => {
    expect(strictFilterVersion({ value: '1.8.1', label: '1.8.1' }, '1.8')).toBe(true)
    expect(strictFilterVersion({ value: '1.8.1', label: '1.8.1' }, '.')).toBe(false)
    expect(strictFilterVersion({ value: '1.8.1', label: '1.8.1' }, '1..')).toBe(true)
  })

  it('works with various inputs', () => {
    const versions = [
      { value: '1.8.1', label: '1.8.1' },
      { value: '1.8.0', label: '1.8.0' },
      { value: '1.7.1', label: '1.7.1' },
      { value: '1.7.0', label: '1.7.0' },
      { value: '1.6.1', label: '1.6.1' },
      { value: '1.6.0', label: '1.6.0' },
      { value: '0.10.1', label: '0.10.1' },
      { value: '0.10.0', label: '0.10.0' },
      { value: '0.9.2', label: '0.9.2' },
      { value: '0.9.1', label: '0.9.1' },
      { value: '0.9.0', label: '0.9.0' },
    ]
    const filteredVersions = versions.filter((version) => strictFilterVersion(version, '1.'))
    expect(filteredVersions).toEqual([
      { value: '1.8.1', label: '1.8.1' },
      { value: '1.8.0', label: '1.8.0' },
      { value: '1.7.1', label: '1.7.1' },
      { value: '1.7.0', label: '1.7.0' },
      { value: '1.6.1', label: '1.6.1' },
      { value: '1.6.0', label: '1.6.0' },
    ])
  })
})
