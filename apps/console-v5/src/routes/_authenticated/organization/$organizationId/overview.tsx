import { createFileRoute } from '@tanstack/react-router'
import { SectionProductionHealth } from '@qovery/domains/clusters/feature'
import { OrganizationOverview } from '@qovery/domains/organizations/feature'
import { ProjectList } from '@qovery/domains/projects/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Organization - Overview')

  return (
    <div className="mt-6">
      <OrganizationOverview>
        <SectionProductionHealth />
        <ProjectList />
      </OrganizationOverview>
    </div>
  )
}
