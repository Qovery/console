import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/dockerfile',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/dockerfile"!
    </div>
  )
}
