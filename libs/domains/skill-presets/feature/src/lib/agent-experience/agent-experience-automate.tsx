import { useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ServiceLightResponse, ServiceTypeEnum } from 'qovery-typescript-axios'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { useBillingPaywall } from '@qovery/shared/billing/feature'
import { Button, EmptyState, Link, Skeleton, TablePrimitives, Tooltip, useModal } from '@qovery/shared/ui'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { LoadError } from '../load-error/load-error'
import { AgentTaskEnvironmentModal } from './agent-task-environment-modal'
import { AgentExperiencePage } from './ui/agent-experience-ui'

const { Table } = TablePrimitives
const AGENT_TASK_CREATE_ACTION = 'agent_task.create'
const taskOverview =
  '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview'

function selectAgentTasks(services: ServiceLightResponse[] = []) {
  return services
    .filter(({ service_type }) => service_type === ServiceTypeEnum.AGENTIC_WORKFLOW)
    .sort(
      (a, b) =>
        a.project_name.localeCompare(b.project_name) ||
        a.environment_name.localeCompare(b.environment_name) ||
        a.name.localeCompare(b.name)
    )
}

export function AgentExperienceAutomations() {
  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const enabled = useFeatureFlagEnabled('argentic-workflow')
  const { canManage, isLoading: isRoleLoading } = useCanManageSkillPresets({ organizationId })
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...queries.organizations.servicesSearch({ organizationId }),
    enabled: Boolean(organizationId) && enabled === true,
    select: selectAgentTasks,
    staleTime: 0,
  })
  const { openModal, closeModal } = useModal()
  const { showChat } = useSupportChat()
  const canCreate = enabled === true && !isRoleLoading && canManage
  // Without agent tasks in the plan, "Create agent task" opens the full-page paywall; with them, the
  // intro first when staff turned it on, then the environment picker.
  const paywall = useBillingPaywall(
    organizationId,
    { actions: canCreate ? [AGENT_TASK_CREATE_ACTION] : [] },
    { onContactSales: showChat, variant: 'page' }
  )
  useDocumentTitle('Automations - Agents')

  if (enabled === false) {
    return (
      <Navigate
        to="/organization/$organizationId/agents/skill-presets"
        params={{ organizationId }}
        search
        hash
        replace
      />
    )
  }

  return (
    <AgentExperiencePage
      layout="dashboard"
      title="Automations"
      description="View the agent tasks in your organization."
      showHelp
      action={
        canCreate && (
          <Button
            size="md"
            onClick={() =>
              paywall.proceed(AGENT_TASK_CREATE_ACTION, () =>
                openModal({
                  content: <AgentTaskEnvironmentModal organizationId={organizationId} onClose={closeModal} />,
                })
              )
            }
          >
            Create agent task
          </Button>
        )
      }
    >
      {paywall.element}
      {Boolean(error) && tasks && (
        <LoadError title="Agent tasks could not be refreshed" error={error} onRetry={refetch} />
      )}
      {enabled === undefined || isLoading ? (
        <div aria-label="Loading agent tasks" aria-busy="true">
          <Skeleton height={120} className="w-full" show />
        </div>
      ) : error && !tasks ? (
        <LoadError title="Agent tasks could not be loaded" error={error} onRetry={refetch} />
      ) : !tasks?.length ? (
        <EmptyState
          icon="robot"
          title="No agent tasks yet"
          description="Agent tasks appear here once they’re created in an environment."
        />
      ) : (
        <Table.Root className="w-full min-w-[32rem] table-fixed" containerClassName="rounded-lg">
          <Table.Header className="text-xs text-neutral-subtle">
            <Table.Row>
              <Table.ColumnHeaderCell className="h-9 w-2/5 border-r">Agent task</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="h-9 w-1/4 border-r">Project</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="h-9">Environment</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tasks.map((task) => {
              const params = {
                organizationId,
                projectId: task.project_id,
                environmentId: task.environment_id,
                serviceId: task.id,
              }

              return (
                <Table.Row
                  key={task.id}
                  className="h-[60px] cursor-pointer focus-within:bg-surface-neutral-subtle hover:bg-surface-neutral-subtle"
                  onClick={() => navigate({ to: taskOverview, params })}
                >
                  <Table.Cell className="border-r">
                    <Tooltip content={task.name}>
                      <Link
                        to={taskOverview}
                        params={params}
                        onClick={(event) => event.stopPropagation()}
                        color="neutral"
                        underline
                        className="max-w-full gap-2.5"
                      >
                        <ServiceAvatar
                          service={{ icon_uri: task.icon_uri, serviceType: 'AGENTIC_WORKFLOW' }}
                          size="custom"
                          className="size-5 shrink-0"
                          radius="none"
                          serviceAvatarRadius="sm"
                          aria-hidden
                        />
                        <span className="min-w-0 truncate">{task.name}</span>
                      </Link>
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell className="border-r py-2 text-neutral-subtle [overflow-wrap:anywhere]">
                    {task.project_name}
                  </Table.Cell>
                  <Table.Cell className="py-2 text-neutral-subtle">
                    <Tooltip content={task.environment_name} classNameContent="[overflow-wrap:anywhere]">
                      <span tabIndex={0} className="block truncate">
                        {task.environment_name}
                      </span>
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      )}
    </AgentExperiencePage>
  )
}
