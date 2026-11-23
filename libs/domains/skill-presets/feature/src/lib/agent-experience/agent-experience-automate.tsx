import { useQuery } from '@tanstack/react-query'
import { Navigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ServiceLightResponse, ServiceTypeEnum } from 'qovery-typescript-axios'
import { Button, EmptyState, ExternalLink, Link, Skeleton, TablePrimitives, useModal } from '@qovery/shared/ui'
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
      description={
        <>
          View the agent tasks in your organization.{' '}
          <ExternalLink href="https://www.qovery.com/docs/configuration/agent-tasks/overview" size="sm">
            Agent Tasks docs
          </ExternalLink>
        </>
      }
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
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Agent task</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Environment</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tasks.map((task) => (
              <Table.Row key={task.id}>
                <Table.Cell>
                  <Link
                    to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
                    params={{
                      organizationId,
                      projectId: task.project_id,
                      environmentId: task.environment_id,
                      serviceId: task.id,
                    }}
                  >
                    {task.name}
                  </Link>
                </Table.Cell>
                <Table.Cell>{task.project_name}</Table.Cell>
                <Table.Cell>{task.environment_name}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </AgentExperiencePage>
  )
}
