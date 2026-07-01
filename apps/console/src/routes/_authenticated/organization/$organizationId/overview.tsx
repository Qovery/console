import { createFileRoute, useParams } from '@tanstack/react-router'
import { SectionProductionHealth, useClusters } from '@qovery/domains/clusters/feature'
import { OrganizationOverview } from '@qovery/domains/organizations/feature'
import { ProjectList } from '@qovery/domains/projects/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { SectionOnboarding } from '../../../../app/components/section-onboarding/section-onboarding'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Organization - Overview')
  const { organizationId = '' } = useParams({ strict: false })
  const { data: clusters = [] } = useClusters({ organizationId, suspense: true })
  const hasClusters = clusters.length > 0

  return (
    <div className="mt-6">
      <OrganizationOverview>
        <SectionOnboarding organizationId={organizationId} />
        <SectionProductionHealth />
        {hasClusters ? <ProjectList /> : null}
      </OrganizationOverview>
    </div>
  )
}
