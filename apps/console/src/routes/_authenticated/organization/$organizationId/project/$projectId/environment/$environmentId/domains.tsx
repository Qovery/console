import { Navigate, createFileRoute } from '@tanstack/react-router'
import { EnvironmentDomains, useIsDomainRoutingEnabled } from '@qovery/domains/custom-domains/feature'
import { Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/domains'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Domains')
  const params = Route.useParams()
  const enabled = useIsDomainRoutingEnabled()

  if (!enabled)
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/overview"
        params={params}
        replace
      />
    )

  return (
    <div className="container mx-auto flex min-h-page-container flex-col pt-6">
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex shrink-0 flex-col gap-6">
          <Heading>Domains</Heading>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-8 pb-20">
          <EnvironmentDomains />
        </div>
      </Section>
    </div>
  )
}
