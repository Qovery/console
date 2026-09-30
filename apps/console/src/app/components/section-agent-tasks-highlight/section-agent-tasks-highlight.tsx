import { useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useFeatureFlagEnabled, useFeatureFlagVariantKey } from 'posthog-js/react'
import { CreateCloneEnvironmentModal, useEnvironments } from '@qovery/domains/environments/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { AGENTIC_WORKFLOW_TEMPLATES, type AgenticWorkflowTemplate } from '@qovery/domains/services/feature'
import { Button, Icon, Link, Section, useModal } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'

const AGENT_TASKS_HIGHLIGHT_VISIBLE_KEY = 'agent-tasks-highlight-visible'
const INCIDENT_TEMPLATE_IDS = new Set(['honeybadger-incident-analyzer', 'incident-io-analyzer'])
type AgentTaskCard = Pick<AgenticWorkflowTemplate, 'id' | 'title' | 'description' | 'iconName' | 'logoPath'>

const SENTRY_TEMPLATE: AgentTaskCard = {
  id: 'sentry-incident-analyzer',
  title: 'Incident Analyzer with Sentry',
  description: 'Analyze Sentry incidents with deployment, code, logs, and metrics context.',
  logoPath: '/assets/agent-templates/sentry.svg',
}

// Reuses the agent tasks templates (service-new) — sized to the design spec:
// fixed 112px height, space-between, 6px radius, brand-tinted border + shadows.
function TemplateCard({ template }: { template: AgentTaskCard }) {
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

function DecorativeAgentTaskCardRow({ position }: { position: 'top' | 'bottom' }) {
  const positionClass = position === 'top' ? 'top-0' : 'top-[228px]'

  return (
    <img
      src="/assets/agent-tasks/agent-task-decoration.svg"
      alt=""
      className={`pointer-events-none absolute left-1/2 ${positionClass} w-[382px] max-w-none -translate-x-1/2`}
      aria-hidden="true"
    />
  )
}

export function SectionAgentTasksHighlight() {
  const { organizationId = '' } = useParams({ strict: false })
  const isAgenticWorkflowEnabled = Boolean(useFeatureFlagEnabled('argentic-workflow'))
  const isBuildOptimizerVariant = useFeatureFlagVariantKey('discover-agent-tasks-card-ab-test') === 'test'
  const [isVisible, setIsVisible] = useLocalStorage(AGENT_TASKS_HIGHLIGHT_VISIBLE_KEY, true)
  const { openModal, closeModal } = useModal()
  const { data: projects = [] } = useProjects({ organizationId, enabled: isAgenticWorkflowEnabled })
  const firstProject = projects[0]
  const { data: environments = [] } = useEnvironments({ projectId: firstProject?.id ?? '' })
  const firstEnvironment = environments[0]
  const cardTemplates = isBuildOptimizerVariant
    ? AGENTIC_WORKFLOW_TEMPLATES.filter(({ id }) => id === 'build-optimizer')
    : [...AGENTIC_WORKFLOW_TEMPLATES.filter(({ id }) => INCIDENT_TEMPLATE_IDS.has(id)), SENTRY_TEMPLATE]
  const headline = isBuildOptimizerVariant
    ? 'Reduce your build time automatically with our agent tasks'
    : 'Analyze and correct all your incidents automatically'
  const buttonLabel = isBuildOptimizerVariant ? 'Try our build optimizer' : 'Try our incident analyzer'

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

  const trackDiscoverClick = () => posthog.capture('discover-agent-tasks-clicked')

  return (
    <Section className="flex justify-center">
      <div
        data-theme="light"
        className="relative h-[334px] w-full overflow-hidden rounded-lg border border-neutral bg-surface-neutral"
      >
        <img
          src="/assets/agent-tasks/agent-tasks-gradient.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.5] object-cover"
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
          <DecorativeAgentTaskCardRow position="top" />
          <DecorativeAgentTaskCardRow position="bottom" />

          <h2 className="absolute inset-x-8 top-7 text-center text-xl font-normal leading-6 text-neutral [font-family:ReplicaLL]">
            {headline}
          </h2>

          <div
            className="absolute inset-x-0 top-[104px] h-28 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_14%,#000_82%,transparent)]"
            aria-hidden="true"
          >
            {isBuildOptimizerVariant ? (
              <div className="flex h-full justify-center px-7">
                <div className="w-[312px] max-w-full">
                  {cardTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative ml-[calc(50%_-_156px)] flex w-max animate-scroll-horizontal motion-reduce:animate-none">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex shrink-0 gap-3 pr-3" aria-hidden={copy === 1}>
                    {cardTemplates.map((template) => (
                      <div key={template.id} className="w-[312px] shrink-0">
                        <TemplateCard template={template} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="absolute inset-x-7 bottom-4">
            {firstEnvironment ? (
              <Link
                as="button"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/automation"
                params={{ organizationId, projectId: firstProject.id, environmentId: firstEnvironment.id }}
                color="brand"
                variant="solid"
                size="lg"
                className="w-full justify-center"
                onClick={trackDiscoverClick}
              >
                {buttonLabel}
              </Link>
            ) : (
              <Button
                type="button"
                color="brand"
                variant="solid"
                size="lg"
                className="w-full justify-center"
                onClick={() => {
                  trackDiscoverClick()
                  openCreateEnvironmentModal()
                }}
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
