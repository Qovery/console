import { createFileRoute } from '@tanstack/react-router'
import { IssueOverview } from '@qovery/domains/observability/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/infrastructure/alerts/issues')({
  component: IssuesComponent,
})

function IssuesComponent() {
  return <IssueOverview />
}
