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
    expect(formatNumber(1.2345)).toBe(1.23)
    expect(formatNumber(1.2)).toBe(1.2)
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
    expect(calculatePercentage(33.33, 100)).toBe(33.33)
    expect(calculatePercentage(66.67, 100)).toBe(66.67)
  })

  it('should handle values greater than total', () => {
    expect(calculatePercentage(150, 100)).toBe(150)
    expect(calculatePercentage(200, 100)).toBe(200)
  })
})
