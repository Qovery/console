import { type AlertTargetType } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useService } from '@qovery/domains/services/feature'
import { Button, FunnelFlowBody, Heading, Icon, Section, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { useCreateAlertRule } from '../../../hooks/use-create-alert-rule/use-create-alert-rule'
import { SeverityIndicator } from '../../severity-indicator/severity-indicator'
import { useAlertingCreationFlowContext } from '../alerting-creation-flow'
import { type AlertConfiguration } from '../alerting-creation-flow.types'
import { ALERTING_CREATION_EDIT, ALERTING_CREATION_METRIC } from '../router'
import {
  QUERY_CPU,
  QUERY_HTTP_ERROR,
  QUERY_HTTP_LATENCY,
  QUERY_INSTANCE_RESTART,
  QUERY_MEMORY,
  QUERY_REPLICAS_NUMBER,
} from './alert-queries'

const { Table } = TablePrimitives

interface AlertsSummaryTableProps {
  alerts: AlertConfiguration[]
  onEdit?: (index: number) => void
  onToggleSkip?: (index: number) => void
  showExcludeButton?: boolean
  showIncludeButton?: boolean
}

// XXX: Not used for now but will be used in the future with flow bulk improvements
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
                  <span className="truncate text-sm text-neutral-400">{alert.name}</span>
                </div>
              </Table.RowHeaderCell>
              <Table.Cell className="h-11">{alert.tag.replace(/_/g, ' ')}</Table.Cell>
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

export function SummaryStep() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { organizationId = '', applicationId = '' } = useParams()

  const { data: service } = useService({ serviceId: applicationId })
  const { data: environment } = useEnvironment({ environmentId: service?.environment.id })
  const { mutateAsync: createAlertRule } = useCreateAlertRule({ organizationId })

  const [isCreatingAlertRule, setIsCreatingAlertRule] = useState(false)

  const {
    serviceName,
    currentStepIndex,
    setCurrentStepIndex,
    alerts,
    setAlerts,
    onComplete,
    selectedMetrics,
    containerName,
    ingressName,
  } = useAlertingCreationFlowContext()

  useEffect(() => {
    setCurrentStepIndex(selectedMetrics.length)
  }, [selectedMetrics.length, setCurrentStepIndex])

  const handleEdit = (alertId: string) => {
    navigate(`..${ALERTING_CREATION_EDIT(alertId)}`)
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

    if (!service || !environment || !containerName || !ingressName) return

    try {
      setIsCreatingAlertRule(true)
      for (const alert of activeAlerts) {
        const threshold = (alert.condition.threshold ?? 0) / 100
        const operator = alert.condition.operator ?? 'ABOVE'
        const func = alert.condition.function ?? 'NONE'

        await createAlertRule({
          payload: {
            organization_id: organizationId,
            cluster_id: environment.cluster_id,
            target: {
              target_id: service.id,
              target_type: service.serviceType as AlertTargetType,
            },
            name: alert.name,
            tag: alert.tag,
            description: alert.tag,
            condition: {
              kind: 'BUILT',
              function: func,
              operator,
              threshold,
              promql: match(alert.tag)
                .with('cpu', () => QUERY_CPU(containerName))
                .with('memory', () => QUERY_MEMORY(containerName))
                .with('replicas_number', () => QUERY_REPLICAS_NUMBER(containerName))
                .with('instance_restart', () => QUERY_INSTANCE_RESTART(containerName))
                .with('http_error', () => QUERY_HTTP_ERROR(ingressName))
                .with('http_latency', () => QUERY_HTTP_LATENCY(ingressName))
                .otherwise(() => ''),
            },
            for_duration: alert.for_duration,
            severity: alert.severity,
            enabled: true,
            alert_receiver_ids: alert.alert_receiver_ids,
            presentation: {
              summary: alert.presentation.summary ?? undefined,
            },
          },
        })
        onComplete(activeAlerts)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreatingAlertRule(false)
    }
  }

  const handlePrevious = () => {
    const basePath = location.pathname.replace(/\/summary$/, '')
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : ''
    navigate(`${basePath}${ALERTING_CREATION_METRIC(selectedMetrics[currentStepIndex - 1])}${queryString}`)
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
    <FunnelFlowBody customContentWidth="max-w-[52rem]">
      <Section className="flex flex-col gap-4">
        <Heading>Summary</Heading>

        <div className="flex justify-between rounded-lg border border-neutral-250 p-4 text-sm">
          <p className="font-medium">Target service</p>
          <div>
            <span>{serviceName}</span>
          </div>
        </div>

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
          {activeAlerts.length > 0 ? (
            <AlertsSummaryTable
              alerts={activeAlerts}
              onEdit={(localIndex) => handleEdit(activeAlertsWithIndex[localIndex].alert.id)}
              onToggleSkip={(localIndex) => handleToggleSkip(activeAlertsWithIndex[localIndex].originalIndex, false)}
              showExcludeButton
            />
          ) : (
            <div className="-mt-2 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border border-neutral-250 bg-white p-8 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-neutral-250 p-2">
                <Icon iconName="bell-slash" iconStyle="regular" className="text-base" />
              </div>
              <p className="text-center text-neutral-350">
                <span className="mb-1 block font-medium text-neutral-800">
                  No alerts included in creation
                  <br />
                </span>
                All alerts were skipped during setup <br />
                You can include some below or return to the monitoring dashboard
              </p>
            </div>
          )}
        </div>

        {skippedAlerts.length > 0 && (
          <div>
            <div className="overflow-hidden rounded-t-lg border border-neutral-250 bg-neutral-100 p-4 pb-5 text-sm">
              <p className="flex items-center gap-1.5 font-medium">
                <Icon iconName="circle-minus" iconStyle="regular" className="text-red-600" />
                Alerts excluded from creation ({skippedAlerts.length})
              </p>
              <span className=" text-neutral-350">These alerts were skipped during setup and won't be created</span>
            </div>
            <AlertsSummaryTable
              alerts={skippedAlerts}
              onEdit={(localIndex) => handleEdit(skippedAlertsWithIndex[localIndex].alert.id)}
              onToggleSkip={(localIndex) => handleToggleSkip(skippedAlertsWithIndex[localIndex].originalIndex, true)}
              showIncludeButton
            />
          </div>
        )}

        <div className="flex w-full justify-between gap-2">
          <Button type="button" variant="plain" color="neutral" size="lg" onClick={handlePrevious}>
            Previous
          </Button>
          <Button size="lg" onClick={handleConfirm} disabled={activeAlerts.length === 0} loading={isCreatingAlertRule}>
            Confirm and create
          </Button>
        </div>
      </Section>
    </FunnelFlowBody>
  )
}

export default SummaryStep
