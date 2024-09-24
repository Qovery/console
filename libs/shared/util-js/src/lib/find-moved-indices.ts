export function findMovedIndices<T>(
  arr1: T[],
  arr2: T[],
  comparator: (a: T, b: T) => boolean = (a, b) => a === b
): [number, number] | null {
  if (arr1.length !== arr2.length) {
    throw new Error('Both arrays must have the same length.')
  }

  if (arr1.length === 0) {
    return null
  }

  let movedFromIndex: number | null = null
  let movedToIndex: number | null = null

  // Find the moved element
  for (let i = 0; i < arr1.length; i++) {
    if (!comparator(arr1[i], arr2[i])) {
      movedFromIndex = i
      break
    }
  }

  if (movedFromIndex === null) {
    return null // Arrays are identical
  }

  // Find where the moved element went to
  for (let i = arr2.length - 1; i >= 0; i--) {
    if (!comparator(arr1[i], arr2[i])) {
      movedToIndex = i
      break
    }
  }

  if (movedToIndex === null) {
    throw new Error('Moved element not found in the second array.')
  }

  const diff1 = arr1.slice(0, movedFromIndex).concat(arr1.slice(movedFromIndex + 1))
  const diff2 = arr2.slice(0, movedToIndex).concat(arr1.slice(movedToIndex + 1))

  return diff1.every((element, index) => element === diff2[index])
    ? [movedFromIndex, movedToIndex]
    : [movedToIndex, movedFromIndex]
}
