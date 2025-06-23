import { calculatePercentage, formatNumber, mibToGib, milliCoreToVCPU } from './resource-calculations'

describe('Conversion Utility Functions', () => {
  it('should convert MiB to GiB correctly', () => {
    expect(mibToGib(1024)).toBe(1)
    expect(mibToGib(2048)).toBe(2)
    expect(mibToGib(512)).toBe(0.5)
    expect(mibToGib(0)).toBe(0)
  })

  it('should convert millicores to vCPU correctly', () => {
    expect(milliCoreToVCPU(1000)).toBe(1)
    expect(milliCoreToVCPU(2500)).toBe(2.5)
    expect(milliCoreToVCPU(500)).toBe(0.5)
    expect(milliCoreToVCPU(0)).toBe(0)
  })

  it('should format numbers to the specified precision', () => {
    expect(formatNumber(1.2345, 2)).toBe(1.23)
    expect(formatNumber(1.2345, 3)).toBe(1.234)
    expect(formatNumber(1.2, 0)).toBe(1)
  })

  it('should use default precision of 2 when not specified', () => {
    expect(formatNumber(1.2345, 2)).toBe(1.23)
    expect(formatNumber(1.2, 2)).toBe(1.2)
  })

  it('should handle NaN and return 0', () => {
    expect(formatNumber(NaN)).toBe(0)
  })

  it('should handle integer numbers', () => {
    expect(formatNumber(5)).toBe(5)
  })
})

describe('calculatePercentage', () => {
  it('should calculate percentage correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50)
    expect(calculatePercentage(25, 100)).toBe(25)
    expect(calculatePercentage(75, 100)).toBe(75)
  })

  it('should handle zero total', () => {
    expect(calculatePercentage(50, 0)).toBe(0)
    expect(calculatePercentage(0, 0)).toBe(0)
  })

  it('should handle decimal values', () => {
    expect(calculatePercentage(33, 100)).toBe(33)
    expect(calculatePercentage(66, 100)).toBe(66)
  })

  it('should handle values greater than total', () => {
    expect(calculatePercentage(150, 100)).toBe(150)
    expect(calculatePercentage(200, 100)).toBe(200)
  })
})

describe('Edge cases and precision issues', () => {
  it('should handle small milliCore values correctly with formatNumber', () => {
    expect(formatNumber(milliCoreToVCPU(1))).toBe(0)
    expect(formatNumber(milliCoreToVCPU(10))).toBe(0.01)
    expect(formatNumber(milliCoreToVCPU(100))).toBe(0.1)
    expect(formatNumber(milliCoreToVCPU(999))).toBe(1.0)
    expect(formatNumber(milliCoreToVCPU(1001))).toBe(1.0)
  })

  it('should handle percentage calculation precision differences', () => {
    const usedMilliCores = 480
    const totalMilliCores = 1930

    const correctPercentage = formatNumber(calculatePercentage(usedMilliCores, totalMilliCores), 0)

    const usedFormatted = formatNumber(milliCoreToVCPU(usedMilliCores), 0)
    const totalFormatted = formatNumber(milliCoreToVCPU(totalMilliCores), 0)
    const problematicPercentage = formatNumber(calculatePercentage(usedFormatted, totalFormatted), 0)

    expect(correctPercentage).toBe(25) // 480/1930 * 100 = 24.87 → 25
    expect(problematicPercentage).toBe(0) // 0/2 * 100 = 0 (due to rounding to 0)

    expect(correctPercentage).not.toBe(problematicPercentage)
  })

  it('should handle memory calculation precision differences', () => {
    const usedMemoryMib = 512
    const totalMemoryMib = 2048

    const correctPercentage = formatNumber(calculatePercentage(usedMemoryMib, totalMemoryMib), 0)

    const usedFormatted = formatNumber(mibToGib(usedMemoryMib), 0) // 0.5 → 1
    const totalFormatted = formatNumber(mibToGib(totalMemoryMib), 0) // 2.0 → 2
    const problematicPercentage = formatNumber(calculatePercentage(usedFormatted, totalFormatted), 0)

    expect(correctPercentage).toBe(25) // 512/2048 * 100 = 25
    expect(problematicPercentage).toBe(50) // 1/2 * 100 = 50 - this demonstrates the issue
    expect(correctPercentage).not.toBe(problematicPercentage)

    const smallUsedMib = 256
    const smallTotalMib = 1536

    const correctSmallPercentage = formatNumber(calculatePercentage(smallUsedMib, smallTotalMib), 0)
    const usedSmallFormatted = formatNumber(mibToGib(smallUsedMib), 0) // 0.25 → 0
    const totalSmallFormatted = formatNumber(mibToGib(smallTotalMib), 0) // 1.5 → 2
    const problematicSmallPercentage = formatNumber(calculatePercentage(usedSmallFormatted, totalSmallFormatted), 0)

    expect(correctSmallPercentage).toBe(17) // 256/1536 * 100 = 16.67 → 17
    expect(problematicSmallPercentage).toBe(0) // 0/2 * 100 = 0
    expect(correctSmallPercentage).not.toBe(problematicSmallPercentage)
  })
})
