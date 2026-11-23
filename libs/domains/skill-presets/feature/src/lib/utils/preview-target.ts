import { type SkillPresetAssignees } from '@qovery/domains/skill-presets/data-access'
import {
  type AssignablePreset,
  RESOLUTION_SOURCE_LABELS,
  type ResolvedPreset,
  effectiveRoleId,
  resolvePresetFor,
} from './resolve-preset'

export const PREVIEW_ANYONE = 'anyone'

export interface PreviewTarget {
  value: string
  label: string
}

export function previewTargets(assignees?: SkillPresetAssignees): PreviewTarget[] {
  return [
    ...(assignees?.members ?? []).map((member) => ({ value: `user:${member.id}`, label: member.name })),
    ...(assignees?.roles ?? []).map((role) => ({
      value: `role:${role.id}`,
      label: `Anyone with the ${role.name} role`,
    })),
  ]
}

/** Which preset a member or a role gets, with the same order as q-core. */
export function resolvePreviewTarget<T extends AssignablePreset>(
  target: string,
  presets: T[],
  assignees?: SkillPresetAssignees
): ResolvedPreset<T> & { targetLabel: string } {
  const [kind, id] = target.split(':')
  if (kind === 'user') {
    const member = assignees?.members.find((item) => item.id === id)
    return {
      ...resolvePresetFor(presets, { userId: id, roleId: effectiveRoleId(member?.role_id, assignees?.roles) }),
      targetLabel: member?.name ?? 'This member',
    }
  }
  const role = assignees?.roles.find((item) => item.id === id)
  return {
    ...resolvePresetFor(presets, { roleId: effectiveRoleId(id, assignees?.roles) }),
    targetLabel: role ? `The ${role.name} role` : 'This role',
  }
}

export const describeResolution = (resolved: ResolvedPreset<AssignablePreset>) =>
  resolved.preset
    ? `${resolved.preset.name} (${RESOLUTION_SOURCE_LABELS[resolved.source].toLowerCase()})`
    : RESOLUTION_SOURCE_LABELS.QOVERY_DEFAULT
