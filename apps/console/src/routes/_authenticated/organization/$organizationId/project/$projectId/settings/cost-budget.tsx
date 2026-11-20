import { createFileRoute, useParams } from '@tanstack/react-router'
import { PageProjectCostBudget } from '@qovery/domains/cost-management/feature'
import { useProject } from '@qovery/domains/projects/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/settings/cost-budget'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Cost & budget - Project settings')
  const { organizationId = '', projectId = '' } = useParams({ strict: false })
  const { data: project } = useProject({ organizationId, projectId, suspense: true })

  return <PageProjectCostBudget projectId={projectId} projectName={project?.name} />
}
