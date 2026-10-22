import { OrganizationCustomRoleProjectPermission } from 'qovery-typescript-axios'

export const REMOTE_ACCESS_FLAGS = ['shell', 'port_forward'] as const

// Fixed width of a shell / port-forward column, shared by the header and the rows so they line up whatever the
// width the other columns get from their content
export const REMOTE_ACCESS_COLUMN_CLASS_NAME = 'w-32 flex-none'

export type RemoteAccessFlag = (typeof REMOTE_ACCESS_FLAGS)[number]

// Form key holding the flag for every project and environment type: `${remoteAccessFormKey(flag)}.${projectId}.${environmentType}`
export const remoteAccessFormKey = (flag: RemoteAccessFlag) => `${flag}_permissions`

// Shell and port-forward reach the environment services: they need at least a read-only access on it
export const canGrantRemoteAccess = (permission?: string) =>
  permission !== undefined && permission !== OrganizationCustomRoleProjectPermission.NO_ACCESS

const LEVELS_GRANTING_REMOTE_ACCESS_BY_DEFAULT = [
  OrganizationCustomRoleProjectPermission.DEPLOYER,
  OrganizationCustomRoleProjectPermission.MANAGER,
  'ADMIN',
]

/**
 * Value of a shell or port-forward flag after its environment type moved from [previousLevel] to [nextLevel]: off with
 * NO_ACCESS, kept when the previous level could already grant it, so the checkbox the admin sees doesn't change under
 * them (except Full-access, which grants it implicitly), otherwise on from DEPLOYER upward. The console always sends
 * both flags, so this decides what is saved.
 */
export const remoteAccessAfterLevelChange = (
  previousLevel: string | undefined,
  nextLevel: string,
  current: boolean
) => {
  if (!canGrantRemoteAccess(nextLevel)) return false
  if (canGrantRemoteAccess(previousLevel) && previousLevel !== 'ADMIN') return current
  return LEVELS_GRANTING_REMOTE_ACCESS_BY_DEFAULT.includes(nextLevel)
}
