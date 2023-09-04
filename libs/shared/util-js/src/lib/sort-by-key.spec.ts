import { sortByKey } from './sort-by-key'

describe('sortByKey', () => {
  it('should sort by key', () => {
    const unsortedList: { name: string; value: string }[] = [
      { name: 'a', value: 'a' },
      { name: 'c', value: 'c' },
      { name: 'b', value: 'b' },
    ]

    const sortedList = sortByKey(unsortedList, 'name')

    expect(sortedList).toEqual([
      { name: 'a', value: 'a' },
      { name: 'b', value: 'b' },
      { name: 'c', value: 'c' },
    ])
  })

  it('should sort by key and the sorting must not be case sensitive', () => {
    const unsortedList: { name: string; value: string }[] = [
      { name: 'a', value: 'a' },
      { name: 'C', value: 'C' },
      { name: 'b', value: 'b' },
    ]

    const sortedList = sortByKey(unsortedList, 'name')

    expect(sortedList).toEqual([
      { name: 'a', value: 'a' },
      { name: 'b', value: 'b' },
      { name: 'C', value: 'C' },
    ])
  })
})
