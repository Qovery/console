import { isOwnerRole } from './skill-presets.limits'
import {
  type SkillPresetAssignedTo,
  type SkillPresetAssignees,
  type SkillPresetResolutionSource,
} from './skill-presets.types'

export interface AssignablePreset {
  id: string
  name: string
  assigned_to: SkillPresetAssignedTo
}

export interface ResolvedPreset<T extends AssignablePreset> {
  source: SkillPresetResolutionSource
  preset: T | null
}

/** q-core resolves the organization owner as an admin: the Owner role gets the Admin role's preset. */
export function effectiveRoleId(roleId: string | undefined, roles: SkillPresetAssignees['roles'] = []) {
  const role = roles.find(({ id }) => id === roleId)
  if (!role || !isOwnerRole(role)) return roleId
  return roles.find(({ name }) => name.toLowerCase() === 'admin')?.id ?? roleId
}

/** Same order as q-core: the member's own assignment, then their role's, then the organization default. */
export function resolvePresetFor<T extends AssignablePreset>(
  presets: T[],
  target: { userId?: string; roleId?: string }
): ResolvedPreset<T> {
  const byUser = target.userId && presets.find(({ assigned_to }) => assigned_to.user_ids.includes(target.userId ?? ''))
  if (byUser) return { source: 'USER', preset: byUser }
  const byRole = target.roleId && presets.find(({ assigned_to }) => assigned_to.role_ids.includes(target.roleId ?? ''))
  if (byRole) return { source: 'ROLE', preset: byRole }
  const byDefault = presets.find(({ assigned_to }) => assigned_to.organization_default)
  if (byDefault) return { source: 'ORGANIZATION', preset: byDefault }
  return { source: 'QOVERY_DEFAULT', preset: null }
}
