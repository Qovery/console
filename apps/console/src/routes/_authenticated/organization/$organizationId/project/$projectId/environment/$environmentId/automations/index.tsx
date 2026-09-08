import { createFileRoute, useParams } from '@tanstack/react-router'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { AgenticWorkflowServiceList, AgenticWorkflowUseCases, useServices } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations/'
)({ component: RouteComponent })

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: services = [] } = useServices({ environmentId, suspense: true })

  if (!environment) return null

  const hasAgentTasks = services.some(isAgenticWorkflow)
  const useCasesProps = {
    organizationId,
    projectId,
    environmentId,
    cloudProvider: environment.cloud_provider?.provider,
  }

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading title="Automations" description="Create and monitor AI-powered environment automations.">
        {hasAgentTasks ? (
          <div className="flex shrink-0 items-center pb-6">
            <AgenticWorkflowUseCases {...useCasesProps} display="menu" />
          </div>
        ) : null}
      </SettingsHeading>
      <div
        className={
          hasAgentTasks ? 'flex w-full flex-col gap-8' : 'flex max-w-content-with-navigation-left flex-col gap-8'
        }
      >
        <AgenticWorkflowServiceList environment={environment} />
        {!hasAgentTasks ? <AgenticWorkflowUseCases {...useCasesProps} /> : null}
      </div>
    </Section>
  )
}
