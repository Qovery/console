import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { Link } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations/settings'
)({ component: RouteComponent })

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  return (
    <>
      <div className="px-8 pt-6">
        <Link
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/automations"
          params={{ organizationId, projectId, environmentId }}
        >
          ← Back to Automations
        </Link>
      </div>
      <Outlet />
    </>
  )
}
