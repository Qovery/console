import { type KeyboardEvent } from 'react'
import { Badge, Button, Icon, Tooltip, useModal } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { AssignRoleModal } from '../assign-role-modal'
import { IdpNudge } from '../idp-nudge'
import { type Group, PRINCIPALS, type Principal, type Role, principalById } from '../rbac-v2-mock-data'
import { useRbacPrototype } from '../rbac-v2-prototype-context'
import { type TargetedPermission } from '../rbac-v2-targeted-data'
import { Panel, PrincipalAvatar, RoleName, groupIcon } from '../rbac-v2-ui'
import { type RoleSource, getRoleSources } from '../rbac-v2-utils'
import { PermissionSummary } from './roles-targeted-tab'

// Groups are shown in the target solution, when they can be managed in the console
function GroupBadge({ group }: { group: Group }) {
  return (
    <Tooltip content={group.source === 'idp' ? 'Synced from Okta, membership is read-only' : 'Group created in Qovery'}>
      <span>
        <Badge size="sm" variant="surface" color="sky" className="gap-1.5">
          <Icon iconName={groupIcon(group)} iconStyle="regular" />
          {group.name}
        </Badge>
      </span>
    </Tooltip>
  )
}

const ROLE_SOURCE_ICONS = {
  group: 'users',
  direct: 'user',
  delegated: 'clock',
} as const

function RoleWithSource({
  source,
  isOnlyRole,
  onRemove,
}: {
  source: RoleSource
  // A member must always hold at least one role
  isOnlyRole: boolean
  onRemove?: () => void
}) {
  const { roles } = useRbacPrototype()
  const role = roles.find((r) => r.id === source.roleId)
  if (!role) return null

  const sourceIcon = (() => {
    switch (source.kind) {
      // Before the target solution, groups are not shown: the role comes from the IdP mapping, configured via the CLI
      case 'idp-mapping':
        return {
          icon: ROLE_SOURCE_ICONS.group,
          tooltip: `From the IdP mapping (Okta group ${(source.groups ?? []).map((group) => group.name).join(', ')}), configured via the CLI`,
          className: 'text-info',
        }
      case 'group':
        return {
          icon: ROLE_SOURCE_ICONS.group,
          tooltip: `Synced from ${(source.groups ?? []).length > 1 ? 'groups' : 'group'} ${(source.groups ?? []).map((group) => group.name).join(' and ')}`,
          className: 'text-info',
        }
      case 'delegated':
        return {
          icon: ROLE_SOURCE_ICONS.delegated,
          tooltip: `Delegated by ${principalById(source.assignment?.grantedBy ?? '')?.name}, ${source.assignment?.expiresIn} left`,
          className: 'text-warning',
        }
      default:
        return { icon: ROLE_SOURCE_ICONS.direct, tooltip: 'Assigned manually', className: 'text-neutral-subtle' }
    }
  })()

  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <Tooltip content={sourceIcon.tooltip}>
          <span className={twMerge('w-4 shrink-0 text-center text-xs', sourceIcon.className)}>
            <Icon iconName={sourceIcon.icon} iconStyle="regular" />
          </span>
        </Tooltip>
        <span className="truncate text-xs font-medium text-neutral">{role.name}</span>
        {source.kind === 'delegated' && (
          <span className="shrink-0 text-xs text-warning">{source.assignment?.expiresIn}</span>
        )}
      </span>
      {onRemove && isOnlyRole ? (
        <Tooltip content="A member must have at least one role: assign another role before removing this one">
          <span>
            <Button
              type="button"
              size="xs"
              variant="plain"
              color="neutral"
              iconOnly
              disabled
              aria-label={`Remove ${role.name}`}
            >
              <Icon iconName="xmark" />
            </Button>
          </span>
        </Tooltip>
      ) : onRemove ? (
        <Button
          type="button"
          size="xs"
          variant="plain"
          color="neutral"
          iconOnly
          aria-label={`Remove ${role.name}`}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
        >
          <Icon iconName="xmark" />
        </Button>
      ) : (
        <Tooltip content="Derived from a group: change the group membership or its roles instead">
          <span className="px-1.5 text-xs text-neutral-subtle">
            <Icon iconName="lock" iconStyle="regular" />
          </span>
        </Tooltip>
      )}
    </li>
  )
}

// Target only: the "why does this user have this access?" view, showing where each role comes from. It opens in a
// modal, which renders outside the prototype provider, so it gets its data as props.
function WhyAccess({
  principal,
  roles,
  sources,
  permissionsByRole,
}: {
  principal: Principal
  roles: Role[]
  sources: RoleSource[]
  permissionsByRole: Record<string, TargetedPermission[]>
}) {
  return (
    <Panel
      title={`Why does ${principal.name} have access?`}
      description="Union of direct assignments, delegated grants and the roles of every group, capped by company guardrails."
    >
      <div className="divide-y divide-neutral">
        {sources.length === 0 && (
          <p className="p-4 text-sm text-neutral-subtle">No role: this member has No Access (organization default).</p>
        )}
        {sources.map((source, index) => {
          const role = roles.find((r) => r.id === source.roleId)
          if (!role) return null
          return (
            <div key={`${source.roleId}-${index}`} className="p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <RoleName role={role} />
                <span className="text-xs text-neutral-subtle">
                  {source.kind === 'group' && `via ${source.groups?.map((group) => group.name).join(' and ')}`}
                  {source.kind === 'idp-mapping' &&
                    `via IdP mapping ${source.groups?.map((group) => group.name).join(' and ')}`}
                  {source.kind === 'delegated' &&
                    `delegated by ${principalById(source.assignment?.grantedBy ?? '')?.name} · expires in ${source.assignment?.expiresIn}`}
                  {source.kind === 'direct' &&
                    `assigned by ${principalById(source.assignment?.grantedBy ?? '')?.name}${source.assignment?.expiresIn ? ` · expires in ${source.assignment.expiresIn}` : ''}`}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {role.organizationCapabilities.length > 0 && (
                  <li className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-neutral">
                      <Icon iconName="gear" iconStyle="regular" className="text-neutral-subtle" />
                      Organization settings
                    </span>
                    <Icon iconName="arrow-right" className="text-neutral-subtle" />
                    <span className="text-neutral">{role.organizationCapabilities.length} pages</span>
                  </li>
                )}
                {(permissionsByRole[role.id] ?? []).map((permission) => (
                  <PermissionSummary key={permission.id} permission={permission} />
                ))}
              </ul>
            </div>
          )
        })}
        <div className="flex items-center gap-2 bg-surface-neutral-subtle p-4 text-xs text-neutral-subtle">
          <Icon iconName="shield-check" iconStyle="regular" />4 company guardrails apply on top, they always win over
          roles.
        </div>
      </div>
    </Panel>
  )
}

// Roles synced from groups first, then the ones assigned to the member
const SOURCE_ORDER: RoleSource['kind'][] = ['idp-mapping', 'group', 'direct', 'delegated']

export function MembersTab() {
  const {
    roles,
    permissionsByRole,
    assignments,
    groups,
    isTarget,
    hasGroups,
    addAssignment,
    removeAssignment,
    hasIdp,
  } = useRbacPrototype()
  const { openModal, closeModal } = useModal()
  const users = PRINCIPALS.filter((principal) => principal.kind === 'user')

  const openAssign = (principal: Principal) =>
    openModal({
      content: (
        <AssignRoleModal
          principal={principal}
          // A member holds each role at most once: roles already held, by hand or through a group, are not offered
          roles={roles.filter(
            (role) =>
              !getRoleSources({ principalId: principal.id, assignments, groups, isTarget, hasGroups }).some(
                (source) => source.roleId === role.id
              )
          )}
          isTarget={isTarget}
          onClose={closeModal}
          onSubmit={addAssignment}
        />
      ),
    })

  const openWhyAccess = (principal: Principal) =>
    openModal({
      content: (
        <WhyAccess
          principal={principal}
          roles={roles}
          permissionsByRole={permissionsByRole}
          sources={getRoleSources({ principalId: principal.id, assignments, groups, isTarget: true, hasGroups: true })}
        />
      ),
    })

  // Groups come with the target solution; before, IdP roles still show up, with their source icon
  const showGroups = hasGroups
  const columns = twMerge(
    'grid gap-4',
    showGroups
      ? 'grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.6fr)_auto]'
      : 'grid-cols-[minmax(0,1.2fr)_minmax(0,2.6fr)_auto]'
  )

  const manualAssignments = users
    .flatMap((user) => getRoleSources({ principalId: user.id, assignments, groups, isTarget, hasGroups }))
    .filter((source) => source.kind === 'direct').length

  return (
    <>
      <IdpNudge manualAssignments={manualAssignments} />
      <Panel title={`${users.length} members`}>
        <div
          className={twMerge(
            columns,
            'border-b border-neutral bg-surface-neutral-subtle px-4 py-2 text-xs font-medium text-neutral-subtle'
          )}
        >
          <span>Member</span>
          {showGroups && <span>Groups</span>}
          <span>Roles</span>
          <span className="w-[68px]" />
        </div>
        <div className="divide-y divide-neutral">
          {users.map((user) => {
            const sources = getRoleSources({ principalId: user.id, assignments, groups, isTarget, hasGroups }).sort(
              (a, b) => SOURCE_ORDER.indexOf(a.kind) - SOURCE_ORDER.indexOf(b.kind)
            )
            const userGroups = groups
              .filter((group) => group.memberIds.includes(user.id))
              .filter((group) => hasGroups || group.source === 'idp')
            return (
              <div
                key={user.id}
                {...(isTarget && {
                  role: 'button',
                  tabIndex: 0,
                  onClick: () => openWhyAccess(user),
                  onKeyDown: (event: KeyboardEvent) => event.key === 'Enter' && openWhyAccess(user),
                })}
                className={twMerge(
                  columns,
                  'items-start px-4 py-3',
                  isTarget && 'cursor-pointer hover:bg-surface-neutral-subtle'
                )}
              >
                <div className="flex items-center gap-3">
                  <PrincipalAvatar principal={user} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral">{user.name}</p>
                    <p className="truncate text-xs text-neutral-subtle">{user.email}</p>
                  </div>
                </div>
                {showGroups && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {userGroups.length === 0 && <span className="text-xs text-neutral-subtle">—</span>}
                    {userGroups.map((group) => (
                      <GroupBadge key={group.id} group={group} />
                    ))}
                  </div>
                )}
                <ul className="flex flex-col gap-2">
                  {sources.length === 0 && <li className="pt-1 text-xs text-neutral-subtle">No Access</li>}
                  {sources.map((source, index) => (
                    <RoleWithSource
                      key={`${source.roleId}-${index}`}
                      source={source}
                      isOnlyRole={sources.length === 1}
                      onRemove={source.assignment ? () => removeAssignment(source.assignment?.id ?? '') : undefined}
                    />
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant="outline"
                  color="neutral"
                  onClick={(event) => {
                    event.stopPropagation()
                    openAssign(user)
                  }}
                >
                  <Icon iconName="plus" />
                  Role
                </Button>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-neutral px-4 py-3 text-xs text-neutral-subtle">
          {(showGroups || hasIdp) && (
            <span className="flex items-center gap-1.5">
              <Icon iconName={ROLE_SOURCE_ICONS.group} iconStyle="regular" className="text-info" />
              {showGroups ? 'Synced from a group' : 'From the IdP mapping'}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Icon iconName={ROLE_SOURCE_ICONS.direct} iconStyle="regular" />
            Assigned manually
          </span>
          {isTarget && (
            <>
              <span className="flex items-center gap-1.5">
                <Icon iconName={ROLE_SOURCE_ICONS.delegated} iconStyle="regular" className="text-warning" />
                Delegated, with expiry
              </span>
              <span className="ml-auto">Click a member to see why they have access.</span>
            </>
          )}
        </div>
      </Panel>
    </>
  )
}
