import { type AlertSeverity, type AlertTargetType } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useService } from '@qovery/domains/services/feature'
import { Button, FunnelFlowBody, Heading, Icon, Section, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { useCreateAlertRule } from '../../../hooks/use-create-alert-rule/use-create-alert-rule'
import { SeverityIndicator } from '../../../service/service-alerting/severity-indicator/severity-indicator'
import { useAlertingCreationFlowContext } from '../alerting-creation-flow'

const { Table } = TablePrimitives

interface AlertSummary {
  name: string
  metricCategory: string
  severity: AlertSeverity
  skipped?: boolean
}

interface AlertsSummaryTableProps {
  alerts: AlertSummary[]
  onEdit?: (index: number) => void
  onToggleSkip?: (index: number) => void
  showExcludeButton?: boolean
  showIncludeButton?: boolean
}

function AlertsSummaryTable({
  alerts,
  onEdit,
  onToggleSkip,
  showExcludeButton = false,
  showIncludeButton = false,
}: AlertsSummaryTableProps) {
  return (
    <div className="-mt-2 overflow-hidden rounded-lg border border-neutral-250 bg-white">
      <Table.Root className="divide-y divide-neutral-250">
        <Table.Header>
          <Table.Row className="font-code text-xs">
            <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">Alert name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">Metric</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">Severity</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">
              Notification channels
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="h-9 text-right font-normal text-neutral-350">
              Actions
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body className="divide-y divide-neutral-250">
          {alerts?.map((alert, index) => (
            <Table.Row key={index} className="h-11">
              <Table.RowHeaderCell>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-neutral-400">{alert.name}</span>
                </div>
              </Table.RowHeaderCell>
              <Table.Cell className="h-11">{alert.metricCategory}</Table.Cell>
              <Table.Cell className="h-11">
                <SeverityIndicator severity={alert.severity} />
              </Table.Cell>
              <Table.Cell className="h-11">Slack</Table.Cell>
              <Table.Cell className="h-11">
                <div className="flex items-center justify-end gap-1">
                  {showExcludeButton && (
                    <Tooltip content="Exclude from creation">
                      <Button
                        variant="outline"
                        color="neutral"
                        size="xs"
                        className="w-6 justify-center"
                        onClick={() => onToggleSkip?.(index)}
                      >
                        <Icon iconName="circle-minus" iconStyle="regular" className="text-xs" />
                      </Button>
                    </Tooltip>
                  )}
                  {showIncludeButton && (
                    <Tooltip content="Include in creation">
                      <Button
                        variant="outline"
                        color="neutral"
                        size="xs"
                        className="w-6 justify-center"
                        onClick={() => onToggleSkip?.(index)}
                      >
                        <Icon iconName="circle-plus" iconStyle="regular" className="text-xs" />
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content="Edit alert">
                    <Button
                      variant="outline"
                      color="neutral"
                      size="xs"
                      className="w-6 justify-center"
                      onClick={() => onEdit?.(index)}
                    >
                      <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                    </Button>
                  </Tooltip>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  )
}

function convertDurationToISO8601(duration: string): string {
  const match = duration.match(/^(\d+)m$/)
  if (match) {
    return `PT${match[1]}M`
  }
  return duration
}

export function SummaryStep() {
  const navigate = useNavigate()
  const { organizationId = '', applicationId = '' } = useParams()

  const { data: service } = useService({ serviceId: applicationId })
  const { data: environment } = useEnvironment({ environmentId: service?.environment.id })
  const { mutateAsync: createAlertRule } = useCreateAlertRule({ organizationId })

  const [isCreatingAlertRule, setIsCreatingAlertRule] = useState(false)

  const { serviceName, setCurrentStepIndex, alerts, setAlerts, onComplete, selectedMetrics } =
    useAlertingCreationFlowContext()

  useEffect(() => {
    setCurrentStepIndex(selectedMetrics.length)
  }, [selectedMetrics.length, setCurrentStepIndex])

  const handleEdit = (alertId: string) => {
    navigate(`../edit/${alertId}`)
  }

  const handleToggleSkip = (index: number, isCurrentlySkipped: boolean) => {
    const updatedAlerts = [...alerts]
    updatedAlerts[index] = {
      ...updatedAlerts[index],
      skipped: !isCurrentlySkipped,
    }
    setAlerts(updatedAlerts)
  }

  const handleConfirm = async () => {
    const activeAlerts = alerts.filter((alert) => !alert.skipped)

    if (!service || !environment) return

    try {
      setIsCreatingAlertRule(true)
      for (const alert of activeAlerts) {
        await createAlertRule({
          payload: {
            organization_id: organizationId,
            cluster_id: environment.cluster_id,
            target: {
              target_id: service.id,
              target_type: service.serviceType as AlertTargetType,
            },
            name: alert.name,
            description: alert.metricCategory,
            promql_expr: `${alert.condition.operator}(${alert.condition.threshold})`,
            for_duration: convertDurationToISO8601(alert.condition.duration),
            severity: alert.severity,
            enabled: true,
            // alert_receiver_ids: alert.notificationChannels,
            alert_receiver_ids: ['e52c83f5-c9a8-41c2-9fb3-0f103d8811aa'],
            presentation: {},
          },
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreatingAlertRule(false)
    }

    onComplete(activeAlerts)
  }

  const activeAlertsWithIndex = alerts
    .map((alert, index) => ({ alert, originalIndex: index }))
    .filter(({ alert }) => !alert.skipped)

  const skippedAlertsWithIndex = alerts
    .map((alert, index) => ({ alert, originalIndex: index }))
    .filter(({ alert }) => alert.skipped)

  const activeAlerts = activeAlertsWithIndex.map(({ alert }) => alert)
  const skippedAlerts = skippedAlertsWithIndex.map(({ alert }) => alert)

  return (
    <FunnelFlowBody>
      <Section className="flex flex-col gap-4">
        <Heading>Summary</Heading>

        <div className="flex justify-between rounded-lg border border-neutral-250 p-4 text-sm">
          <p className="font-medium">Target service</p>
          <div>
            <span>{serviceName}</span>
          </div>
        </div>

        {activeAlerts.length > 0 && (
          <div>
            <div className="overflow-hidden rounded-t-lg border border-neutral-250 bg-neutral-100 p-4 pb-5 text-sm">
              <p className="flex items-center gap-1.5 font-medium">
                <Icon iconName="circle-plus" iconStyle="regular" className="text-green-600" />
                Alerts included in creation ({activeAlerts.length})
              </p>
              <span className=" text-neutral-350">
                Alert we will automatically create and activate as soon as you confirm the creation
              </span>
            </div>
            <AlertsSummaryTable
              alerts={activeAlerts}
              onEdit={(localIndex) => handleEdit(activeAlertsWithIndex[localIndex].alert.id)}
              onToggleSkip={(localIndex) => handleToggleSkip(activeAlertsWithIndex[localIndex].originalIndex, false)}
              showExcludeButton
            />
          </div>
        )}

        {skippedAlerts.length > 0 && (
          <div>
            <div className="overflow-hidden rounded-t-lg border border-neutral-250 bg-neutral-100 p-4 pb-5 text-sm">
              <p className="flex items-center gap-1.5 font-medium">
                <Icon iconName="circle-minus" iconStyle="regular" className="text-red-600" />
                Alerts excluded from creation ({skippedAlerts.length})
              </p>
              <span className=" text-neutral-350">
                Alert we will automatically create and activate as soon as you confirm the creation
              </span>
            </div>
            <AlertsSummaryTable
              alerts={skippedAlerts}
              onEdit={(localIndex) => handleEdit(skippedAlertsWithIndex[localIndex].alert.id)}
              onToggleSkip={(localIndex) => handleToggleSkip(skippedAlertsWithIndex[localIndex].originalIndex, true)}
              showIncludeButton
            />
          </div>
        )}

        <div className="flex w-full justify-end">
          <Button size="lg" onClick={handleConfirm} disabled={isCreatingAlertRule} loading={isCreatingAlertRule}>
            Confirm and create
          </Button>
        </div>
      </Section>
    </FunnelFlowBody>
  )
}

export default SummaryStep
