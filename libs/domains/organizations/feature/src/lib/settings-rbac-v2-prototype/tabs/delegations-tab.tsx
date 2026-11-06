import { Badge, Button, Icon } from '@qovery/shared/ui'
import { DELEGATIONS, principalById } from '../rbac-v2-mock-data'
import { useRbacPrototype } from '../rbac-v2-prototype-context'
import { Panel, PrincipalAvatar } from '../rbac-v2-ui'

export function DelegationsTab() {
  const { roles, assignments, requests, resolveRequest, removeAssignment } = useRbacPrototype()
  const roleName = (roleId: string) => roles.find((role) => role.id === roleId)?.name
  const temporaryGrants = assignments.filter((assignment) => assignment.expiresIn)

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title={
          <span className="flex items-center gap-2">
            Access requests
            <Badge size="sm" variant="surface" color="brand">
              {requests.length} pending
            </Badge>
          </span>
        }
        description="A user requests a role listed in a delegation for a duration within its max. A delegated manager or an admin, never the requester, approves it."
      >
        <div className="divide-y divide-neutral">
          {requests.length === 0 && <p className="p-4 text-sm text-neutral-subtle">No pending request.</p>}
          {requests.map((request) => {
            const requester = principalById(request.requesterId)
            return (
              requester && (
                <div key={request.id} className="flex items-center gap-3 px-4 py-3">
                  <PrincipalAvatar principal={requester} />
                  <div className="flex-1">
                    <p className="text-sm text-neutral">
                      <span className="font-medium">{requester.name}</span> requests{' '}
                      <span className="font-medium">{roleName(request.roleId)}</span> for {request.duration}
                    </p>
                    <p className="text-xs text-neutral-subtle">
                      “{request.justification}” · {request.requestedAt}
                    </p>
                  </div>
                  <Button size="md" variant="outline" color="neutral" onClick={() => resolveRequest(request.id, false)}>
                    Reject
                  </Button>
                  <Button size="md" onClick={() => resolveRequest(request.id, true)}>
                    Approve
                  </Button>
                </div>
              )
            )
          })}
        </div>
      </Panel>

      <Panel
        title="Delegations"
        description="Lets non-admin users assign a fixed list of roles, each with a max duration. Scope lives in the role, so a manager can never widen it."
        action={
          <Button size="md">
            <Icon iconName="circle-plus" iconStyle="regular" />
            New delegation
          </Button>
        }
      >
        <div className="divide-y divide-neutral">
          {DELEGATIONS.map((delegation) => (
            <div key={delegation.id} className="grid grid-cols-[200px_1fr_1fr_auto] items-start gap-4 px-4 py-3">
              <p className="text-sm font-medium text-neutral">{delegation.name}</p>
              <div>
                <p className="mb-1 text-xs text-neutral-subtle">Who can assign</p>
                <div className="flex flex-wrap gap-1.5">
                  {delegation.delegateIds.map((id) => (
                    <Badge key={id} size="sm" variant="surface" color="neutral">
                      {principalById(id)?.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs text-neutral-subtle">Can assign</p>
                <ul className="flex flex-col gap-1">
                  {delegation.assignable.map((item) => (
                    <li key={item.roleId} className="flex items-center gap-2 text-xs text-neutral">
                      {roleName(item.roleId)}
                      <Badge size="sm" variant="outline" color={item.maxDuration ? 'yellow' : 'neutral'}>
                        <Icon iconName="clock" iconStyle="regular" className="mr-1" />
                        {item.maxDuration ? `max ${item.maxDuration}` : 'no limit'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <Button size="md" variant="outline" color="neutral" iconOnly aria-label="Edit delegation">
                <Icon iconName="pen" iconStyle="regular" />
              </Button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Active temporary grants"
        description="Expiry is enforced by Qovery and logged. The granter and admins can revoke or extend within the cap."
      >
        <div className="divide-y divide-neutral">
          {temporaryGrants.map((grant) => {
            const principal = principalById(grant.principalId)
            return (
              principal && (
                <div key={grant.id} className="flex items-center gap-3 px-4 py-3">
                  <PrincipalAvatar principal={principal} size="sm" />
                  <div className="flex-1 text-sm text-neutral">
                    <span className="font-medium">{principal.name}</span> holds{' '}
                    <span className="font-medium">{roleName(grant.roleId)}</span>
                    <p className="text-xs text-neutral-subtle">
                      Granted by {principalById(grant.grantedBy)?.name} · “{grant.justification}”
                    </p>
                  </div>
                  <Badge variant="surface" color="yellow">
                    <Icon iconName="hourglass-half" iconStyle="regular" className="mr-1" />
                    expires in {grant.expiresIn}
                  </Badge>
                  <Button size="md" variant="outline" color="neutral">
                    Extend
                  </Button>
                  <Button size="md" variant="outline" color="red" onClick={() => removeAssignment(grant.id)}>
                    Revoke
                  </Button>
                </div>
              )
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
