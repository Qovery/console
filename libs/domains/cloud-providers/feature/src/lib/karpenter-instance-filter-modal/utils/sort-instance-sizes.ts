type BasicSize = 'small' | 'medium' | 'large' | 'xlarge'
type SizePriority = Record<BasicSize, number>

// Define type for the sort key tuple
type SortKey = [priority: number, multiplier: number]

export function sortInstanceSizes(sizes: string[]): string[] {
  const sizePriority: SizePriority = {
    small: 1,
    medium: 2,
    large: 3,
    xlarge: 4,
  }

  function getSortKey(size: string): SortKey {
    if (isBasicSize(size)) {
      return [sizePriority[size], 0]
    }

    // Handle xlarge variants
    if (size.includes('xlarge')) {
      // Extract number before 'xlarge'
      const number = size.replace('xlarge', '')
      // Convert empty string to 1 (for just 'xlarge')
      const multiplier = number ? parseInt(number) : 1
      return [5, multiplier]
    }

    return [0, 0]
  }

  function isBasicSize(size: string): size is BasicSize {
    return size in sizePriority
  }

  return sizes.sort((a, b) => {
    const [priorityA, multiplierA] = getSortKey(a)
    const [priorityB, multiplierB] = getSortKey(b)

    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    return multiplierA - multiplierB
  })
}

export default sortInstanceSizes
