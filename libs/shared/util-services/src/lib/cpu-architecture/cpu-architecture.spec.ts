import { toCpuArchitectureRequest } from './cpu-architecture'

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
