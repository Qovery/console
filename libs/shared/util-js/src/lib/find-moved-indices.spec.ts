import { findMovedIndices } from './find-moved-indices'

describe('findMovedIndices', () => {
  test('should return correct indices when an element is moved backward 1', () => {
    const arr1 = [1, 2, 3, 4, 5]
    const arr2 = [3, 1, 2, 4, 5]
    const result = findMovedIndices(arr1, arr2)
    expect(result).toEqual([2, 0])
  })

  test('should return correct indices when an element is moved backward 2', () => {
    const arr1 = [1, 2, 3, 4, 5]
    const arr2 = [1, 2, 5, 3, 4]
    const result = findMovedIndices(arr1, arr2)
    expect(result).toEqual([4, 2])
  })

  test('should return null when both arrays are identical', () => {
    const arr1 = [1, 2, 3, 4, 5]
    const arr2 = [1, 2, 3, 4, 5]
    const result = findMovedIndices(arr1, arr2)
    expect(result).toBeNull()
  })

  test('should return correct indices when multiple elements are moved forward', () => {
    const arr1 = [1, 2, 3, 4, 5]
    const arr2 = [2, 3, 1, 4, 5]
    const result = findMovedIndices(arr1, arr2)
    expect(result).toEqual([0, 2])
  })

  test('should handle arrays with no mismatches gracefully', () => {
    const arr1 = [1]
    const arr2 = [1]
    const result = findMovedIndices(arr1, arr2)
    expect(result).toBeNull()
  })

  test('should throw an error when arrays are of different lengths', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2]
    expect(() => findMovedIndices(arr1, arr2)).toThrow('Both arrays must have the same length.')
  })

  test('should return correct indices when comparing objects by id property', () => {
    const arr1 = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const arr2 = [{ id: 3 }, { id: 1 }, { id: 2 }]

    const result = findMovedIndices(
      arr1,
      arr2,
      (a, b) => a.id === b.id // Custom comparison by `id` property
    )
    expect(result).toEqual([2, 0])
  })

  test('should return null when both arrays of objects are identical by custom comparator', () => {
    const arr1 = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const arr2 = [{ id: 1 }, { id: 2 }, { id: 3 }]

    const result = findMovedIndices(
      arr1,
      arr2,
      (a, b) => a.id === b.id // Custom comparison by `id` property
    )
    expect(result).toBeNull()
  })
})
