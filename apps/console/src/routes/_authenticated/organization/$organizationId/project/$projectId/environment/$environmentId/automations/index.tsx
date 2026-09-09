import { createFileRoute, useParams } from '@tanstack/react-router'
import {
  PageSettingsPreviewEnvironmentsFeature,
  SettingsDeploymentRules,
  useEnvironment,
} from '@qovery/domains/environments/feature'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { AgenticWorkflowServiceList, AgenticWorkflowUseCases, useServices } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Heading, Link, Section } from '@qovery/shared/ui'

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
    <Section className="pb-8 pt-6">
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
      <div className="mt-4 flex justify-end">
        <Link
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/automations/runs"
          params={{ organizationId, projectId, environmentId }}
        >
          View all runs →
        </Link>
      </div>
      <Section className="mt-8 gap-4 border-t border-neutral pt-8">
        <div className="flex flex-col gap-1">
          <Heading level={2}>Environment automations</Heading>
          <p className="text-sm text-neutral-subtle">Control when environments run and how previews are created.</p>
        </div>
        <div className="flex max-w-content-with-navigation-left flex-col gap-6">
          <Section id="deployment-rules" className="scroll-mt-24 gap-3">
            <Heading level={3}>Deployment rules</Heading>
            <SettingsDeploymentRules embedded />
          </Section>
          <Section id="preview-environments" className="scroll-mt-24 gap-3">
            <Heading level={3}>Preview environments</Heading>
            <PageSettingsPreviewEnvironmentsFeature embedded />
          </Section>
        </div>
      </Section>
    </Section>
  )
}
