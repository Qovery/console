import { type Cluster } from 'qovery-typescript-axios'
import { getGpuLimitBlockingRollingUpdate } from './get-gpu-limit-blocking-rolling-update'

function createCluster({ enabled = true, maxGpu = 1 }: { enabled?: boolean; maxGpu?: number } = {}) {
  return {
    features: [
      {
        id: 'KARPENTER',
        value_object: {
          type: 'KARPENTER',
          value: {
            spot_enabled: false,
            disk_size_in_gib: 50,
            default_service_architecture: 'AMD64',
            qovery_node_pools: {
              requirements: [],
              gpu_override: {
                requirements: [],
                limits: { enabled, max_cpu_in_vcpu: 100, max_memory_in_gibibytes: 100, max_gpu: maxGpu },
              },
            },
          },
        },
      },
    ],
  } as unknown as Cluster
}

const blockedParams = {
  serviceType: 'APPLICATION' as const,
  hasStorage: false,
  cluster: createCluster({ maxGpu: 1 }),
  advancedSettings: {
    'deployment.update_strategy.type': 'RollingUpdate' as const,
    'deployment.update_strategy.rolling_update.max_surge_percent': 25,
    'deployment.update_strategy.rolling_update.max_unavailable_percent': 25,
  },
  gpu: 1,
  minRunningInstances: 1,
  maxRunningInstances: 1,
}

function withInstances(instances: number, maxGpu: number) {
  return {
    ...blockedParams,
    cluster: createCluster({ maxGpu }),
    minRunningInstances: instances,
    maxRunningInstances: instances,
  }
}

describe('getGpuLimitBlockingRollingUpdate', () => {
  it.each(['APPLICATION', 'CONTAINER'] as const)(
    'returns the GPU limit when the extra pod of a %s does not fit',
    (serviceType) => {
      expect(getGpuLimitBlockingRollingUpdate({ ...blockedParams, serviceType })).toBe(1)
    }
  )

  it('treats missing rolling update settings as RollingUpdate with 25%', () => {
    expect(getGpuLimitBlockingRollingUpdate({ ...withInstances(3, 3), advancedSettings: {} })).toBe(3)
  })

  it.each(['JOB', 'TERRAFORM'] as const)('ignores %s services', (serviceType) => {
    expect(getGpuLimitBlockingRollingUpdate({ ...blockedParams, serviceType })).toBeUndefined()
  })

  it('ignores services with storage, which the engine always recreates', () => {
    expect(getGpuLimitBlockingRollingUpdate({ ...blockedParams, hasStorage: true })).toBeUndefined()
  })

  it('ignores the Recreate strategy', () => {
    expect(
      getGpuLimitBlockingRollingUpdate({
        ...blockedParams,
        advancedSettings: { 'deployment.update_strategy.type': 'Recreate' },
      })
    ).toBeUndefined()
  })

  it('ignores disabled GPU pool limits', () => {
    expect(
      getGpuLimitBlockingRollingUpdate({ ...blockedParams, cluster: createCluster({ enabled: false }) })
    ).toBeUndefined()
  })

  it('ignores a GPU pool limit of 0', () => {
    expect(
      getGpuLimitBlockingRollingUpdate({ ...blockedParams, cluster: createCluster({ maxGpu: 0 }) })
    ).toBeUndefined()
  })

  it('ignores non-Karpenter clusters', () => {
    expect(
      getGpuLimitBlockingRollingUpdate({ ...blockedParams, cluster: { features: [] } as unknown as Cluster })
    ).toBeUndefined()
  })

  it('ignores the creation flow, where advanced settings are not loaded', () => {
    expect(getGpuLimitBlockingRollingUpdate({ ...blockedParams, advancedSettings: undefined })).toBeUndefined()
  })

  it('ignores services without GPU', () => {
    expect(getGpuLimitBlockingRollingUpdate({ ...blockedParams, gpu: 0 })).toBeUndefined()
  })

  it('ignores a pool with room for the extra pod', () => {
    expect(getGpuLimitBlockingRollingUpdate(withInstances(1, 2))).toBeUndefined()
  })

  it('ignores services that already exceed the limit without the extra pod', () => {
    expect(getGpuLimitBlockingRollingUpdate(withInstances(2, 1))).toBeUndefined()
  })

  describe('with a single instance, where the engine renders maxSurge 1 only', () => {
    it('warns whatever the max unavailable percent', () => {
      expect(
        getGpuLimitBlockingRollingUpdate({
          ...blockedParams,
          advancedSettings: { 'deployment.update_strategy.rolling_update.max_unavailable_percent': 100 },
        })
      ).toBe(1)
    })

    it('warns whatever the max surge percent', () => {
      expect(
        getGpuLimitBlockingRollingUpdate({
          ...blockedParams,
          advancedSettings: { 'deployment.update_strategy.rolling_update.max_surge_percent': 0 },
        })
      ).toBe(1)
    })

    it('counts the GPUs of the extra pod', () => {
      expect(getGpuLimitBlockingRollingUpdate({ ...withInstances(1, 3), gpu: 2 })).toBe(3)
    })
  })

  describe('with several instances', () => {
    it('warns when 3 instances at 25% cannot stop an old pod and one extra pod does not fit', () => {
      expect(getGpuLimitBlockingRollingUpdate(withInstances(3, 3))).toBe(3)
    })

    it('ignores 4 instances at 25%, where stopping an old pod frees a GPU', () => {
      expect(getGpuLimitBlockingRollingUpdate(withInstances(4, 4))).toBeUndefined()
    })

    it('ignores a max unavailable that lets the rollout stop an old pod', () => {
      expect(
        getGpuLimitBlockingRollingUpdate({
          ...withInstances(2, 2),
          advancedSettings: { 'deployment.update_strategy.rolling_update.max_unavailable_percent': 50 },
        })
      ).toBeUndefined()
    })

    it('ignores a pool with room for one extra pod, even when the full surge does not fit', () => {
      expect(
        getGpuLimitBlockingRollingUpdate({
          ...withInstances(4, 5),
          advancedSettings: {
            'deployment.update_strategy.rolling_update.max_surge_percent': 50,
            'deployment.update_strategy.rolling_update.max_unavailable_percent': 0,
          },
        })
      ).toBeUndefined()
    })

    it('warns when the replica count that fills the pool cannot add one pod, whatever the max surge', () => {
      expect(
        getGpuLimitBlockingRollingUpdate({
          ...withInstances(4, 5),
          maxRunningInstances: 8,
          advancedSettings: {
            'deployment.update_strategy.rolling_update.max_surge_percent': 50,
            'deployment.update_strategy.rolling_update.max_unavailable_percent': 0,
          },
        })
      ).toBe(5)
    })

    it('ignores a max surge of 0, where Kubernetes stops an old pod instead', () => {
      expect(
        getGpuLimitBlockingRollingUpdate({
          ...withInstances(2, 2),
          advancedSettings: { 'deployment.update_strategy.rolling_update.max_surge_percent': 0 },
        })
      ).toBeUndefined()
    })
  })

  describe('with autoscaling', () => {
    it('warns when a replica count in the range cannot roll out', () => {
      expect(
        getGpuLimitBlockingRollingUpdate({
          ...blockedParams,
          cluster: createCluster({ maxGpu: 3 }),
          minRunningInstances: 2,
          maxRunningInstances: 4,
        })
      ).toBe(3)
    })

    it('ignores a range where every replica count can roll out', () => {
      expect(
        getGpuLimitBlockingRollingUpdate({
          ...blockedParams,
          cluster: createCluster({ maxGpu: 4 }),
          minRunningInstances: 4,
          maxRunningInstances: 8,
        })
      ).toBeUndefined()
    })

    it('ignores a scale to zero minimum when only 0 replicas fill the pool', () => {
      expect(
        getGpuLimitBlockingRollingUpdate({
          ...blockedParams,
          gpu: 2,
          minRunningInstances: 0,
          maxRunningInstances: 3,
        })
      ).toBeUndefined()
    })
  })
})
