import { useQuery } from '@tanstack/react-query'
import { type SkillPresetAssignees } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

/**
 * Roles and members a preset can be assigned to. Reuses the Console's members and available roles
 * queries (same cache as the members and roles settings pages).
 */
export function useSkillPresetAssignees({ organizationId }: { organizationId: string }) {
  const enabled = Boolean(organizationId)
  const members = useQuery({ ...queries.organizations.members({ organizationId }), enabled })
  const roles = useQuery({ ...queries.organizations.availableRoles({ organizationId }), enabled })

  const data: SkillPresetAssignees | undefined =
    members.data && roles.data
      ? {
          roles: roles.data.map(({ id, name }) => ({ id, name })),
          members: members.data.map(({ id, name, nickname, email, role_id, profile_picture_url }) => ({
            id,
            name: name || nickname || email,
            email,
            role_id,
            profile_picture_url,
          })),
        }
      : undefined
  return { data, isLoading: members.isLoading || roles.isLoading, error: members.error ?? roles.error }
}
