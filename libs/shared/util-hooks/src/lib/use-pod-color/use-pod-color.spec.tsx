import { act, renderHook } from '@testing-library/react'
import { COLORS, getColorByPod, usePodColor } from './use-pod-color'

describe('getColorByPod', () => {
  it('returns first color for empty string', () => {
    expect(getColorByPod('')).toBe('#B160F0')
  })

  it('returns consistent color for same pod string', () => {
    const color1 = getColorByPod('pod1')
    const color2 = getColorByPod('pod1')
    expect(color1).toBe(color2)
  })

  it('returns different colors for different pod strings', () => {
    const color1 = getColorByPod('pod1')
    const color2 = getColorByPod('pod2')
    expect(color1).not.toBe(color2)
  })

  it('returns a color from the COLORS array', () => {
    const color = getColorByPod('somepod')
    expect(COLORS).toContain(color)
  })

  it('handles long pod names', () => {
    const longPodName = 'a'.repeat(30)
    expect(() => getColorByPod(longPodName)).not.toThrow()
    expect(COLORS).toContain(getColorByPod(longPodName))
  })

  it('can return all colors in the COLORS array', () => {
    const usedColors = new Set()
    for (let i = 0; i < 100; i++) {
      usedColors.add(getColorByPod(`pod${i}`))
    }
    expect(usedColors.size).toBe(COLORS.length)
  })

  it('maintains color distribution across COLORS array', () => {
    const colorCounts = new Map<string, number>()
    const iterations = 1000

    for (let i = 0; i < iterations; i++) {
      const color = getColorByPod(`test-pod-${i}`)
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1)
    }

    const expectedAverage = iterations / COLORS.length
    const tolerance = expectedAverage * 0.5

    colorCounts.forEach((count) => {
      expect(count).toBeGreaterThan(expectedAverage - tolerance)
      expect(count).toBeLessThan(expectedAverage + tolerance)
    })
  })
})

describe('usePodColor hook', () => {
  it('maintains consistent colors across renders', () => {
    const { result, rerender } = renderHook(() => usePodColor())

    const color1 = result.current('test-pod')
    rerender()
    const color2 = result.current('test-pod')

    expect(color1).toBe(color2)
  })

  it('maintains different colors for different pods', () => {
    const { result } = renderHook(() => usePodColor())

    const color1 = result.current('pod1')
    const color2 = result.current('pod2')

    expect(color1).not.toBe(color2)
  })

  it('returns same color for same pod across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => usePodColor())
    const { result: result2 } = renderHook(() => usePodColor())

    const color1 = result1.current('test-pod')
    const color2 = result2.current('test-pod')

    expect(color1).toBe(color2)
  })

  it('handles rapid successive calls efficiently', () => {
    const { result } = renderHook(() => usePodColor())

    const colors = new Set()
    act(() => {
      for (let i = 0; i < 1000; i++) {
        colors.add(result.current(`pod-${i}`))
      }
    })

    expect(colors.size).toBeLessThanOrEqual(COLORS.length)
  })

  it('maintains color mapping after component updates', () => {
    const { result, rerender } = renderHook(() => usePodColor())

    const podName = 'test-pod'
    const initialColor = result.current(podName)

    for (let i = 0; i < 5; i++) {
      rerender()
      expect(result.current(podName)).toBe(initialColor)
    }
  })
})
