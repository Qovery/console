import { Badge, Button, Callout, Icon, Tooltip } from '@qovery/shared/ui'
import { useOpenConnectIdp } from '../idp-nudge'
import { principalById } from '../rbac-v2-mock-data'
import { useRbacPrototype } from '../rbac-v2-prototype-context'
import { Panel, PrincipalAvatar, groupIcon } from '../rbac-v2-ui'

export function GroupsTab() {
  const { roles, groups, hasIdp } = useRbacPrototype()
  const openConnectIdp = useOpenConnectIdp()

  return (
    <div className="flex flex-col gap-6">
      {!hasIdp && (
        <Callout.Root color="neutral">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>No identity provider connected</Callout.TextHeading>
            <Callout.TextDescription>
              Groups are created and managed in Qovery. Connect an IdP to sync its groups and their membership.
            </Callout.TextDescription>
            <div className="mt-3">
              <Button type="button" size="sm" onClick={openConnectIdp}>
                Connect an IdP
              </Button>
            </div>
          </Callout.Text>
        </Callout.Root>
      )}
      <Panel
        title="Groups"
        description={
          hasIdp
            ? 'A group holds roles, its members get all of them. Synced groups keep their membership in the IdP; groups created in Qovery are managed here.'
            : 'A group holds roles, its members get all of them.'
        }
        action={
          <div className="flex gap-2">
            {hasIdp && (
              <Button size="md" variant="outline" color="neutral">
                <Icon iconName="arrows-rotate" />
                Choose synced groups
              </Button>
            )}
            <Button size="md">
              <Icon iconName="circle-plus" iconStyle="regular" />
              New group
            </Button>
          </div>
        }
      >
        <div className="divide-y divide-neutral">
          {groups.map((group) => (
            <div key={group.id} className="flex items-center gap-4 px-4 py-3">
              <div className="w-56">
                <Tooltip
                  content={
                    group.source === 'idp'
                      ? 'Synced from Okta: membership is read-only, its roles are managed in Qovery'
                      : 'Group created in Qovery'
                  }
                >
                  <p className="flex w-fit items-center gap-2 text-sm font-medium text-neutral">
                    <Icon iconName={groupIcon(group)} iconStyle="regular" className="text-info" />
                    {group.name}
                  </p>
                </Tooltip>
                <div className="mt-1.5 flex -space-x-1.5">
                  {group.memberIds.map((id) => {
                    const member = principalById(id)
                    return member && <PrincipalAvatar key={id} principal={member} size="sm" />
                  })}
                </div>
              </div>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {group.roleIds.map((roleId) => (
                  <Badge key={roleId} size="sm" variant="surface" color="brand">
                    {roles.find((role) => role.id === roleId)?.name}
                  </Badge>
                ))}
                <Button size="xs" variant="plain" color="neutral">
                  <Icon iconName="plus" />
                  Role
                </Button>
              </div>
              <Button size="md" variant="outline" color="neutral" iconOnly aria-label="Edit group">
                <Icon iconName="pen" iconStyle="regular" />
              </Button>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Unmapped users" description="Users that are in no group and hold no direct role.">
        <div className="flex items-center justify-between px-4 py-3 text-sm text-neutral">
          Organization default role
          <Badge variant="surface" color="neutral">
            No Access
          </Badge>
        </div>
      </Panel>
    </div>
  )
}
