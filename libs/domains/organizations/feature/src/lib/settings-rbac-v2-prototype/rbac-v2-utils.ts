import { type Assignment, type Group, type Role } from './rbac-v2-mock-data'

export type RoleSourceKind = 'direct' | 'idp-mapping' | 'group' | 'delegated'

export interface RoleSource {
  roleId: string
  kind: RoleSourceKind
  assignment?: Assignment
  // Every group granting the role, when it comes from groups
  groups?: Group[]
}

// In the MVP, IdP groups map to a single role and groups created in Qovery do not exist yet. Temporary access is a
// plain assignment an admin removes by hand, so delegated grants show up as direct ones.
// A member holds each role at most once. When a group grants a role the member was also assigned by hand, the group
// takes over: the manual assignment is converted, so leaving the group removes the role.
export function getRoleSources({
  principalId,
  assignments,
  groups,
  isTarget,
  hasGroups,
}: {
  principalId: string
  assignments: Assignment[]
  groups: Group[]
  isTarget: boolean
  // In the target solution, groups hold several roles and can be created in Qovery; before, an IdP group maps to one role
  hasGroups: boolean
}): RoleSource[] {
  const fromAssignments = assignments
    .filter((assignment) => assignment.principalId === principalId)
    .map<RoleSource>((assignment) => ({
      roleId: assignment.roleId,
      kind: isTarget && assignment.source === 'delegated' ? 'delegated' : 'direct',
      // End dates on assignments are not part of the MVP
      assignment: isTarget ? assignment : { ...assignment, expiresIn: undefined, justification: undefined },
    }))

  const groupsByRole = new Map<string, Group[]>()
  groups
    .filter((group) => group.memberIds.includes(principalId))
    .filter((group) => hasGroups || group.source === 'idp')
    .forEach((group) =>
      (hasGroups ? group.roleIds : group.roleIds.slice(0, 1)).forEach((roleId) =>
        groupsByRole.set(roleId, [...(groupsByRole.get(roleId) ?? []), group])
      )
    )

  const fromGroups = [...groupsByRole].map<RoleSource>(([roleId, roleGroups]) => ({
    roleId,
    kind: hasGroups ? 'group' : 'idp-mapping',
    groups: roleGroups,
  }))

  return [...fromGroups, ...fromAssignments.filter((source) => !groupsByRole.has(source.roleId))]
}

export const uniqueRoles = (sources: RoleSource[], roles: Role[]) =>
  roles.filter((role) => sources.some((source) => source.roleId === role.id))
