import type { AlertRuleResponse, AlertRuleState } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import {
  APPLICATION_MONITORING_ALERT_EDIT_URL,
  APPLICATION_MONITORING_URL,
  APPLICATION_URL,
} from '@qovery/shared/routes'
import {
  Badge,
  Button,
  Heading,
  Icon,
  Section,
  TablePrimitives,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { CreateKeyAlertsModal } from '../../alerting-creation-flow/create-key-alerts-modal/create-key-alerts-modal'
import { useAlertRules } from '../../hooks/use-alert-rules/use-alert-rules'
import { useDeleteAlertRule } from '../../hooks/use-delete-alert-rule/use-delete-alert-rule'
import { useEnvironment } from '../../hooks/use-environment/use-environment'
import { SeverityIndicator } from './severity-indicator/severity-indicator'

const { Table } = TablePrimitives

function getStatusConfig(state: AlertRuleState) {
  return match(state)
    .with('TRIGGERED', 'PENDING_NOTIFICATION', 'NOTIFIED', () => ({
      label: 'Firing',
      color: 'red' as const,
      icon: 'fire' as const,
    }))
    .with('SUPPRESSED', () => ({
      label: 'Suppressed',
      color: 'yellow' as const,
      icon: 'bell-slash' as const,
    }))
    .with('UNROUTED', () => ({
      label: 'Unrouted',
      color: 'neutral' as const,
      icon: 'triangle-exclamation' as const,
    }))
    .otherwise(() => ({
      label: 'Monitoring',
      color: 'green' as const,
      icon: 'light-emergency' as const,
    }))
}

export function ServiceAlerting() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const navigate = useNavigate()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { mutate: deleteAlertRule } = useDeleteAlertRule({ organizationId: environment?.organization.id ?? '' })

  const { data: alertRules = [], isFetched: isAlertRulesFetched } = useAlertRules({
    organizationId: environment?.organization.id ?? '',
    serviceId: applicationId,
  })

  if (!environment || !isAlertRulesFetched) return null

  const createKeyAlertsModal = () => {
    openModal({
      content: (
        <CreateKeyAlertsModal
          onClose={closeModal}
          service={service}
          organizationId={environment.organization.id}
          projectId={environment.project.id}
        />
      ),
      options: {
        width: 488,
      },
    })
  }

  const editAlertRule = (alertRule: AlertRuleResponse) => {
    navigate(
      APPLICATION_URL(organizationId, projectId, environmentId, applicationId) +
        APPLICATION_MONITORING_URL +
        APPLICATION_MONITORING_ALERT_EDIT_URL(alertRule.id)
    )
  }

  const deleteAlertRuleModal = (alertRule: AlertRuleResponse) => {
    openModalConfirmation({
      title: 'Confirm delete alert rule',
      description: 'To confirm the deletion of your alert rule, please type the name:',
      confirmationMethod: 'action',
      confirmationAction: 'Delete',
      name: alertRule.name,
      action: () => deleteAlertRule({ alertRuleId: alertRule.id }),
    })
  }

  return (
    <Section className="w-full px-8 py-6">
      <div className="border-b border-neutral-250">
        <div className="flex w-full items-center justify-between pb-5">
          <Heading level={1}>Alerts</Heading>
          <Button variant="outline" color="neutral" size="md" className="gap-1.5" onClick={createKeyAlertsModal}>
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
          <Button size="md" className="gap-1.5" onClick={createKeyAlertsModal}>
            <Icon iconName="plus-large" iconStyle="regular" className="text-xs" />
            Create key alerts
          </Button>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-md border border-neutral-250">
          <Table.Root className="divide-y divide-neutral-250">
            <Table.Header>
              <Table.Row className="font-code text-xs">
                <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">Severity</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="h-9 text-right font-normal text-neutral-350">
                  Actions
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body className="divide-y divide-neutral-250">
              {alertRules?.map((alertRule) => {
                const statusConfig = getStatusConfig(alertRule.state)
                const isMuted = !alertRule.enabled

                return (
                  <Table.Row key={alertRule.id}>
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
                    <Table.Cell className="h-11">
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
                    <Table.Cell className="h-11">
                      <SeverityIndicator severity={alertRule.severity} />
                    </Table.Cell>
                    <Table.Cell className="h-11">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip content="Edit">
                          <Button
                            variant="outline"
                            color="neutral"
                            size="xs"
                            className="w-6 justify-center"
                            onClick={() => editAlertRule(alertRule)}
                          >
                            <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete alert rule">
                          <Button
                            variant="outline"
                            color="neutral"
                            size="xs"
                            className="w-6 justify-center"
                            onClick={() => deleteAlertRuleModal(alertRule)}
                          >
                            <Icon iconName="trash-can" iconStyle="regular" className="text-xs" />
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
