import {
  buildStableNodepoolAdvancedSettingsPayload,
  loadStableNodepoolFromAdvancedSettings,
} from './stable-nodepool-advanced-settings'

describe('stable-nodepool-advanced-settings', () => {
  describe('loadStableNodepoolFromAdvancedSettings', () => {
    it('should return true when stable nodepool affinity is configured', () => {
      const result = loadStableNodepoolFromAdvancedSettings({
        'deployment.affinity.node.required': {
          'karpenter.sh/capacity-type': 'on-demand',
          'karpenter.sh/nodepool': 'stable',
        },
      })

      expect(result).toBe(true)
    })

    it('should return false when stable nodepool affinity is missing', () => {
      const result = loadStableNodepoolFromAdvancedSettings({
        'deployment.affinity.node.required': {
          'karpenter.sh/nodepool': 'default',
        },
      })

      expect(result).toBe(false)
    })
  })

  describe('buildStableNodepoolAdvancedSettingsPayload', () => {
    it('should add stable nodepool affinity and preserve unrelated settings', () => {
      const result = buildStableNodepoolAdvancedSettingsPayload(true, {
        'deployment.termination_grace_period_seconds': 30,
        'deployment.affinity.node.required': {
          'kubernetes.io/arch': 'arm64',
        },
      })

      expect(result).toEqual({
        'deployment.termination_grace_period_seconds': 30,
        'deployment.affinity.node.required': {
          'kubernetes.io/arch': 'arm64',
          'karpenter.sh/capacity-type': 'on-demand',
          'karpenter.sh/nodepool': 'stable',
        },
      })
    })

    it('should remove stable nodepool affinity and preserve unrelated node affinity', () => {
      const result = buildStableNodepoolAdvancedSettingsPayload(false, {
        'deployment.affinity.node.required': {
          'kubernetes.io/arch': 'arm64',
          'karpenter.sh/capacity-type': 'on-demand',
          'karpenter.sh/nodepool': 'stable',
        },
      })

      expect(result).toEqual({
        'deployment.affinity.node.required': {
          'kubernetes.io/arch': 'arm64',
        },
      })
    })
  })
})
