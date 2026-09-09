import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { Icon, Link } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations/settings'
)({ component: RouteComponent })

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  return (
    <>
      <div className="px-8 pt-6">
        <Link
          color="brand"
          size="xs"
          className="gap-1"
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/automations"
          params={{ organizationId, projectId, environmentId }}
        >
          <Icon iconName="arrow-left" className="text-2xs" />
          Back to Automations
        </Link>
      </div>
      <Outlet />
    </>
  )
}
