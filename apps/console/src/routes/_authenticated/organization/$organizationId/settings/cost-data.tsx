import { createFileRoute, useParams } from '@tanstack/react-router'
import { PageOrganizationCostData } from '@qovery/domains/cost-management/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/cost-data')({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Cost data - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })

  return <PageOrganizationCostData organizationId={organizationId} />
}
