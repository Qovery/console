import { type AssignablePreset, effectiveRoleId, resolvePresetFor } from '@qovery/domains/skill-presets/util'
import { type SkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'

/**
 * Who would receive [draft] once saved, among all members: members it would win for, given the
 * other presets' assignments.
 */
export function membersReceiving(
  draft: AssignablePreset,
  otherPresets: AssignablePreset[],
  { members, roles }: SkillPresetAssignees
) {
  const presets = [draft, ...otherPresets.filter(({ id }) => id !== draft.id)]
  return members.filter(
    ({ id, role_id }) =>
      resolvePresetFor(presets, { userId: id, roleId: effectiveRoleId(role_id, roles) }).preset?.id === draft.id
  )
}

/** Templates are starting points admins copy: q-core never resolves them for anyone. */
export const isTemplate = (preset: { is_template?: boolean }) => Boolean(preset.is_template)
