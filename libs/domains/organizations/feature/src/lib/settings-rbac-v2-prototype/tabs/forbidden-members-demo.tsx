import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { Badge, Button, Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { useRbacPrototype } from '../rbac-v2-prototype-context'

// What Sofia sees when she opens the members page without the "Manage members" capability. Same layout as the
// console's 404 page, but it names the missing capability instead of pretending the page does not exist.
export function ForbiddenMembersDemo() {
  const { organizationId = '' } = useParams({ strict: false })
  const { isTarget, roles } = useRbacPrototype()
  const [requested, setRequested] = useState(false)
  const heldRoles = roles.filter((role) => ['r-backend', 'r-signal'].includes(role.id))

  return (
    <Section className="flex min-h-[70vh] w-full flex-1 items-center justify-center">
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-neutral-subtle text-2xl text-neutral-subtle">
          <Icon iconName="lock" iconStyle="regular" />
        </span>
        <Heading level={1}>You don't have permission to view members</Heading>
        <p className="mt-3 max-w-md text-sm text-neutral-subtle">
          This page needs the <span className="font-medium text-neutral">Manage members</span> capability on the
          organization. Ask an organization admin to assign you a role that grants it.
        </p>
        <p className="mt-3 text-xs text-neutral-subtle">
          Missing capability: <code className="font-code text-neutral">org.members</code>
        </p>

        {isTarget && (
          <div className="mt-6 w-full max-w-md rounded border border-neutral bg-surface-neutral-subtle p-4 text-left">
            <p className="mb-2 text-xs font-medium text-neutral">Your roles don't grant it</p>
            <div className="flex flex-wrap gap-1.5">
              {heldRoles.map((role) => (
                <Badge key={role.id} size="sm" variant="surface" color="brand">
                  {role.name}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-xs text-neutral-subtle">
              Granted by <span className="text-neutral">Admin</span>. Admins: Vincy Park.
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <Link
            as="button"
            variant="outline"
            color="neutral"
            size="md"
            to="/organization/$organizationId/settings/general"
            params={{ organizationId }}
          >
            Back to settings
          </Link>
          {isTarget && (
            <Button size="md" disabled={requested} onClick={() => setRequested(true)}>
              <Icon iconName={requested ? 'check' : 'hand'} iconStyle="regular" />
              {requested ? 'Request sent to admins' : 'Request access'}
            </Button>
          )}
        </div>
      </div>
    </Section>
  )
}
