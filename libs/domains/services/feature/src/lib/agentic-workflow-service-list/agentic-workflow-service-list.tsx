import { type AgenticWorkflowResponse } from 'qovery-typescript-axios'
import { Badge, Heading, Icon, Section, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { useAgenticWorkflowServices } from '../hooks/use-agentic-workflow-services/use-agentic-workflow-services'

const { Table } = TablePrimitives

const tableGridLayoutClassName = 'grid w-full grid-cols-[minmax(350px,1fr)_minmax(180px,260px)_140px]'

export interface AgenticWorkflowServiceListProps {
  environmentId: string
}

export function AgenticWorkflowServiceList({ environmentId }: AgenticWorkflowServiceListProps) {
  const { data: services = [] } = useAgenticWorkflowServices({ environmentId, suspense: true })

  if (services.length === 0) return null

  const enabledServicesCount = services.filter(({ enabled }) => enabled).length

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
          className="w-full min-w-[700px] overflow-x-scroll text-xs xl:overflow-auto"
        >
          <Table.Header className="border-neutral">
            <Table.Row className={`h-9 w-full ${tableGridLayoutClassName}`}>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Service
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center border-r border-neutral text-neutral-subtle">
                Model
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex h-full items-center text-neutral-subtle">
                Status
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {services.map((service: AgenticWorkflowResponse) => (
              <Table.Row key={service.id} className={`h-[60px] w-full ${tableGridLayoutClassName}`}>
                <Table.Cell className="flex h-full min-w-0 items-center border-r border-neutral">
                  <div className="flex min-w-0 items-center gap-3 text-sm font-medium">
                    <Icon name="AGENTIC_WORKFLOW" width={20} height={20} />
                    <Tooltip content={service.name}>
                      <span className="truncate text-neutral">{service.name}</span>
                    </Tooltip>
                  </div>
                </Table.Cell>
                <Table.Cell className="flex h-full items-center border-r border-neutral text-sm text-neutral">
                  {service.model?.type ?? '-'}
                </Table.Cell>
                <Table.Cell className="flex h-full items-center">
                  <Badge variant="surface" color={service.enabled ? 'green' : 'neutral'}>
                    {service.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
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
