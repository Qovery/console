import { normalizeKarpenterSpot } from './normalize-karpenter-spot'

describe('normalizeKarpenterSpot', () => {
  it('falls back to the global flag when no nodepool has an explicit value', () => {
    expect(
      normalizeKarpenterSpot({
        spot_enabled: true,
        qovery_node_pools: {
          requirements: [{ key: 'Arch', operator: 'In', values: ['AMD64'] }],
        },
      })
    ).toEqual({
      requirements: [{ key: 'Arch', operator: 'In', values: ['AMD64'] }],
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: true },
    })
  })

  it('falls back to the global flag when it is disabled', () => {
    expect(
      normalizeKarpenterSpot({
        spot_enabled: false,
        qovery_node_pools: { requirements: [] },
      })
    ).toEqual({
      requirements: [],
      default_override: { spot_enabled: false },
      stable_override: { spot_enabled: false },
    })
  })

  it('treats a missing global flag as disabled', () => {
    expect(normalizeKarpenterSpot({})).toEqual({
      requirements: [],
      default_override: { spot_enabled: false },
      stable_override: { spot_enabled: false },
    })
  })

  it('treats an explicit null per-nodepool value like an absent one', () => {
    expect(
      normalizeKarpenterSpot({
        spot_enabled: true,
        qovery_node_pools: {
          requirements: [],
          default_override: { spot_enabled: null },
          stable_override: { spot_enabled: null },
          cronjob_override: { spot_enabled: null },
        },
      })
    ).toEqual({
      requirements: [],
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: true },
      cronjob_override: { spot_enabled: true },
    })
  })

  it('keeps diverged per-nodepool values', () => {
    expect(
      normalizeKarpenterSpot({
        spot_enabled: true,
        qovery_node_pools: {
          requirements: [],
          default_override: { spot_enabled: true },
          stable_override: { spot_enabled: false },
        },
      })
    ).toEqual({
      requirements: [],
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: false },
    })
  })

  it('preserves the other fields of the overrides', () => {
    expect(
      normalizeKarpenterSpot({
        spot_enabled: true,
        qovery_node_pools: {
          requirements: [],
          default_override: {
            limits: { enabled: true, max_cpu_in_vcpu: 6, max_memory_in_gibibytes: 10, max_gpu: 0 },
            consolidate_after: '30m',
          },
          stable_override: {
            consolidation: { enabled: true, days: ['SUNDAY'], start_time: 'PT10:00', duration: 'PT2H' },
            consolidate_after: '30s',
            spot_enabled: false,
          },
        },
      })
    ).toEqual({
      requirements: [],
      default_override: {
        limits: { enabled: true, max_cpu_in_vcpu: 6, max_memory_in_gibibytes: 10, max_gpu: 0 },
        consolidate_after: '30m',
        spot_enabled: true,
      },
      stable_override: {
        consolidation: { enabled: true, days: ['SUNDAY'], start_time: 'PT10:00', duration: 'PT2H' },
        consolidate_after: '30s',
        spot_enabled: false,
      },
    })
  })

  it('passes the gpu override through untouched', () => {
    expect(
      normalizeKarpenterSpot({
        spot_enabled: true,
        qovery_node_pools: {
          requirements: [],
          gpu_override: { disk_size_in_gib: 100 },
        },
      })
    ).toEqual({
      requirements: [],
      gpu_override: { disk_size_in_gib: 100 },
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: true },
    })
  })

  it('leaves the cronjob override absent when the cronjob nodepool is disabled', () => {
    expect(
      normalizeKarpenterSpot({
        spot_enabled: true,
        qovery_node_pools: { requirements: [] },
      })
    ).not.toHaveProperty('cronjob_override')
  })

  it('falls back to the global flag for a cronjob override without an explicit value', () => {
    expect(
      normalizeKarpenterSpot({
        spot_enabled: true,
        qovery_node_pools: {
          requirements: [],
          cronjob_override: { consolidate_after: '1m' },
        },
      })
    ).toEqual({
      requirements: [],
      cronjob_override: { consolidate_after: '1m', spot_enabled: true },
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: true },
    })
  })

  it('keeps an explicit cronjob spot value that diverges from the global flag', () => {
    expect(
      normalizeKarpenterSpot({
        spot_enabled: true,
        qovery_node_pools: {
          requirements: [],
          cronjob_override: { consolidate_after: '1m', spot_enabled: false },
        },
      })
    ).toEqual({
      requirements: [],
      cronjob_override: { consolidate_after: '1m', spot_enabled: false },
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: true },
    })
  })
})
