import { useQuery } from '@tanstack/react-query'
import { type SkillPresetAssignees, getSkillPresetsMockScenario } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

/**
 * Roles and members a preset can be assigned to. Reuses the Console's members and available roles
 * queries (same cache as the members and roles settings pages). In mock mode, the mock organization's
 * people are used instead, so mock presets never point at real members.
 */
export function useSkillPresetAssignees({ organizationId }: { organizationId: string }) {
  const isMock = getSkillPresetsMockScenario() !== null
  const enabled = Boolean(organizationId)

  const mock = useQuery({ ...queries.skillPresets.mockAssignees({ organizationId }), enabled: enabled && isMock })
  const members = useQuery({ ...queries.organizations.members({ organizationId }), enabled: enabled && !isMock })
  const roles = useQuery({ ...queries.organizations.availableRoles({ organizationId }), enabled: enabled && !isMock })

  if (isMock) return { data: mock.data, isLoading: mock.isLoading, error: mock.error }

  const data: SkillPresetAssignees | undefined =
    members.data && roles.data
      ? {
          roles: roles.data.map(({ id, name }) => ({ id, name })),
          members: members.data.map(({ id, name, nickname, email, role_id }) => ({
            id,
            name: name || nickname || email,
            email,
            role_id,
          })),
        }
      : undefined
  return { data, isLoading: members.isLoading || roles.isLoading, error: members.error ?? roles.error }
}
