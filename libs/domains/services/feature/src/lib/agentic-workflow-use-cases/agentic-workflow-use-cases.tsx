import posthog from 'posthog-js'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { cloneElement } from 'react'
import { Button, DropdownMenu, Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { AGENTIC_WORKFLOW_TEMPLATES } from '../service-creation-flow/agentic-workflow/agentic-workflow-templates'
import { type ServiceBlock } from '../service-new/service-card/service-card'
import { getServicesPath } from '../service-new/service-new-utils/service-new-utils'

export interface AgenticWorkflowUseCasesProps {
  cloudProvider?: CloudProviderEnum | string
  display?: 'cards' | 'menu'
  environmentId: string
  organizationId: string
  projectId: string
}

function AgenticWorkflowUseCaseCard({ useCase, actionLabel }: { useCase: ServiceBlock; actionLabel: string }) {
  return (
    <section className="flex h-full flex-col gap-4 rounded-lg border border-neutral bg-surface-neutral p-4 [box-shadow:0px_0px_4px_0px_rgba(0,0,0,0.01),0px_2px_3px_0px_rgba(0,0,0,0.02)]">
      <div className="flex flex-1 flex-col gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-neutral-component text-neutral">
          <span className="flex h-4 w-4 items-center justify-center leading-none">
            {cloneElement(useCase.icon, { width: 16, height: 16, className: 'block h-4 w-4' })}
          </span>
        </span>
        <div className="flex flex-col gap-1">
          <Heading level={3}>{useCase.title}</Heading>
          <p className="text-sm leading-5 text-neutral-subtle">{useCase.description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1">
        {useCase.link ? (
          <Link
            as="button"
            variant="outline"
            color="neutral"
            size="sm"
            // @ts-expect-error-next-line TODO new-nav: Route strings need to use typed routes
            to={useCase.link}
            search={useCase.search}
            onClick={useCase.onClick}
          >
            {actionLabel}
          </Link>
        ) : useCase.onClick ? (
          <Button type="button" variant="outline" color="neutral" size="sm" onClick={useCase.onClick}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </section>
  )
}

export function AgenticWorkflowUseCases({
  cloudProvider,
  display = 'cards',
  environmentId,
  organizationId,
  projectId,
}: AgenticWorkflowUseCasesProps) {
  const { showPylonForm } = useSupportChat()
  const createPath = getServicesPath(organizationId, projectId, environmentId, '/service/create/agentic-workflow')
  const useCases: ServiceBlock[] = [
    ...AGENTIC_WORKFLOW_TEMPLATES.map((template) => ({
      title: template.title,
      description: template.description,
      icon: <Icon iconName={template.iconName} iconStyle="regular" />,
      link: createPath,
      search: { template: template.id },
      onClick: () => posthog.capture('select-agent-use-case', { agentUseCase: template.id }),
      cloud_provider: cloudProvider,
    })),
    {
      title: 'Start from scratch',
      description: 'Start with a blank agent task and configure everything yourself.',
      icon: <Icon iconName="circle-plus" iconStyle="regular" />,
      link: createPath,
      onClick: () => posthog.capture('select-agent-use-case', { agentUseCase: 'from-scratch' }),
      cloud_provider: cloudProvider,
    },
    {
      title: 'Need a specific agent? Contact us',
      description: 'Tell us which agent use case you need and we will help you set it up.',
      icon: <Icon iconName="circle-question" iconStyle="regular" />,
      onClick: () => showPylonForm('request-ai-builder-portal'),
    },
  ]

  if (display === 'menu') {
    const creationUseCases = useCases.slice(0, -1).map((useCase) =>
      useCase.title === 'Start from scratch'
        ? {
            ...useCase,
            title: 'Manual',
            description: 'Configure an agent task without using a template.',
          }
        : useCase
    )
    const customUseCase = useCases.at(-1)

    return (
      <div className="flex shrink-0 items-center gap-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button size="md">
              <Icon iconName="circle-plus" iconStyle="regular" />
              Create agent task
              <Icon iconName="chevron-down" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" className="w-80">
            {creationUseCases.map((useCase) =>
              useCase.link ? (
                <DropdownMenu.Item key={useCase.title} asChild color="neutral" className="h-auto items-start py-2.5">
                  {/* @ts-expect-error-next-line TODO new-nav: Route strings need to use typed routes */}
                  <Link to={useCase.link} search={useCase.search} onClick={useCase.onClick}>
                    {cloneElement(useCase.icon, { className: 'mr-3 mt-0.5 min-w-5 text-base text-neutral-subtle' })}
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-medium text-neutral">{useCase.title}</span>
                      <span className="text-xs font-normal leading-4 text-neutral-subtle">{useCase.description}</span>
                    </span>
                  </Link>
                </DropdownMenu.Item>
              ) : null
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        {customUseCase ? (
          <Button size="md" color="neutral" variant="outline" onClick={customUseCase.onClick}>
            Need a specific agent?
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <Section className="gap-4">
      <div className="flex flex-col gap-1">
        <Heading level={2}>Create an agent task</Heading>
        <p className="text-sm leading-5 text-neutral-subtle">
          Start from a ready-made agent configuration and adjust it to your needs.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {useCases.map((useCase) => (
          <AgenticWorkflowUseCaseCard
            key={useCase.title}
            useCase={useCase}
            actionLabel={
              useCase.title === 'Start from scratch'
                ? 'Configure manually'
                : useCase.link
                  ? 'Use template'
                  : 'Contact us'
            }
          />
        ))}
      </div>
    </Section>
  )
}
