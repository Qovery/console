import {
  type Assignment,
  type Group,
  capabilitiesOfPreset,
  matchTargetSelection,
  presetMatching,
} from './rbac-v2-mock-data'
import { TARGETED_PERMISSIONS } from './rbac-v2-targeted-data'
import { getRoleSources } from './rbac-v2-utils'

const manual = (roleId: string): Assignment => ({
  id: `a-${roleId}`,
  principalId: 'u-leo',
  roleId,
  source: 'admin',
  grantedBy: 'u-vincy',
})

const group = (id: string, roleIds: string[], source: Group['source'] = 'idp'): Group => ({
  id,
  name: id,
  source,
  memberIds: ['u-leo'],
  roleIds,
})

describe('getRoleSources', () => {
  it('should convert a manual assignment into a group one when a group grants the same role', () => {
    const sources = getRoleSources({
      principalId: 'u-leo',
      assignments: [manual('r-backend')],
      groups: [group('eng-backend', ['r-backend'])],
      isTarget: false,
      hasGroups: false,
    })

    expect(sources).toEqual([
      { roleId: 'r-backend', kind: 'idp-mapping', groups: [expect.objectContaining({ id: 'eng-backend' })] },
    ])
  })

  it('should keep a manual assignment that no group covers', () => {
    const sources = getRoleSources({
      principalId: 'u-leo',
      assignments: [manual('r-signal')],
      groups: [group('eng-backend', ['r-backend'])],
      isTarget: false,
      hasGroups: false,
    })

    expect(sources.map((source) => [source.roleId, source.kind])).toEqual([
      ['r-backend', 'idp-mapping'],
      ['r-signal', 'direct'],
    ])
  })

  it('should list a role granted by several groups once, with every group', () => {
    const sources = getRoleSources({
      principalId: 'u-leo',
      assignments: [],
      groups: [group('eng-backend', ['r-backend']), group('on-call', ['r-backend'], 'qovery')],
      isTarget: true,
      hasGroups: true,
    })

    expect(sources).toHaveLength(1)
    expect(sources[0].groups?.map((g) => g.id)).toEqual(['eng-backend', 'on-call'])
  })
})

describe('matchTargetSelection', () => {
  const dev = { key: 'env_type', operator: '=' as const, value: 'dev' }

  it('should match the dev environments running on a cluster, with their services', () => {
    const { objects } = matchTargetSelection('environment', { resourceIds: ['c-staging'], conditions: [dev] })

    expect(objects.map((resource) => resource.id).sort()).toEqual(['e-dev-leo', 'e-pay-dev'])
  })

  it('should match only the selected cluster when targeting clusters', () => {
    const { objects } = matchTargetSelection('cluster', { resourceIds: ['c-prod-hipaa'], conditions: [] })

    expect(objects.map((resource) => resource.id)).toEqual(['c-prod-hipaa'])
  })

  it('should narrow an environment permission to the selected services', () => {
    const { objects, services } = matchTargetSelection('environment', { resourceIds: ['s-ares-proxy'], conditions: [] })

    expect(objects.map((resource) => resource.id)).toEqual(['e-ares'])
    expect(services.map((resource) => resource.id)).toEqual(['s-ares-proxy'])
  })
})

describe('presets', () => {
  it('should not be stored: a permission only keeps its capabilities', () => {
    const permission = TARGETED_PERMISSIONS['r-v1-developer'].find((p) => p.id === 't-dev-3')

    expect(permission).not.toHaveProperty('preset')
    expect(permission?.capabilities).toContain('service.shell')
  })

  it('should be recognized only when the capabilities are exactly the preset ones', () => {
    const deployer = capabilitiesOfPreset('deployer', 'environment')

    expect(presetMatching(deployer, 'environment')?.id).toBe('deployer')
    expect(presetMatching([...deployer, 'service.shell'], 'environment')).toBeUndefined()
  })

  it('should only bring the capabilities of the target', () => {
    expect(capabilitiesOfPreset('viewer', 'cluster')).toEqual(['cluster.view'])
  })
})
