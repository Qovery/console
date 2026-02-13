import { createFileRoute, useParams } from '@tanstack/react-router'
import { StepSummary } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/summary')({
  component: Summary,
})

function Summary() {
  useDocumentTitle('Summary - Create Cluster')
  const { organizationId = '' } = useParams({ strict: false })
  return <StepSummary organizationId={organizationId} />
}
