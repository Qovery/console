import { useCallback, useMemo } from 'react'

export const COLORS = [
  '#B160F0',
  '#D940FF',
  '#009EDD',
  '#F4C004',
  '#00FF66',
  '#FF5733',
  '#33CCCC',
  '#FF3399',
  '#FFCC00',
  '#66FF33',
  '#FF66CC',
  '#FF9900',
  '#00FFFF',
  '#FF00FF',
  '#8B4513',
  '#1E90FF',
  '#32CD32',
  '#FF1493',
  '#00CED1',
]

const hashString = (string: string): number => {
  let hash = 0
  const length = string.length

  if (length === 0) return hash

  // Give more weight to the last characters
  for (let i = 0; i < length; i++) {
    const char = string.charCodeAt(i)
    // Multiply by position weight to give more importance to differences at the end
    const positionWeight = 1 + i / length
    hash = Math.imul(31, hash) + Math.floor(char * positionWeight)
    hash = hash & hash // Convert to 32bit integer
  }

  // Additional scrambling to increase variation for similar strings
  hash = ((hash >>> 16) ^ hash) * 0x45d9f3b
  hash = ((hash >>> 16) ^ hash) * 0x45d9f3b
  hash = (hash >>> 16) ^ hash

  return Math.abs(hash)
}

export const getColorByPod = (pod: string): string => {
  if (!pod) return COLORS[0]
  return COLORS[hashString(pod) % COLORS.length]
}

export const usePodColor = () => {
  const colorMap = useMemo(() => new Map<string, string>(), [])

  const getPodColor = useCallback((podName: string) => {
    if (!podName) return COLORS[0]

    if (colorMap.has(podName)) {
      return colorMap.get(podName)!
    }

    const color = getColorByPod(podName)
    colorMap.set(podName, color)
    return color
  }, [])

  return getPodColor
}
