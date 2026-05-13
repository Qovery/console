const NODE_AFFINITY_REQUIRED_SETTING = 'deployment.affinity.node.required'
const KARPENTER_CAPACITY_TYPE_LABEL = 'karpenter.sh/capacity-type'
const KARPENTER_NODEPOOL_LABEL = 'karpenter.sh/nodepool'

const STABLE_NODEPOOL_AFFINITY = {
  [KARPENTER_CAPACITY_TYPE_LABEL]: 'on-demand',
  [KARPENTER_NODEPOOL_LABEL]: 'stable',
}

function getNodeAffinityRequired(advancedSettings?: unknown): Record<string, unknown> {
  const settings = advancedSettings as Record<string, unknown> | undefined
  const nodeAffinityRequired = settings?.[NODE_AFFINITY_REQUIRED_SETTING]

  return nodeAffinityRequired && typeof nodeAffinityRequired === 'object' && !Array.isArray(nodeAffinityRequired)
    ? { ...nodeAffinityRequired }
    : {}
}

export function loadStableNodepoolFromAdvancedSettings(advancedSettings?: unknown): boolean {
  const nodeAffinityRequired = getNodeAffinityRequired(advancedSettings)

  return Object.entries(STABLE_NODEPOOL_AFFINITY).every(([key, value]) => nodeAffinityRequired[key] === value)
}

export function buildStableNodepoolAdvancedSettingsPayload(
  useStableNodepool: boolean,
  currentAdvancedSettings: unknown
) {
  const settings = currentAdvancedSettings as Record<string, unknown>
  const nodeAffinityRequired = getNodeAffinityRequired(settings)

  Object.keys(STABLE_NODEPOOL_AFFINITY).forEach((key) => {
    delete nodeAffinityRequired[key]
  })

  return {
    ...settings,
    [NODE_AFFINITY_REQUIRED_SETTING]: useStableNodepool
      ? {
          ...nodeAffinityRequired,
          ...STABLE_NODEPOOL_AFFINITY,
        }
      : nodeAffinityRequired,
  }
}
