import { deriveGlobalSpotEnabled } from './derive-global-spot-enabled'

describe('deriveGlobalSpotEnabled', () => {
  it('returns false when every nodepool has spot disabled', () => {
    expect(
      deriveGlobalSpotEnabled({
        requirements: [],
        default_override: { spot_enabled: false },
        stable_override: { spot_enabled: false },
      })
    ).toBe(false)
  })

  it('returns true when only the default nodepool has spot enabled', () => {
    expect(
      deriveGlobalSpotEnabled({
        requirements: [],
        default_override: { spot_enabled: true },
        stable_override: { spot_enabled: false },
      })
    ).toBe(true)
  })

  it('returns true when only the stable nodepool has spot enabled', () => {
    expect(
      deriveGlobalSpotEnabled({
        requirements: [],
        default_override: { spot_enabled: false },
        stable_override: { spot_enabled: true },
      })
    ).toBe(true)
  })

  it('skips an absent cronjob override', () => {
    expect(
      deriveGlobalSpotEnabled({
        requirements: [],
        default_override: { spot_enabled: false },
        stable_override: { spot_enabled: false },
      })
    ).toBe(false)
  })

  it('includes the cronjob override when it has spot enabled', () => {
    expect(
      deriveGlobalSpotEnabled({
        requirements: [],
        default_override: { spot_enabled: false },
        stable_override: { spot_enabled: false },
        cronjob_override: { spot_enabled: true },
      })
    ).toBe(true)
  })

  it('ignores the gpu nodepool', () => {
    expect(
      deriveGlobalSpotEnabled({
        requirements: [],
        default_override: { spot_enabled: false },
        stable_override: { spot_enabled: false },
        gpu_override: { spot_enabled: true },
      })
    ).toBe(false)
  })

  it('does not let an explicit null nodepool value contribute', () => {
    expect(
      deriveGlobalSpotEnabled({
        requirements: [],
        default_override: { spot_enabled: null },
        stable_override: { spot_enabled: null },
        cronjob_override: { spot_enabled: null },
      })
    ).toBe(false)
  })

  it('still derives true when one nodepool is on and the others are null', () => {
    expect(
      deriveGlobalSpotEnabled({
        requirements: [],
        default_override: { spot_enabled: true },
        stable_override: { spot_enabled: null },
      })
    ).toBe(true)
  })

  it('returns false when no nodepool has an explicit value', () => {
    expect(deriveGlobalSpotEnabled({ requirements: [] })).toBe(false)
    expect(deriveGlobalSpotEnabled()).toBe(false)
  })
})
