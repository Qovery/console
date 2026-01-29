import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { LoaderSpinner } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview'
)({
  component: RouteComponent,
})

function EnvironmentOverview() {
  const { environmentId } = useParams({ strict: false })
  const { data: environment } = useEnvironment({ environmentId, suspense: true })

  return <div>Environment: {environment?.name}</div>
}

function RouteComponent() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoaderSpinner className="w-6" />
        </div>
      }
    >
      <EnvironmentOverview />
    </Suspense>
  )
}
