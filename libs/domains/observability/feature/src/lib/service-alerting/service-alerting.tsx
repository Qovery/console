import { AlertRuleState } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { Badge, Button, Heading, Icon, Section, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { useAlertRules } from '../hooks/use-alert-rules/use-alert-rules'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import { SeverityIndicator } from './severity-indicator/severity-indicator'

const { Table } = TablePrimitives

function getStatusConfig(state: AlertRuleState) {
  switch (state) {
    case AlertRuleState.TRIGGERED:
    case AlertRuleState.PENDING_NOTIFICATION:
    case AlertRuleState.NOTIFIED:
      return {
        label: 'Firing',
        color: 'red' as const,
        icon: 'fire' as const,
      }
    case AlertRuleState.SUPPRESSED:
      return {
        label: 'Suppressed',
        color: 'yellow' as const,
        icon: 'bell-slash' as const,
      }
    case AlertRuleState.UNROUTED:
      return {
        label: 'Unrouted',
        color: 'neutral' as const,
        icon: 'triangle-exclamation' as const,
      }
    default:
      return {
        label: 'Monitoring',
        color: 'green' as const,
        icon: 'light-emergency' as const,
      }
  }
}

export function ServiceAlerting() {
  const { environmentId = '', applicationId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: alertRules = [], isFetched: isAlertRulesFetched } = useAlertRules({
    organizationId: environment?.organization.id ?? '',
    serviceId: applicationId,
  })

  if (!environment || !isAlertRulesFetched) return null

  return (
    <Section className="w-full px-8 py-6">
      <div className="border-b border-neutral-250">
        <div className="flex w-full items-center justify-between pb-5">
          <Heading level={1}>Alerts</Heading>
          <Button variant="outline" color="neutral" size="md" className="gap-1.5">
            <Icon iconName="circle-plus" iconStyle="regular" className="text-xs" />
            New alert
          </Button>
        </div>
      </div>
      {alertRules.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center overflow-hidden rounded border border-neutral-250 bg-neutral-100 p-10 text-center">
          <Icon iconName="light-emergency" iconStyle="regular" className="mb-2.5 text-xl text-neutral-350" />
          <p className="font-medium">No alerts created for this service</p>
          <p className="mb-3 text-sm text-neutral-350">
            Define baseline alerts for key metrics like CPU, memory, latency, <br /> and error rate that will help you
            keep your service under control.
          </p>
          <Button size="md" className="gap-1.5">
            <Icon iconName="plus-large" iconStyle="regular" className="text-xs" />
            Create key alerts
          </Button>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-md border border-neutral-250">
          <Table.Root className="divide-y divide-neutral-250">
            <Table.Header>
              <Table.Row className="divide-x divide-neutral-250">
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Severity</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right">Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body className="divide-y divide-neutral-250">
              {alertRules?.map((alertRule) => {
                const statusConfig = getStatusConfig(alertRule.state)
                const isMuted = !alertRule.enabled

                return (
                  <Table.Row key={alertRule.id} className="divide-x divide-neutral-250">
                    <Table.RowHeaderCell>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-neutral-400">{alertRule.name}</span>
                        {isMuted && (
                          <Tooltip content="Alert is muted">
                            <Icon iconName="bell-slash" iconStyle="regular" className="text-xs text-neutral-350" />
                          </Tooltip>
                        )}
                      </div>
                    </Table.RowHeaderCell>
                    <Table.Cell>
                      <Badge
                        color={statusConfig.color}
                        variant="surface"
                        radius="full"
                        className="gap-1 font-medium"
                        size="sm"
                      >
                        <Icon iconName={statusConfig.icon} iconStyle="regular" className="text-xs" />
                        {statusConfig.label}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <SeverityIndicator severity={alertRule.severity} />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip content="Edit">
                          <Button variant="outline" color="neutral" size="xs" className="w-6 justify-center">
                            <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="More options">
                          <Button variant="outline" color="neutral" size="xs" className="w-6 justify-center">
                            <Icon iconName="ellipsis" iconStyle="regular" className="text-xs" />
                          </Button>
                        </Tooltip>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
        </div>
      )}
    </Section>
  )
}

export default ServiceAlerting
