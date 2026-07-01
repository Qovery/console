import { getCpuArchitectureSummaryValue, toCpuArchitectureRequest } from './cpu-architecture'

describe('getCpuArchitectureSummaryValue', () => {
  it('should keep selected cpu architecture values', () => {
    expect(getCpuArchitectureSummaryValue('ARM64')).toBe('ARM64')
    expect(getCpuArchitectureSummaryValue('AMD64')).toBe('AMD64')
  })

  it('should omit default cpu architecture', () => {
    expect(getCpuArchitectureSummaryValue('DEFAULT')).toBeUndefined()
  })

  it('should omit cpu architecture when the form value is missing', () => {
    expect(getCpuArchitectureSummaryValue()).toBeUndefined()
  })
})

describe('toCpuArchitectureRequest', () => {
  it('should keep selected cpu architecture values', () => {
    expect(toCpuArchitectureRequest('ARM64')).toBe('ARM64')
    expect(toCpuArchitectureRequest('AMD64')).toBe('AMD64')
  })

  it('should map default cpu architecture to null', () => {
    expect(toCpuArchitectureRequest('DEFAULT')).toBeNull()
  })

  it('should omit cpu architecture when the form value is missing', () => {
    expect(toCpuArchitectureRequest()).toBeUndefined()
  })
})
