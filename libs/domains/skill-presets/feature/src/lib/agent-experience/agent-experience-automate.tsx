import { useQuery } from '@tanstack/react-query'
import { Navigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ServiceLightResponse, ServiceTypeEnum } from 'qovery-typescript-axios'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { Button, EmptyState, Link, Skeleton, TablePrimitives, Tooltip, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { LoadError } from '../load-error/load-error'
import { AgentTaskEnvironmentModal } from './agent-task-environment-modal'
import { AgentExperiencePage } from './ui/agent-experience-ui'

const { Table } = TablePrimitives

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
  useDocumentTitle('Automations - Agents')

  if (enabled === false) {
    return (
      <Navigate to="/organization/$organizationId/agent-experience/skill-presets" params={{ organizationId }} replace />
    )
  }

  return (
    <AgentExperiencePage
      layout="dashboard"
      title="Automations"
      description="View the agent tasks in your organization."
      showHelp
      action={
        enabled &&
        !isRoleLoading &&
        canManage && (
          <Button
            size="md"
            onClick={() =>
              openModal({ content: <AgentTaskEnvironmentModal organizationId={organizationId} onClose={closeModal} /> })
            }
          >
            Create agent task
          </Button>
        )
      }
    >
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
            {tasks.map((task) => (
              <Table.Row
                key={task.id}
                className="h-[60px] focus-within:bg-surface-neutral-subtle hover:bg-surface-neutral-subtle"
              >
                <Table.Cell className="border-r">
                  <Tooltip content={task.name}>
                    <Link
                      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
                      params={{
                        organizationId,
                        projectId: task.project_id,
                        environmentId: task.environment_id,
                        serviceId: task.id,
                      }}
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
                <Table.Cell className="py-2 text-neutral-subtle [overflow-wrap:anywhere]">
                  {task.environment_name}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </AgentExperiencePage>
  )
}
