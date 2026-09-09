import { useNavigate } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent } from 'react'
import { type AgenticWorkflow, isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { Badge, Heading, Section, TablePrimitives } from '@qovery/shared/ui'
import { formatCronExpression } from '@qovery/shared/util-js'
import { MOCK_RUNS } from '../agent-task-runs/agent-task-runs.mock'
import { AgenticWorkflowServiceActions } from '../agentic-workflow-service-actions/agentic-workflow-service-actions'
import { useServices } from '../hooks/use-services/use-services'
import { ServiceNameCell } from '../service-list/service-list-cells'

const { Table } = TablePrimitives

const tableGridLayoutClassName = 'grid w-full grid-cols-[minmax(240px,1.2fr)_minmax(180px,1fr)_minmax(200px,1fr)_100px]'

export interface AgenticWorkflowServiceListProps {
  environment: Environment
}

export function AgenticWorkflowServiceList({ environment }: AgenticWorkflowServiceListProps) {
  const environmentId = environment.id
  const organizationId = environment.organization.id
  const projectId = environment.project.id
  const navigate = useNavigate()
  const { data: allServices = [] } = useServices({ environmentId, suspense: true })
  const services = allServices.filter(isAgenticWorkflow) as AgenticWorkflow[]

  if (services.length === 0) return null

  const enabledServicesCount = services.filter(({ enabled }) => enabled).length

  const handleNavigateToService = (serviceId: string) => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: { organizationId, projectId, environmentId, serviceId },
    })
  }

  const stopRowNavigation = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  return (
    <Section className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1">
        <Heading level={2}>Agent tasks</Heading>
        <p className="text-sm leading-5 text-neutral-subtle">
          Run AI agents on demand, on a schedule, or from a webhook.
        </p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border border-neutral">
        <div className="flex gap-1.5 bg-surface-neutral px-4 py-3">
          <Badge variant="surface" radius="full" color="green" className="text-ssm font-medium">
            {enabledServicesCount} enabled
          </Badge>
        </div>
        <Table.Root
          containerClassName="rounded-none border-x-0 border-b-0 border-t"
          className="w-full min-w-[900px] overflow-x-scroll text-xs xl:overflow-auto"
        >
          <Table.Header className="border-neutral">
            <Table.Row className={`h-9 w-full ${tableGridLayoutClassName}`}>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Agent Task
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Trigger
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Last triggered
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center text-neutral-subtle">
                Actions
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {services.map((service) => (
              <Table.Row
                key={service.id}
                className={`h-[60px] w-full cursor-pointer hover:bg-surface-neutral-subtle ${tableGridLayoutClassName}`}
                tabIndex={0}
                onClick={() => handleNavigateToService(service.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleNavigateToService(service.id)
                }}
              >
                <Table.Cell className="flex h-full min-w-0 items-center gap-3 border-r border-neutral">
                  <div className="min-w-0 flex-1">
                    <ServiceNameCell service={service} environment={environment} />
                  </div>
                </Table.Cell>
                <Table.Cell className="flex h-full items-center border-r border-neutral">
                  <span>
                    {[
                      service.schedule
                        ? `${formatCronExpression(service.schedule.cron_expression) || service.schedule.cron_expression} (${service.schedule.timezone})`
                        : null,
                      service.webhook?.url ? 'Webhook' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Manual'}
                  </span>
                </Table.Cell>
                <Table.Cell className="flex h-full min-w-0 items-center border-r border-neutral">
                  <div className="flex flex-col gap-1">
                    <time dateTime={MOCK_RUNS[0].created_at}>
                      {new Intl.DateTimeFormat('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'UTC',
                      }).format(new Date(MOCK_RUNS[0].created_at))}{' '}
                      UTC
                    </time>
                  </div>
                </Table.Cell>
                <Table.Cell className="flex h-full items-center">
                  <AgenticWorkflowServiceActions
                    service={service}
                    environment={environment}
                    onAction={stopRowNavigation}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </Section>
  )
}

export default AgenticWorkflowServiceList
