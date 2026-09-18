import { useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { CreateCloneEnvironmentModal, useEnvironments } from '@qovery/domains/environments/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { AGENTIC_WORKFLOW_TEMPLATES, type AgenticWorkflowTemplate } from '@qovery/domains/services/feature'
import { Button, Icon, Link, Section, useModal } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'

const AGENT_TASKS_HIGHLIGHT_VISIBLE_KEY = 'agent-tasks-highlight-visible'

// Reuses the agent tasks templates (service-new) — sized to the design spec:
// fixed 112px height, space-between, 6px radius, brand-tinted border + shadows.
function TemplateCard({ template }: { template: AgenticWorkflowTemplate }) {
  return (
    <div className="flex h-28 w-full flex-col justify-between rounded-md border border-[rgba(100,45,255,0.08)] bg-surface-neutral p-3 text-left shadow-[0px_2.32px_6.19px_0px_rgba(100,45,255,0.08),0px_0px_4.64px_0px_rgba(100,45,255,0.01)]">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-brand">
        {template.logoPath ? (
          <img src={template.logoPath} alt="" className="size-full object-contain" />
        ) : template.iconName ? (
          <Icon iconName={template.iconName} iconStyle="regular" className="text-xl" />
        ) : null}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[11px] font-medium leading-4 text-neutral">{template.title}</span>
        <span className="line-clamp-2 text-[11px] font-normal leading-4 text-neutral-subtle">
          {template.description}
        </span>
      </span>
    </div>
  )
}

export function SectionAgentTasksHighlight() {
  const { organizationId = '' } = useParams({ strict: false })
  const isAgenticWorkflowEnabled = Boolean(useFeatureFlagEnabled('argentic-workflow'))
  const [isVisible, setIsVisible] = useLocalStorage(AGENT_TASKS_HIGHLIGHT_VISIBLE_KEY, true)
  const { openModal, closeModal } = useModal()
  const { data: projects = [] } = useProjects({ organizationId, enabled: isAgenticWorkflowEnabled })
  const firstProject = projects[0]
  const { data: environments = [] } = useEnvironments({ projectId: firstProject?.id ?? '' })
  const firstEnvironment = environments[0]

  if (!isAgenticWorkflowEnabled || !isVisible || !firstProject) {
    return null
  }

  const openCreateEnvironmentModal = () =>
    openModal({
      content: (
        <CreateCloneEnvironmentModal
          onClose={closeModal}
          onSuccess={closeModal}
          projectId={firstProject.id}
          organizationId={organizationId}
        />
      ),
      options: { fakeModal: true },
    })

  return (
    <Section className="flex justify-center">
      <div
        data-theme="light"
        className="relative h-[334px] w-full overflow-hidden rounded-lg border border-neutral bg-surface-neutral"
      >
        <img
          src="/assets/agent-tasks/agent-tasks-gradient.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <Button
          variant="plain"
          color="neutral"
          size="xs"
          iconOnly
          aria-label="Dismiss agent tasks card"
          className="absolute right-2 top-2 z-[1]"
          onClick={() => setIsVisible(false)}
        >
          <Icon iconName="xmark" />
        </Button>

        <div className="relative flex h-full flex-col">
          <div className="min-h-0 flex-1 overflow-hidden px-7 pt-4 [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_82%,transparent)]">
            <div className="flex animate-scroll-vertical flex-col motion-reduce:animate-none">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex flex-col gap-3 pb-3" aria-hidden={copy === 1}>
                  {AGENTIC_WORKFLOW_TEMPLATES.map((template) => (
                    <TemplateCard key={`${copy}-${template.id}`} template={template} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="relative px-7 pb-4">
            {firstEnvironment ? (
              <Link
                as="button"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/new"
                params={{ organizationId, projectId: firstProject.id, environmentId: firstEnvironment.id }}
                color="brand"
                variant="solid"
                size="lg"
                className="w-full justify-center"
                onClick={() => posthog.capture('discover-agent-tasks-clicked')}
              >
                Discover Agent Tasks
              </Link>
            ) : (
              <Button
                type="button"
                color="brand"
                variant="solid"
                size="lg"
                className="w-full justify-center"
                onClick={openCreateEnvironmentModal}
              >
                Create an environment
              </Button>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}

export default SectionAgentTasksHighlight
