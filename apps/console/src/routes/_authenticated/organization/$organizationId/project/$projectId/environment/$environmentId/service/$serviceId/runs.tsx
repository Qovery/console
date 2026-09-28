import { createFileRoute, useParams } from '@tanstack/react-router'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { AgenticWorkflowRuns, useService } from '@qovery/domains/services/feature'
import { Heading, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/runs'
)({ component: RouteComponent })

function RouteComponent() {
  const { environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })

  if (!isAgenticWorkflow(service)) return null

  return (
    <Section className="py-6">
      <Heading>Runs</Heading>
      <AgenticWorkflowRuns key={service.id} serviceId={service.id} />
    </Section>
  )
}
