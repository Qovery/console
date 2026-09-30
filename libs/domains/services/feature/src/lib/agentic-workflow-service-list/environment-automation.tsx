import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Environment } from 'qovery-typescript-axios'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { Button, DropdownMenu, Heading, Icon, Link, Section, useModal } from '@qovery/shared/ui'
import { useServices } from '../hooks/use-services/use-services'
import {
  AGENTIC_WORKFLOW_TEMPLATES,
  AGENT_TEMPLATE_CATEGORIES,
  type AgenticWorkflowTemplate,
} from '../service-creation-flow/agentic-workflow/agentic-workflow-templates'
import { AgentTemplateRequestModal } from '../service-new/agent-template-request-modal/agent-template-request-modal'
import { BaseServiceCard } from '../service-new/service-card/service-card'
import { AgenticWorkflowServiceList } from './agentic-workflow-service-list'

function TemplateIcon({ template }: { template: AgenticWorkflowTemplate }) {
  if (!template.logoPath) return <Icon iconName={template.iconName} iconStyle="regular" className="text-2xl" />
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

export function EnvironmentAutomation({ environment }: { environment: Environment }) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const enabled = Boolean(useFeatureFlagEnabled('argentic-workflow'))
  const { data: services = [] } = useServices({ environmentId, suspense: true })
  const hasAgents = services.some(isAgenticWorkflow)
  const createPath = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/agentic-workflow`
  const selectTemplate = (id?: string) =>
    posthog.capture('select-agent-use-case', { agentUseCase: id ?? 'from-scratch' })
  const createAgent = (id?: string) => {
    selectTemplate(id)
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow',
      params: { organizationId, projectId, environmentId },
      search: id ? { template: id } : {},
    })
  }

  if (!enabled) return null

  return (
    <div className="container mx-auto flex min-h-page-container flex-col pt-6">
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex shrink-0 flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <Heading>Automation</Heading>
            <div className="flex items-center gap-2">
              <Button
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
              {hasAgents && (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button>
                      Create agent task <Icon iconName="chevron-down" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end" className="max-h-[70vh] overflow-y-auto">
                    {AGENT_TEMPLATE_CATEGORIES.map((category) => (
                      <DropdownMenu.Group key={category}>
                        <div className="px-2 py-1 text-xs font-medium text-neutral-subtle">{category}</div>

                        {AGENTIC_WORKFLOW_TEMPLATES.filter((template) => template.category === category).map(
                          (template) => (
                            <DropdownMenu.Item key={template.id} asChild>
                              <Link
                                color="neutral"
                                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow"
                                params={{ organizationId, projectId, environmentId }}
                                search={{ template: template.id }}
                                onClick={() => selectTemplate(template.id)}
                              >
                                {template.title}
                              </Link>
                            </DropdownMenu.Item>
                          )
                        )}
                      </DropdownMenu.Group>
                    ))}
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onClick={() => createAgent()}>Start from scratch</DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              )}
            </div>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-8 pb-20">
          {hasAgents ? (
            <>
              <AgenticWorkflowServiceList environment={environment} />
              <AgenticWorkflowServiceList environment={environment} cloneTasks />
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-subtle">Create an agent task from a template or start from scratch.</p>
              {AGENT_TEMPLATE_CATEGORIES.map((category) => (
                <Section key={category} className="gap-4">
                  <Heading level={3}>{category}</Heading>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {AGENTIC_WORKFLOW_TEMPLATES.filter((template) => template.category === category).map((template) => (
                      <BaseServiceCard
                        key={template.id}
                        title={template.title}
                        description={template.description}
                        showDescription
                        icon={
                          <span className="flex items-center justify-center text-brand">
                            <TemplateIcon template={template} />
                          </span>
                        }
                        link={createPath}
                        search={{ template: template.id }}
                        onClick={() => selectTemplate(template.id)}
                        cloud_provider={environment.cloud_provider.provider}
                      />
                    ))}
                  </div>
                </Section>
              ))}
              <div>
                <Button variant="outline" color="neutral" onClick={() => createAgent()}>
                  <Icon iconName="circle-plus" />
                  Start from scratch
                </Button>
              </div>
            </>
          )}
        </div>
      </Section>
    </div>
  )
}
