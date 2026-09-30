import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Environment } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import {
  Button,
  DropdownMenu,
  Heading,
  Icon,
  Link,
  LoaderSpinner,
  Section,
  Skeleton,
  useModal,
} from '@qovery/shared/ui'
import { useServices } from '../hooks/use-services/use-services'
import {
  AGENTIC_WORKFLOW_TEMPLATES,
  AGENT_TEMPLATE_CATEGORIES,
  type AgenticWorkflowTemplate,
} from '../service-creation-flow/agentic-workflow/agentic-workflow-templates'
import { AgentTemplateRequestModal } from '../service-new/agent-template-request-modal/agent-template-request-modal'
import { AgenticWorkflowServiceList } from './agentic-workflow-service-list'

function TemplateIcon({ template }: { template: AgenticWorkflowTemplate }) {
  if (template.logoIcon) return <Icon name={template.logoIcon} className="size-5" />
  if (!template.logoPath) return <Icon iconName={template.iconName} iconStyle="regular" className="text-base" />
  return (
    <>
      <img
        src={template.logoPath}
        alt=""
        className={`size-full object-contain ${template.darkLogoPath ? 'dark:hidden' : ''}`}
      />
      {template.darkLogoPath && (
        <img src={template.darkLogoPath} alt="" className="hidden size-full object-contain dark:block" />
      )}
    </>
  )
}

export function EnvironmentAutomation({ environment, previews }: { environment: Environment; previews?: ReactNode }) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const enabled = Boolean(useFeatureFlagEnabled('argentic-workflow'))
  const { data: services = [] } = useServices({ environmentId, suspense: true })
  const hasAgents = services.some(isAgenticWorkflow)
  const createFromScratch = () => {
    posthog.capture('select-agent-use-case', { agentUseCase: 'from-scratch' })
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow',
      params: { organizationId, projectId, environmentId },
      search: {},
    })
  }

  if (!enabled) return null

  return (
    <div className="container mx-auto flex min-h-page-container flex-col pt-6">
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex shrink-0 flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <Heading>Automations</Heading>
            <div className="flex items-center gap-2">
              <Button
                size="md"
                variant="outline"
                color="neutral"
                onClick={() =>
                  openModal({
                    content: <AgentTemplateRequestModal organizationId={organizationId} onClose={closeModal} />,
                  })
                }
              >
                Request agent template
              </Button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button size="md">
                    Create agent task <Icon iconName="chevron-down" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Item
                    onSelect={() =>
                      openModal({
                        options: { width: 'min(1100px, calc(100vw - 48px))', buttonClose: false, fakeModal: true },
                        content: (
                          <AgentTemplateCatalogModal onClose={closeModal} onCreateFromScratch={createFromScratch} />
                        ),
                      })
                    }
                  >
                    Create from template
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={createFromScratch}>Create from scratch</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-8 pb-20">
          {hasAgents ? <AgenticWorkflowServiceList environment={environment} /> : <AgentTemplateCatalog />}
          {previews}
        </div>
      </Section>
    </div>
  )
}

function AgentTemplateCatalog({ onSelect }: { onSelect?: () => void }) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const selectTemplate = (id: string) => {
    posthog.capture('select-agent-use-case', { agentUseCase: id })
    onSelect?.()
  }
  return (
    <div className="flex flex-col gap-8">
      {AGENT_TEMPLATE_CATEGORIES.map((category) => (
        <Section key={category} className="gap-4">
          <Heading level={3}>{category}</Heading>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,320px))]">
            {AGENTIC_WORKFLOW_TEMPLATES.filter((template) => template.category === category).map((template) => (
              <Link
                key={template.id}
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow"
                params={{ organizationId, projectId, environmentId }}
                search={{ template: template.id }}
                onClick={() => selectTemplate(template.id)}
                color="neutral"
                className="flex min-w-0 flex-col items-start gap-2 rounded-lg border border-neutral bg-surface-neutral p-4 hover:bg-surface-neutral-subtle hover:text-neutral"
              >
                <span className="flex w-full min-w-0 items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center text-brand">
                    <TemplateIcon template={template} />
                  </span>
                  <span className="truncate text-sm font-medium">{template.title}</span>
                </span>
                <span className="line-clamp-2 text-sm font-normal leading-5 text-neutral-subtle">
                  {template.description}
                </span>
              </Link>
            ))}
          </div>
        </Section>
      ))}
    </div>
  )
}

function AgentTemplateCatalogModal({
  onClose,
  onCreateFromScratch,
}: {
  onClose: () => void
  onCreateFromScratch: () => void
}) {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Heading level={2} className="text-xl font-medium">
            Create Agent Task
          </Heading>
          <p className="text-sm text-neutral-subtle">Choose a template to create an agent task for this environment.</p>
        </div>
        <Button variant="plain" color="neutral" aria-label="Close" onClick={onClose}>
          <Icon iconName="xmark" />
        </Button>
      </div>
      <AgentTemplateCatalog onSelect={onClose} />
      <div className="flex justify-end">
        <Button
          onClick={() => {
            onClose()
            onCreateFromScratch()
          }}
        >
          Create from scratch
        </Button>
      </div>
    </div>
  )
}

export function EnvironmentAutomationSkeleton() {
  return (
    <div
      className="container mx-auto flex min-h-page-container flex-col pt-6"
      aria-busy="true"
      aria-label="Loading automations"
    >
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex shrink-0 flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <Heading>Automations</Heading>
            <div className="flex items-center gap-2" aria-hidden="true">
              <Skeleton width={170} height={32} />
              <Skeleton width={150} height={32} />
            </div>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex min-h-40 items-center justify-center">
          <LoaderSpinner />
        </div>
      </Section>
    </div>
  )
}
