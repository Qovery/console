import { isOnPremiseProvider } from './is-on-premise-provider'

describe('isOnPremiseProvider', () => {
  it.each(['ON_PREMISE', 'HETZNER', 'OVH', 'CIVO', 'ORACLE', 'IBM'] as const)('is true for %s', (cloudProvider) => {
    expect(isOnPremiseProvider(cloudProvider)).toBe(true)
  })

  it.each(['AWS', 'GCP', 'SCW'] as const)('is false for %s', (cloudProvider) => {
    expect(isOnPremiseProvider(cloudProvider)).toBe(false)
  })
})
