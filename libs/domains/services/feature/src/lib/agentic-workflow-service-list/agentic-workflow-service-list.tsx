import { useNavigate } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent } from 'react'
import { type AgenticWorkflow, isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { Badge, Heading, Section, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { AgenticWorkflowServiceActions } from '../agentic-workflow-service-actions/agentic-workflow-service-actions'
import { useServices } from '../hooks/use-services/use-services'
import { ServiceLastDeploymentCell, ServiceNameCell } from '../service-list/service-list-cells'
import { ServiceStateChip } from '../service-state-chip/service-state-chip'

const { Table } = TablePrimitives

const tableGridLayoutClassName = 'grid w-full grid-cols-[minmax(280px,1.1fr)_minmax(260px,1fr)_minmax(280px,1fr)_130px]'

export interface AgenticWorkflowServiceListProps {
  environment: Environment
}

function TriggerCell({
  service,
  onAction,
}: {
  service: AgenticWorkflow
  onAction: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2" onClick={onAction} onKeyDown={onAction}>
      <Tooltip content={service.webhook.url}>
        <span className="shrink-0 text-sm text-neutral">Webhook</span>
      </Tooltip>
      {service.schedule && (
        <>
          <span className="text-neutral-subtle">+</span>
          <span className="min-w-0 truncate text-sm text-neutral">
            Schedule ·{' '}
            {service.schedule.next_run_at
              ? dateFullFormat(service.schedule.next_run_at, service.schedule.timezone, 'dd MMM, HH:mm')
              : 'Paused'}
          </span>
        </>
      )}
    </div>
  )
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
        <Heading level={3} className="font-medium text-neutral-subtle">
          Agent tasks
        </Heading>
        <p className="text-sm text-neutral-subtle">One-time tasks delegated to AI agents.</p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border border-neutral">
        <div className="flex gap-1.5 bg-surface-neutral px-4 py-3">
          <Badge variant="surface" radius="full" color="green" className="text-ssm font-medium">
            {enabledServicesCount} enabled
          </Badge>
        </div>
        <Table.Root containerClassName="rounded-none border-x-0 border-b-0 border-t" className="w-full text-xs">
          <Table.Header className="border-neutral">
            <Table.Row className={`h-9 w-full ${tableGridLayoutClassName}`}>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Service
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Last operation
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Trigger
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
                  <ServiceStateChip mode="running" environmentId={environmentId} serviceId={service.id} />
                </Table.Cell>
                <Table.Cell className="flex h-full items-center border-r border-neutral">
                  <ServiceLastDeploymentCell service={service} environment={environment} />
                </Table.Cell>
                <Table.Cell className="flex h-full min-w-0 items-center border-r border-neutral">
                  <TriggerCell service={service} onAction={stopRowNavigation} />
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
