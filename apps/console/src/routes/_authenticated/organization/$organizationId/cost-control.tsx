import { createFileRoute, useParams } from '@tanstack/react-router'
import { PageOrganizationCostControl } from '@qovery/domains/cost-management/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cost-control')({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Cost control')
  const { organizationId = '' } = useParams({ strict: false })

  return <PageOrganizationCostControl organizationId={organizationId} />
}
