import { useCallback, useMemo } from 'react'

export const COLORS = [
  'hsl(217.2 91.2% 59.8%)',
  'hsl(238.7 83.5% 66.7%)',
  'hsl(258.3 89.5% 66.3%)',
  'hsl(270.7 91% 65.1%)',
  'hsl(292.2 84.1% 60.6%)',
  'hsl(330.4 81.2% 60.4%)',
  'hsl(349.7 89.2% 60.2%)',
  'hsl(215.4 16.3% 46.9%)',
  'hsl(220 8.9% 46.1%)',
  'hsl(240 3.8% 46.1%)',
  'hsl(0 0% 45.1%)',
  'hsl(25 5.3% 44.7%)',
  'hsl(0 84.2% 60.2%)',
  'hsl(24.6 95% 53.1%)',
  'hsl(37.7 92.1% 50.2%)',
  'hsl(45.4 93.4% 47.5%)',
  'hsl(83.7 80.5% 44.3%)',
  'hsl(142.1 70.6% 45.3%)',
  'hsl(160.1 84.1% 39.4%)',
  'hsl(173.4 80.4% 40%)',
  'hsl(188.7 94.5% 42.7%)',
  'hsl(198.6 88.7% 48.4%)',
  'hsl(217.2 91.2% 59.8%)',
  'hsl(238.7 83.5% 66.7%)',
  'hsl(258.3 89.5% 66.3%)',
  'hsl(270.7 91% 65.1%)',
  'hsl(292.2 84.1% 60.6%)',
  'hsl(330.4 81.2% 60.4%)',
  'hsl(349.7 89.2% 60.2%)',
  'hsl(215.4 16.3% 46.9%)',
  'hsl(220 8.9% 46.1%)',
  'hsl(240 3.8% 46.1%)',
  'hsl(0 0% 45.1%)',
  'hsl(25 5.3% 44.7%)',
  'hsl(0 84.2% 60.2%)',
  'hsl(24.6 95% 53.1%)',
  'hsl(37.7 92.1% 50.2%)',
  'hsl(45.4 93.4% 47.5%)',
  'hsl(83.7 80.5% 44.3%)',
  'hsl(142.1 70.6% 45.3%)',
  'hsl(160.1 84.1% 39.4%)',
  'hsl(173.4 80.4% 40%)',
  'hsl(188.7 94.5% 42.7%)',
  'hsl(198.6 88.7% 48.4%)',
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
