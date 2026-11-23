import {
  type SkillPresetAssignedTo,
  type SkillPresetAssignees,
  type SkillPresetResolutionSource,
} from '@qovery/domains/skill-presets/data-access'

export interface AssignablePreset {
  id: string
  name: string
  assigned_to: SkillPresetAssignedTo
}

export interface ResolvedPreset<T extends AssignablePreset> {
  source: SkillPresetResolutionSource
  preset: T | null
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

export const RESOLUTION_SOURCE_LABELS: Record<SkillPresetResolutionSource, string> = {
  USER: 'Assigned to the member',
  ROLE: 'From their role',
  ORGANIZATION: 'Organization default',
  QOVERY_DEFAULT: 'No preset: Qovery skills as published',
}

/**
 * Who would receive [draft] once saved, among all members: members it would win for, given the
 * other presets' assignments.
 */
export function membersReceiving(
  draft: AssignablePreset,
  otherPresets: AssignablePreset[],
  members: SkillPresetAssignees['members']
) {
  const presets = [draft, ...otherPresets.filter(({ id }) => id !== draft.id)]
  return members.filter(
    ({ id, role_id }) => resolvePresetFor(presets, { userId: id, roleId: role_id }).preset?.id === draft.id
  )
}

/** Targets of [assignedTo] that another preset already holds: q-core answers 409 for them. */
export function assignmentConflicts(
  assignedTo: SkillPresetAssignedTo,
  otherPresets: AssignablePreset[],
  selfId?: string
) {
  const others = otherPresets.filter(({ id }) => id !== selfId)
  return {
    organizationDefault: assignedTo.organization_default
      ? others.find(({ assigned_to }) => assigned_to.organization_default) ?? null
      : null,
    roles: assignedTo.role_ids
      .map((roleId) => ({ roleId, preset: others.find(({ assigned_to }) => assigned_to.role_ids.includes(roleId)) }))
      .filter((conflict): conflict is { roleId: string; preset: AssignablePreset } => Boolean(conflict.preset)),
    users: assignedTo.user_ids
      .map((userId) => ({ userId, preset: others.find(({ assigned_to }) => assigned_to.user_ids.includes(userId)) }))
      .filter((conflict): conflict is { userId: string; preset: AssignablePreset } => Boolean(conflict.preset)),
  }
}

/** Templates are starting points admins copy: q-core never resolves them for anyone. */
export const isTemplate = (preset: { is_template?: boolean }) => Boolean(preset.is_template)
