import { type KarpenterNodePoolRequirement } from 'qovery-typescript-axios'
import { mapCreationSpotToNodePools } from './map-creation-spot-to-node-pools'

const requirements: KarpenterNodePoolRequirement[] = [{ key: 'Arch', operator: 'In', values: ['AMD64'] }]

describe('mapCreationSpotToNodePools', () => {
  it('enables spot on the default nodepool and keeps the stable one on-demand', () => {
    expect(mapCreationSpotToNodePools(true, { requirements })).toEqual({
      requirements,
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: false },
    })
  })

  it('disables spot on both nodepools when the button is off', () => {
    expect(mapCreationSpotToNodePools(false, { requirements })).toEqual({
      requirements,
      default_override: { spot_enabled: false },
      stable_override: { spot_enabled: false },
    })
  })

  it('follows the button on the cronjob nodepool when it was enabled', () => {
    expect(
      mapCreationSpotToNodePools(true, {
        requirements,
        cronjob_override: { consolidate_after: '1m' },
      })
    ).toEqual({
      requirements,
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: false },
      cronjob_override: { consolidate_after: '1m', spot_enabled: true },
    })
  })

  it('disables spot on the cronjob nodepool when the button is off', () => {
    expect(
      mapCreationSpotToNodePools(false, {
        requirements,
        cronjob_override: { consolidate_after: '1m' },
      })
    ).toEqual({
      requirements,
      default_override: { spot_enabled: false },
      stable_override: { spot_enabled: false },
      cronjob_override: { consolidate_after: '1m', spot_enabled: false },
    })
  })

  it('never creates a cronjob override when the cronjob nodepool was not enabled', () => {
    expect(mapCreationSpotToNodePools(true, { requirements })).not.toHaveProperty('cronjob_override')
    expect(mapCreationSpotToNodePools(false, { requirements })).not.toHaveProperty('cronjob_override')
  })

  it('preserves the other fields of pre-existing overrides', () => {
    expect(
      mapCreationSpotToNodePools(true, {
        requirements,
        default_override: {
          limits: { enabled: true, max_cpu_in_vcpu: 6, max_memory_in_gibibytes: 10, max_gpu: 0 },
          consolidate_after: '30m',
        },
        stable_override: {
          consolidation: { enabled: true, days: ['SUNDAY'], start_time: 'PT10:00', duration: 'PT2H' },
          consolidate_after: '30s',
        },
      })
    ).toEqual({
      requirements,
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

  it('leaves the gpu nodepool untouched', () => {
    expect(
      mapCreationSpotToNodePools(true, {
        requirements,
        gpu_override: { disk_size_in_gib: 100, spot_enabled: false },
      })
    ).toEqual({
      requirements,
      gpu_override: { disk_size_in_gib: 100, spot_enabled: false },
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: false },
    })
  })

  it('tolerates a missing nodepool object', () => {
    expect(mapCreationSpotToNodePools(true)).toEqual({
      requirements: [],
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: false },
    })
  })
})
