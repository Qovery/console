import { useCallback, useMemo } from 'react'

export const RANDOM_COLORS = [
  'var(--color-r-ams)',
  'var(--color-r-arn)',
  'var(--color-r-atl)',
  'var(--color-r-bog)',
  'var(--color-r-bom)',
  'var(--color-r-bos)',
  'var(--color-r-gig)',
  'var(--color-r-gru)',
  'var(--color-r-hkg)',
  'var(--color-r-lhr)',
  'var(--color-r-mad)',
  'var(--color-r-mia)',
  'var(--color-r-nrt)',
  'var(--color-r-ord)',
  'var(--color-r-otp)',
  'var(--color-r-phx)',
  'var(--color-r-qro)',
  'var(--color-r-scl)',
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
  if (!pod) return RANDOM_COLORS[0]
  return RANDOM_COLORS[hashString(pod) % RANDOM_COLORS.length]
}

export const usePodColor = () => {
  const colorMap = useMemo(() => new Map<string, string>(), [])

  const getPodColor = useCallback(
    (podName: string) => {
      if (!podName) return RANDOM_COLORS[0]

      if (colorMap.has(podName)) {
        return colorMap.get(podName)!
      }

      const color = getColorByPod(podName)
      colorMap.set(podName, color)
      return color
    },
    [colorMap]
  )

  return getPodColor
}
