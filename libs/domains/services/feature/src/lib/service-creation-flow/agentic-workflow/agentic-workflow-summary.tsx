import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { type ReactNode, useEffect } from 'react'
import { Button, FunnelFlowBody, Heading, Icon, Section, SummaryValue, truncateText } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import {
  type AgenticWorkflowConfigurationSection,
  type AgenticWorkflowFormData,
  useAgenticWorkflowCreateContext,
} from './agentic-workflow-context'
import { formatAgenticWorkflowRequest, useCreateAgenticWorkflow } from './use-create-agentic-workflow'

function truncateSummary(value: string) {
  if (!value.trim()) return '-'

  return value.length > 160 ? `${truncateText(value, 157)}…` : value
}

function formatCount(count: number, singular: string) {
  if (count === 0) return 'None'

  return `${count} ${pluralize(count, singular)}`
}

function maskValue(value: string) {
  return value.trim() ? '********' : '-'
}

function hasIncompleteGitRepository(values: AgenticWorkflowFormData) {
  return values.gitRepositories.some(
    (repository) => !repository.gitTokenId || !repository.repository.trim() || !repository.branch.trim()
  )
}

function hasIncompleteOutput(values: AgenticWorkflowFormData) {
  return values.outputs.some((output) => {
    if (!output.url.trim()) return true

    if (!output.headersJson.trim()) return false

    try {
      JSON.parse(output.headersJson)
      return false
    } catch {
      return true
    }
  })
}

function SummarySection({ children, onEdit, title }: { children: ReactNode; onEdit: () => void; title: string }) {
  return (
    <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
      <div className="flex justify-between">
        <Heading>{title}</Heading>
        <Button
          aria-label={`Edit ${title}`}
          type="button"
          variant="outline"
          color="neutral"
          size="md"
          onClick={onEdit}
          iconOnly
        >
          <Icon className="text-base" iconName="gear-complex" />
        </Button>
      </div>
      <ul className="list-none space-y-2 text-sm text-neutral-subtle">{children}</ul>
    </Section>
  )
}

export function AgenticWorkflowSummary() {
  const navigate = useNavigate()
  const { environmentId = '', organizationId = '', projectId = '' } = useParams({ strict: false })
  const { creationFlowUrl, form, setActiveSection, setCurrentStep } = useAgenticWorkflowCreateContext()
  const { isLoading: isCreating, mutateAsync: createAgenticWorkflow } = useCreateAgenticWorkflow({ environmentId })
  const values = form.watch()

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  useEffect(() => {
    if (
      !values.name.trim() ||
      !values.modelApiKey.trim() ||
      !values.agentPrompt.trim() ||
      hasIncompleteGitRepository(values) ||
      hasIncompleteOutput(values)
    ) {
      navigate({ to: `${creationFlowUrl}/configuration` })
    }
  }, [creationFlowUrl, navigate, values])

  const handleEditSection = (section: AgenticWorkflowConfigurationSection) => {
    setActiveSection(section)
    navigate({ to: `${creationFlowUrl}/configuration` })
  }

  const handleCreate = async () => {
    await createAgenticWorkflow({
      environmentId,
      payload: formatAgenticWorkflowRequest(form.getValues()),
    })
    posthog.capture('create-service', {
      selectedServiceType: 'agentic-workflow',
    })
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: { organizationId, projectId, environmentId },
    })
  }

  return (
    <FunnelFlowBody customContentWidth="max-w-[1024px]">
      <Section className="space-y-10">
        <div className="flex flex-col gap-2">
          <Heading className="mb-2">Ready to create your agentic workflow</Heading>
          <p className="text-sm text-neutral-subtle">
            Review the workflow configuration before creating it. Webhook details will be generated after creation.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <SummarySection title="Service information" onEdit={() => handleEditSection('service-information')}>
            <SummaryValue label="Name" value={values.name} />
            <SummaryValue label="Description" value={values.description || undefined} />
            <SummaryValue label="CPU" value={values.cpu ? `${values.cpu} mCPU` : undefined} />
            <SummaryValue label="Memory" value={values.memory ? `${values.memory} MB` : undefined} />
            <SummaryValue label="Storage" value={values.storage ? `${values.storage} GB` : undefined} />
            <SummaryValue label="Enabled" value={values.workflowEnabled ? 'Yes' : 'No'} />
          </SummarySection>

          <SummarySection title="AI model" onEdit={() => handleEditSection('ai-model')}>
            <SummaryValue label="Model" value={values.aiModel} />
            <SummaryValue label="API key" value={maskValue(values.modelApiKey)} />
            <SummaryValue label="Model settings" value={truncateSummary(values.modelSettingsJson)} />
          </SummarySection>

          <SummarySection title="MCPs" onEdit={() => handleEditSection('connectors')}>
            <SummaryValue label="MCPs" value={formatCount(values.connectors.length, 'MCP')} />
          </SummarySection>

          <SummarySection title="Git repositories" onEdit={() => handleEditSection('git-repositories')}>
            <SummaryValue label="Repositories" value={formatCount(values.gitRepositories.length, 'repository')} />
          </SummarySection>

          <SummarySection title="Governance" onEdit={() => handleEditSection('governance')}>
            <SummaryValue label="Domain allowlist" value={values.whitelistHosts || undefined} />
          </SummarySection>

          <SummarySection title="Docker fragment" onEdit={() => handleEditSection('docker-fragment')}>
            <SummaryValue label="Fragment" value={truncateSummary(values.dockerFragment)} />
          </SummarySection>

          <SummarySection title="Output webhooks" onEdit={() => handleEditSection('outputs')}>
            <SummaryValue label="Webhooks" value={formatCount(values.outputs.length, 'webhook')} />
          </SummarySection>

          <SummarySection title="Agent prompt" onEdit={() => handleEditSection('agent-prompt')}>
            <SummaryValue label="Prompt" value={truncateSummary(values.agentPrompt)} />
          </SummarySection>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={() => navigate({ to: `${creationFlowUrl}/configuration` })}
            type="button"
            size="lg"
            variant="plain"
          >
            Back
          </Button>
          <Button data-testid="button-create" loading={isCreating} onClick={handleCreate} size="lg" type="button">
            Create
          </Button>
        </div>
      </Section>
    </FunnelFlowBody>
  )
}
