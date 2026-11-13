import { Badge, Button, Icon, Tooltip } from '@qovery/shared/ui'
import { PRINCIPALS, type Principal, principalById } from '../rbac-v2-mock-data'
import { useRbacPrototype } from '../rbac-v2-prototype-context'
import { Panel, PrincipalAvatar } from '../rbac-v2-ui'

function PrincipalRow({ principal }: { principal: Principal }) {
  const { roles, assignments } = useRbacPrototype()
  const owner = principal.ownerId ? principalById(principal.ownerId) : undefined
  const principalRoles = assignments
    .filter((assignment) => assignment.principalId === principal.id)
    .map((assignment) => roles.find((role) => role.id === assignment.roleId))

  return (
    <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_110px_110px_auto] items-center gap-4 px-4 py-3">
      <div className="flex items-center gap-3">
        <PrincipalAvatar principal={principal} />
        <div>
          <p className="text-sm font-medium text-neutral">{principal.name}</p>
          <p className="text-xs capitalize text-neutral-subtle">{principal.kind.replace('-', ' ')}</p>
        </div>
      </div>
      <span className="text-xs text-neutral">
        <span className="text-neutral-subtle">Owner · </span>
        {owner?.name}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {principalRoles.map(
          (role) =>
            role && (
              <Badge key={role.id} size="sm" variant="surface" color="brand">
                {role.name}
              </Badge>
            )
        )}
        {principal.personal && (
          <Tooltip content={`Checked on every call: never more than ${owner?.name}'s own rights`}>
            <span>
              <Badge size="sm" variant="outline" color="yellow">
                <Icon iconName="arrow-down-to-line" className="mr-1" />
                capped by owner
              </Badge>
            </span>
          </Tooltip>
        )}
      </div>
      <span className="text-xs text-neutral-subtle">Used {principal.lastUsed}</span>
      <span className="text-xs text-neutral-subtle">Expires {principal.tokenExpiry}</span>
      <Button size="md" variant="outline" color="red">
        Revoke
      </Button>
    </div>
  )
}

export function PrincipalsTab() {
  const nonHumans = PRINCIPALS.filter((principal) => principal.kind !== 'user')

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Service accounts and agents"
        description="Org-wide non-human principals, created by admins. Each has a human owner accountable for it; ownership moves to an org admin if the owner is deprovisioned."
        action={
          <Button size="md">
            <Icon iconName="circle-plus" iconStyle="regular" />
            New service account or agent
          </Button>
        }
      >
        <div className="divide-y divide-neutral">
          {nonHumans
            .filter((principal) => !principal.personal)
            .map((principal) => (
              <PrincipalRow key={principal.id} principal={principal} />
            ))}
        </div>
      </Panel>
      <Panel
        title="Personal access tokens and agents"
        description="Created by users for themselves (CLI, scripts, coding agents). Expiry is required, rights are a subset of the owner's. Admins see and can revoke all of them."
      >
        <div className="divide-y divide-neutral">
          {nonHumans
            .filter((principal) => principal.personal)
            .map((principal) => (
              <PrincipalRow key={principal.id} principal={principal} />
            ))}
        </div>
      </Panel>
    </div>
  )
}
