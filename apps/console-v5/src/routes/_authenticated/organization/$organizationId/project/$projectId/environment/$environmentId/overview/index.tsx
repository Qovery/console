import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceList, ServiceListSkeleton } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview/'
)({
  component: RouteComponent,
})

function Services() {
  const { environmentId = '' } = Route.useParams()
  const { data: environment } = useEnvironment({ environmentId, suspense: true })

  if (!environment) {
    return null
  }

  return <ServiceList environment={environment} />
}

function RouteComponent() {
  return (
    <Suspense fallback={<ServiceListSkeleton />}>
      <Services />
    </Suspense>
  )
}
