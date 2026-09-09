import { createFileRoute, useParams } from '@tanstack/react-router'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { AgentTaskRuns, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/runs'
)({ component: RouteComponent })

function RouteComponent() {
  const { environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  if (!service || !isAgenticWorkflow(service)) return null
  return (
    <Section className="py-6">
      <SettingsHeading title="Runs" showNeedHelp={false} />
      <AgentTaskRuns agentTaskId={service.id} agentTaskName={service.name} />
    </Section>
  )
}
