import { pluralize } from './pluralize'

describe('pluralize function', () => {
  it('should return the singular form for count 1', () => {
    expect(pluralize(1, 'apple', 'apples')).toBe('apple')
  })

  it('should return the plural form for count greater than 1', () => {
    expect(pluralize(5, 'apple', 'apples')).toBe('apples')
  })

  it('should return the singular form for count 1 with default plural form', () => {
    expect(pluralize(1, 'apple')).toBe('apple')
  })

  it('should return the plural form for count greater than 1 with default plural form', () => {
    expect(pluralize(5, 'apple')).toBe('apples')
  })
})
