import { COLORS, getColorByPod } from './get-color-by-pod'

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

  it('returns different colors for slight variations in pod names', () => {
    const color1 = getColorByPod('podA')
    const color2 = getColorByPod('podB')
    expect(color1).not.toBe(color2)
  })

  // This test ensures all colors can be returned
  it('can return all colors in the COLORS array', () => {
    const usedColors = new Set()
    for (let i = 0; i < 100; i++) {
      usedColors.add(getColorByPod(`pod${i}`))
    }
    expect(usedColors.size).toBe(COLORS.length)
  })
})
