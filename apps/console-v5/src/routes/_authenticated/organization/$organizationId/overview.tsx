import { createFileRoute, useParams } from '@tanstack/react-router'
import { SectionProductionHealth } from '@qovery/domains/clusters/feature'
import { OrganizationOverview } from '@qovery/domains/organizations/feature'
import { ProjectList } from '@qovery/domains/projects/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = useParams({ strict: false })

  if (!organizationId) {
    return null
  }

  return (
    <OrganizationOverview organizationId={organizationId}>
      <SectionProductionHealth organizationId={organizationId} />
      <ProjectList organizationId={organizationId} />
    </OrganizationOverview>
  )
}
