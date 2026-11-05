import { type PermissionTarget, type PresetId, type RoleScope } from './rbac-v2-mock-data'

// Next (by target): "On <target> matching <selection>, the member can <capabilities of that target>"
export interface TargetedPermission {
  id: string
  target: PermissionTarget
  // Resources the objects are (in/on) AND tag conditions; both empty: every object of the target
  selection: RoleScope
  preset: PresetId
  added: string[]
  removed: string[]
}

const tag = (key: string, value: string) => ({ key, operator: '=' as const, value })
const every: RoleScope = { resourceIds: [], conditions: [] }

const permission = (
  id: string,
  target: PermissionTarget,
  selection: RoleScope,
  preset: PresetId,
  changes: { added?: string[]; removed?: string[] } = {}
): TargetedPermission => ({ id, target, selection, preset, added: changes.added ?? [], removed: changes.removed ?? [] })

export const TARGETED_PERMISSIONS: Record<string, TargetedPermission[]> = {
  'r-admin': [
    permission('t-admin-c', 'cluster', every, 'manager', {
      added: ['cluster.update', 'cluster.delete', 'cluster.tags'],
    }),
    permission('t-admin-p', 'project', every, 'manager', { added: ['project.tags'] }),
    permission('t-admin-e', 'environment', every, 'manager', { added: ['env.tags', 'service.tags'] }),
  ],
  'r-devops': [
    permission('t-devops-c', 'cluster', every, 'manager', { added: ['cluster.update', 'cluster.delete'] }),
    permission('t-devops-p', 'project', every, 'manager'),
    permission('t-devops-e', 'environment', every, 'manager'),
  ],
  'r-billing': [],
  'r-viewer': [
    permission('t-viewer-c', 'cluster', every, 'viewer'),
    permission('t-viewer-p', 'project', every, 'viewer'),
    permission('t-viewer-e', 'environment', every, 'viewer'),
  ],
  'r-backend': [
    permission('t-be-c', 'cluster', every, 'viewer'),
    permission('t-be-dev', 'environment', { resourceIds: [], conditions: [tag('env_type', 'dev')] }, 'manager'),
    permission(
      't-be-staging',
      'environment',
      { resourceIds: [], conditions: [tag('env_type', 'staging')] },
      'operator'
    ),
    permission('t-be-prod', 'environment', { resourceIds: [], conditions: [tag('env_type', 'prod')] }, 'viewer', {
      removed: ['service.logs'],
    }),
  ],
  'r-prod-primary': [
    permission('t-pp', 'environment', { resourceIds: [], conditions: [tag('instance', 'primary')] }, 'manager', {
      removed: ['env.delete', 'service.delete', 'env.stop', 'service.stop'],
    }),
  ],
  'r-prod-eu': [
    permission('t-peu', 'environment', { resourceIds: [], conditions: [tag('instance', 'eu')] }, 'operator'),
  ],
  'r-ares': [
    permission('t-ares-c', 'cluster', { resourceIds: ['c-prod-hipaa'], conditions: [] }, 'deployer'),
    permission('t-ares-e', 'environment', { resourceIds: ['c-prod-hipaa'], conditions: [] }, 'operator'),
  ],
  'r-course-proxy': [permission('t-cp', 'environment', { resourceIds: ['s-ares-proxy'], conditions: [] }, 'deployer')],
  'r-signal': [
    permission(
      't-signal',
      'environment',
      // Specific services narrow the permission to them: signal in the non-HIPAA instances
      { resourceIds: ['s-primary-signal', 's-eu-signal'], conditions: [] },
      'deployer',
      { added: ['service.port-forward'] }
    ),
  ],
  // A v1 "project × environment type" level becomes one permission on environments
  'r-v1-qa': [
    permission('t-qa-1', 'environment', { resourceIds: ['p-core'], conditions: [tag('env_type', 'prod')] }, 'viewer'),
    permission(
      't-qa-2',
      'environment',
      { resourceIds: ['p-core'], conditions: [tag('env_type', 'staging')] },
      'deployer'
    ),
  ],
  'r-v1-developer': [
    permission('t-dev-c1', 'cluster', { resourceIds: ['c-prod-us'], conditions: [] }, 'viewer'),
    permission('t-dev-c2', 'cluster', { resourceIds: ['c-staging'], conditions: [] }, 'deployer'),
    permission('t-dev-1', 'environment', { resourceIds: ['p-core'], conditions: [tag('env_type', 'prod')] }, 'viewer'),
    permission(
      't-dev-2',
      'environment',
      { resourceIds: ['p-core'], conditions: [tag('env_type', 'staging')] },
      'deployer'
    ),
    permission(
      't-dev-3',
      'environment',
      { resourceIds: ['p-core'], conditions: [tag('env_type', 'dev')] },
      'deployer',
      {
        added: ['service.shell'],
      }
    ),
    permission(
      't-dev-4',
      'environment',
      { resourceIds: ['p-payments'], conditions: [tag('env_type', 'dev')] },
      'manager'
    ),
  ],
}

// How a v1 custom role was migrated: each v1 rule and the permission it became (none when it granted nothing)
export const V1_MIGRATIONS: Record<string, { v1: string; permissionId?: string; implied?: boolean }[]> = {
  'r-v1-developer': [
    { v1: 'Cluster prod-us · Read-only', permissionId: 't-dev-c1' },
    { v1: 'Cluster staging · Create environment', permissionId: 't-dev-c2' },
    { v1: 'See projects Core app and Payments (implied in v1)', implied: true },
    { v1: 'Project Core app · Production · Read-only', permissionId: 't-dev-1' },
    { v1: 'Project Core app · Staging · Deploy', permissionId: 't-dev-2' },
    { v1: 'Project Core app · Development · Deploy + Shell', permissionId: 't-dev-3' },
    { v1: 'Project Payments · Development · Manage', permissionId: 't-dev-4' },
    { v1: 'Project Payments · Production · No access' },
  ],
}
