import { createFileRoute, useParams } from '@tanstack/react-router'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { AgenticWorkflowRuns, AgenticWorkflowServiceActions, useService } from '@qovery/domains/services/feature'
import { Heading, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/runs'
)({ component: RouteComponent })

function RouteComponent() {
  const { environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })

  if (!environment || !isAgenticWorkflow(service)) return null

  return (
    <div className="container mx-auto flex min-h-page-container flex-col pt-6">
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex shrink-0 flex-col gap-6">
          <div className="flex justify-between">
            <Heading>Runs</Heading>
            <AgenticWorkflowServiceActions environment={environment} service={service} variant="menu-only" />
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-8 pb-20">
          <AgenticWorkflowRuns key={service.id} serviceId={service.id} />
        </div>
      </Section>
    </div>
  )
}
