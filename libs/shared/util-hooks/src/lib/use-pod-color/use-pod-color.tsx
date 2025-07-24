import { useCallback, useMemo } from 'react'
import { EXTENDED_COLOR_PALETTE } from '@qovery/shared/utils'

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
  if (!pod) return EXTENDED_COLOR_PALETTE[0]
  return EXTENDED_COLOR_PALETTE[hashString(pod) % EXTENDED_COLOR_PALETTE.length]
}

export const usePodColor = () => {
  const colorMap = useMemo(() => new Map<string, string>(), [])

  const getPodColor = useCallback((podName: string) => {
    if (!podName) return EXTENDED_COLOR_PALETTE[0]

    if (colorMap.has(podName)) {
      return colorMap.get(podName)!
    }

    const color = getColorByPod(podName)
    colorMap.set(podName, color)
    return color
  }, [colorMap])

  return getPodColor
}
