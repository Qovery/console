import { plural, pluralize } from './pluralize'

describe('pluralize function', () => {
  it('should return the singular form for count 1', () => {
    expect(pluralize(1, 'apple', 'apples')).toBe('apple')
  })

  it('should return the plural form for count greater than 1', () => {
    expect(pluralize(5, 'apple', 'apples')).toBe('apples')
  })
})

describe('plural function', () => {
  it('should return the singular form for count 1', () => {
    expect(plural(1, 'apple')).toBe('apple')
  })

  it('should return the plural form for count greater than 1', () => {
    expect(plural(5, 'apple')).toBe('apples')
  })
})
