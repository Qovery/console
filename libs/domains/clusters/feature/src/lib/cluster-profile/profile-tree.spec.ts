import { type PlatformTemplateSummaryResponse } from 'qovery-typescript-axios'
import { getProfileTree, resolveProfileSelection } from './profile-tree'

const field = { key: 'replicas', type: 'int' }
const template = {
  key: 'qovery-cluster-v0',
  version: '1.0.0',
  layers: [
    { key: 'network', components: [{ key: 'envoy', fields: [field] }] },
    {
      key: 'karpenter',
      components: [
        { key: 'karpenter-crd', fields: [] },
        { key: 'karpenter-configuration', fields: [field] },
      ],
    },
    {
      key: 'log-infra',
      components: [
        { key: 'loki', fields: [field] },
        { key: 'alloy', fields: [field] },
      ],
    },
  ],
} as unknown as PlatformTemplateSummaryResponse
const profileTree = getProfileTree(template, [{ key: 'network', status: 'SKIPPED', reason: '', componentKeys: [] }])

describe('resolveProfileSelection', () => {
  it('keeps a configurable component', () => {
    expect(resolveProfileSelection(profileTree, 'alloy').component?.key).toBe('alloy')
  })

  it.each([undefined, 'unknown', 'envoy', 'network'])('falls back to the default component (%s)', (requestedKey) => {
    const { layer, component } = resolveProfileSelection(profileTree, requestedKey)

    expect(layer?.id).toBe('log-infra')
    expect(component?.key).toBe('loki')
  })

  it.each(['karpenter', 'karpenter-crd'])(
    'opens the first configurable component of the requested layer (%s)',
    (requestedKey) => {
      expect(resolveProfileSelection(profileTree, requestedKey).component?.key).toBe('karpenter-configuration')
    }
  )

  it('selects nothing when every layer is skipped, managed by Qovery or has nothing to configure', () => {
    const lockedTree = getProfileTree(template, [
      { key: 'network', status: 'SKIPPED', reason: '', componentKeys: [] },
      { key: 'log-infra', status: 'DISABLED', reason: '', componentKeys: [] },
      { key: 'karpenter', status: 'DISABLED', reason: '', componentKeys: [] },
    ])

    expect(resolveProfileSelection(lockedTree, undefined)).toEqual({ layer: undefined, component: undefined })
    expect(resolveProfileSelection(lockedTree, 'loki')).toEqual({ layer: undefined, component: undefined })
  })
})
