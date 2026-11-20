import { type ReactNode, createContext, useContext, useMemo, useState } from 'react'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import {
  ACCESS_REQUESTS,
  type AccessRequest,
  type Assignment,
  type Group,
  INITIAL_ASSIGNMENTS,
  INITIAL_GROUPS,
  INITIAL_ROLES,
  type PrototypeMode,
  type Role,
  STAGE_ORDER,
  stageAtLeast,
} from './rbac-v2-mock-data'
import { TARGETED_PERMISSIONS, type TargetedPermission } from './rbac-v2-targeted-data'

export const RBAC_PROTOTYPE_MODE_KEY = 'rbac-v2-prototype-mode'

// Without an IdP, there are no synced groups: the roles their members got from them are assigned by hand instead,
// so the demo keeps the same access in both variants
function withoutIdp(groups: Group[], assignments: Assignment[]) {
  const assigned = new Set(assignments.map((assignment) => `${assignment.principalId}:${assignment.roleId}`))
  const converted = groups
    .filter((group) => group.source === 'idp')
    .flatMap((group) =>
      group.memberIds.flatMap((principalId) =>
        group.roleIds.map<Assignment>((roleId) => ({
          id: `no-idp-${group.id}-${principalId}-${roleId}`,
          principalId,
          roleId,
          source: 'admin',
          grantedBy: 'u-vincy',
        }))
      )
    )
    .filter((assignment) => {
      const key = `${assignment.principalId}:${assignment.roleId}`
      if (assigned.has(key)) return false
      assigned.add(key)
      return true
    })

  return {
    groups: groups.filter((group) => group.source !== 'idp'),
    assignments: [...converted, ...assignments],
  }
}

interface RbacPrototypeContextValue {
  mode: PrototypeMode
  setMode: (mode: PrototypeMode) => void
  isTarget: boolean
  // From Next: tags, and roles made of permissions instead of today's role editor
  hasTags: boolean
  // Target: groups (synced from the IdP or created in Qovery) and the IdP set up in the console
  hasGroups: boolean
  hasIdp: boolean
  setHasIdp: (hasIdp: boolean) => void
  roles: Role[]
  saveRole: (role: Role) => void
  // Resource permissions of each role, each targeting clusters, projects or environments
  permissionsByRole: Record<string, TargetedPermission[]>
  savePermissions: (roleId: string, permissions: TargetedPermission[]) => void
  groups: Group[]
  setGroups: (groups: Group[]) => void
  assignments: Assignment[]
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void
  removeAssignment: (assignmentId: string) => void
  requests: AccessRequest[]
  resolveRequest: (requestId: string, approved: boolean) => void
}

const RbacPrototypeContext = createContext<RbacPrototypeContextValue | undefined>(undefined)

export function RbacPrototypeProvider({ children }: { children: ReactNode }) {
  const [storedMode, setMode] = useLocalStorage<PrototypeMode>(RBAC_PROTOTYPE_MODE_KEY, 'mvp')
  // A stage saved by an older version of the prototype falls back to the MVP
  const mode = STAGE_ORDER.includes(storedMode) ? storedMode : 'mvp'
  const [roles, setRoles] = useState(INITIAL_ROLES)
  const [permissionsByRole, setPermissionsByRole] = useState(TARGETED_PERMISSIONS)
  const [groups, setGroups] = useState(INITIAL_GROUPS)
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS)
  const [requests, setRequests] = useState(ACCESS_REQUESTS)
  // Not remembered across reloads: every demo starts without an IdP
  const [hasIdp, setHasIdp] = useState(false)
  // Assignments derived for the "no IdP" variant are not stored, so removing one is remembered here
  const [removedIds, setRemovedIds] = useState<string[]>([])

  const effective = useMemo(() => {
    const data = hasIdp ? { groups, assignments } : withoutIdp(groups, assignments)
    return { ...data, assignments: data.assignments.filter((assignment) => !removedIds.includes(assignment.id)) }
  }, [hasIdp, groups, assignments, removedIds])

  const value = useMemo<RbacPrototypeContextValue>(
    () => ({
      mode,
      setMode,
      isTarget: mode === 'target',
      hasTags: stageAtLeast(mode, 'r1'),
      hasGroups: stageAtLeast(mode, 'target'),
      hasIdp,
      setHasIdp,
      roles,
      saveRole: (role) =>
        setRoles((current) =>
          current.some((r) => r.id === role.id) ? current.map((r) => (r.id === role.id ? role : r)) : [...current, role]
        ),
      permissionsByRole,
      savePermissions: (roleId, permissions) =>
        setPermissionsByRole((current) => ({ ...current, [roleId]: permissions })),
      groups: effective.groups,
      setGroups,
      assignments: effective.assignments,
      addAssignment: (assignment) =>
        setAssignments((current) => [...current, { ...assignment, id: `a-${Date.now()}` }]),
      removeAssignment: (assignmentId) => {
        setAssignments((current) => current.filter((assignment) => assignment.id !== assignmentId))
        setRemovedIds((current) => [...current, assignmentId])
      },
      requests,
      resolveRequest: (requestId, approved) => {
        const request = requests.find((r) => r.id === requestId)
        if (approved && request) {
          setAssignments((current) => [
            ...current,
            {
              id: `a-${Date.now()}`,
              principalId: request.requesterId,
              roleId: request.roleId,
              source: 'delegated',
              grantedBy: 'u-marta',
              expiresIn: request.duration,
              justification: request.justification,
            },
          ])
        }
        setRequests((current) => current.filter((r) => r.id !== requestId))
      },
    }),
    [mode, setMode, hasIdp, setHasIdp, roles, permissionsByRole, groups, effective, requests]
  )

  return <RbacPrototypeContext.Provider value={value}>{children}</RbacPrototypeContext.Provider>
}

export function useRbacPrototype() {
  const context = useContext(RbacPrototypeContext)
  if (!context) throw new Error('useRbacPrototype must be used within RbacPrototypeProvider')
  return context
}
