import { useNavigate } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent } from 'react'
import { match } from 'ts-pattern'
import { type AgenticWorkflow, isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, Heading, Icon, Section, TablePrimitives } from '@qovery/shared/ui'
import { AgenticWorkflowServiceActions } from '../agentic-workflow-service-actions/agentic-workflow-service-actions'
import { useServices } from '../hooks/use-services/use-services'
import { ServiceLastDeploymentCell, ServiceNameCell } from '../service-list/service-list-cells'
import { ServiceStateChip } from '../service-state-chip/service-state-chip'

const { Table } = TablePrimitives

const tableGridLayoutClassName =
  'grid w-full grid-cols-[minmax(280px,1.1fr)_minmax(300px,1fr)_minmax(200px,0.7fr)_130px]'

export interface AgenticWorkflowServiceListProps {
  environment: Environment
}

function ModelCell({ service }: { service: AgenticWorkflow }) {
  return match(service.model?.type)
    .with('CLAUDE', () => (
      <span className="flex items-center gap-2 text-sm text-neutral">
        <img src="/assets/ai-tools/claude.svg" alt="" aria-hidden="true" className="h-5 w-5" />
        Claude
      </span>
    ))
    .with('BEDROCK', () => (
      <span className="flex items-center gap-2 text-sm text-neutral">
        <Icon name={IconEnum.AWS_GRAY} className="h-5 w-5" />
        Bedrock
      </span>
    ))
    .otherwise((model) => <span className="text-sm text-neutral-subtle">{model ?? 'Not configured'}</span>)
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
          Agentic workflows
        </Heading>
        <p className="text-sm text-neutral-subtle">AI workflows triggered through webhooks and connected services.</p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border border-neutral">
        <div className="flex gap-1.5 bg-surface-neutral px-4 py-3">
          <Badge variant="surface" radius="full" color="green" className="text-ssm font-medium">
            {enabledServicesCount} enabled
          </Badge>
        </div>
        <Table.Root
          containerClassName="rounded-none border-x-0 border-b-0 border-t"
          className="w-full min-w-[1080px] overflow-x-scroll text-xs xl:overflow-auto"
        >
          <Table.Header className="border-neutral">
            <Table.Row className={`h-9 w-full ${tableGridLayoutClassName}`}>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Service
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Last operation
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Model
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
                  <ModelCell service={service} />
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
