import {
  PERMISSION_TARGETS,
  type PermissionTarget,
  type PresetId,
  type RoleScope,
  capabilitiesOfPreset,
  capabilityById,
} from './rbac-v2-mock-data'

// Next (by target): "On <target> matching <selection>, the member can <capabilities of that target>"
export interface TargetedPermission {
  id: string
  target: PermissionTarget
  // Resources the objects are (in/on) AND label conditions; both empty: every object of the target
  selection: RoleScope
  // The capabilities granted, all of the target's kind. A preset only fills this list, it is not stored.
  capabilities: string[]
}

const tag = (key: string, value: string) => ({ key, operator: '=' as const, value })
const every: RoleScope = { resourceIds: [], conditions: [] }
const scope = (resourceIds: string[], ...conditions: ReturnType<typeof tag>[]): RoleScope => ({
  resourceIds,
  conditions,
})

type Changes = { added?: string[]; removed?: string[] }

const permission = (
  id: string,
  target: PermissionTarget,
  selection: RoleScope,
  preset: PresetId,
  changes: Changes = {}
): TargetedPermission => {
  // Changes may list capabilities of several targets: keep the ones of this target
  const levels = PERMISSION_TARGETS.find((item) => item.target === target)?.levels ?? []
  const ofTarget = (ids: string[] = []) =>
    ids.filter((capability) => levels.includes(capabilityById(capability)?.level ?? 'organization'))
  return {
    id,
    target,
    selection,
    capabilities: [...capabilitiesOfPreset(preset, target), ...ofTarget(changes.added)].filter(
      (capability) => !ofTarget(changes.removed).includes(capability)
    ),
  }
}

// The same access on environments and on their services: two permissions, `<id>-env` and `<id>-svc`
const environmentsAndServices = (id: string, selection: RoleScope, preset: PresetId, changes: Changes = {}) => [
  permission(`${id}-env`, 'environment', selection, preset, changes),
  permission(`${id}-svc`, 'service', selection, preset, changes),
]

export const TARGETED_PERMISSIONS: Record<string, TargetedPermission[]> = {
  'r-admin': [
    permission('t-admin-c', 'cluster', every, 'manager', {
      added: ['cluster.update', 'cluster.delete', 'cluster.tags'],
    }),
    permission('t-admin-p', 'project', every, 'manager', { added: ['project.tags'] }),
    ...environmentsAndServices('t-admin', every, 'manager', { added: ['env.tags', 'service.tags'] }),
  ],
  'r-devops': [
    permission('t-devops-c', 'cluster', every, 'manager', { added: ['cluster.update', 'cluster.delete'] }),
    permission('t-devops-p', 'project', every, 'manager'),
    ...environmentsAndServices('t-devops', every, 'manager'),
  ],
  'r-billing': [],
  'r-viewer': [
    permission('t-viewer-c', 'cluster', every, 'viewer'),
    permission('t-viewer-p', 'project', every, 'viewer'),
    ...environmentsAndServices('t-viewer', every, 'viewer'),
  ],
  'r-backend': [
    permission('t-be-c', 'cluster', every, 'viewer'),
    ...environmentsAndServices('t-be-dev', scope([], tag('env_type', 'dev')), 'manager'),
    ...environmentsAndServices('t-be-staging', scope([], tag('env_type', 'staging')), 'operator'),
    // In production, the environments are visible but the services' logs are not
    ...environmentsAndServices('t-be-prod', scope([], tag('env_type', 'prod')), 'viewer', {
      removed: ['service.logs'],
    }),
  ],
  'r-prod-primary': environmentsAndServices('t-pp', scope([], tag('instance', 'primary')), 'manager', {
    removed: ['env.delete', 'service.delete', 'env.stop', 'service.stop'],
  }),
  'r-prod-eu': environmentsAndServices('t-peu', scope([], tag('instance', 'eu')), 'operator'),
  'r-ares': [
    permission('t-ares-c', 'cluster', scope(['c-prod-hipaa']), 'deployer'),
    ...environmentsAndServices('t-ares', scope(['c-prod-hipaa']), 'operator'),
  ],
  // Only services: their environment stays visible as context
  'r-course-proxy': [permission('t-cp', 'service', scope(['s-ares-proxy']), 'deployer')],
  'r-signal': [
    // signal in the non-HIPAA instances
    permission('t-signal', 'service', scope(['s-primary-signal', 's-eu-signal']), 'deployer', {
      added: ['service.port-forward'],
    }),
  ],
  // A v1 "project × environment type" level becomes permissions on environments and services
  'r-v1-qa': [
    ...environmentsAndServices('t-qa-1', scope(['p-core'], tag('env_type', 'prod')), 'viewer'),
    ...environmentsAndServices('t-qa-2', scope(['p-core'], tag('env_type', 'staging')), 'deployer'),
  ],
  'r-v1-developer': [
    permission('t-dev-c1', 'cluster', scope(['c-prod-us']), 'viewer'),
    permission('t-dev-c2', 'cluster', scope(['c-staging']), 'deployer'),
    ...environmentsAndServices('t-dev-1', scope(['p-core'], tag('env_type', 'prod')), 'viewer'),
    ...environmentsAndServices('t-dev-2', scope(['p-core'], tag('env_type', 'staging')), 'deployer'),
    ...environmentsAndServices('t-dev-3', scope(['p-core'], tag('env_type', 'dev')), 'deployer', {
      added: ['service.shell'],
    }),
    ...environmentsAndServices('t-dev-4', scope(['p-payments'], tag('env_type', 'dev')), 'manager'),
  ],
}

// How a v1 custom role was migrated: each v1 rule and the permissions it became (none when it granted nothing)
export const V1_MIGRATIONS: Record<string, { v1: string; permissionIds?: string[]; implied?: boolean }[]> = {
  'r-v1-developer': [
    { v1: 'Cluster prod-us · Read-only', permissionIds: ['t-dev-c1'] },
    { v1: 'Cluster staging · Create environment', permissionIds: ['t-dev-c2'] },
    { v1: 'See projects Core app and Payments (implied in v1)', implied: true },
    { v1: 'Project Core app · Production · Read-only', permissionIds: ['t-dev-1-env', 't-dev-1-svc'] },
    { v1: 'Project Core app · Staging · Deploy', permissionIds: ['t-dev-2-env', 't-dev-2-svc'] },
    { v1: 'Project Core app · Development · Deploy + Shell', permissionIds: ['t-dev-3-env', 't-dev-3-svc'] },
    { v1: 'Project Payments · Development · Manage', permissionIds: ['t-dev-4-env', 't-dev-4-svc'] },
    { v1: 'Project Payments · Production · No access' },
  ],
}
