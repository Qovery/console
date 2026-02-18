import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useNavigate } from '@tanstack/react-router'
import type { AlertRuleResponse, AlertRuleSource, AlertRuleState } from 'qovery-typescript-axios'
import { type PropsWithChildren, type ReactNode, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  APPLICATION_MONITORING_ALERTS_URL,
  APPLICATION_MONITORING_ALERT_EDIT_URL,
  APPLICATION_MONITORING_URL,
  APPLICATION_URL,
} from '@qovery/shared/routes'
import {
  Badge,
  Button,
  Chart,
  Checkbox,
  DropdownMenu,
  Icon,
  Link,
  TablePrimitives,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { useAlertRulesGhosted } from '../../hooks/use-alert-rules-ghosted/use-alert-rules-ghosted'
import { useAlertRules } from '../../hooks/use-alert-rules/use-alert-rules'
import { useDeleteAlertRule } from '../../hooks/use-delete-alert-rule/use-delete-alert-rule'
import { AlertRulesCloneModal } from '../alert-rules-clone-modal/alert-rules-clone-modal'
import { SeverityIndicator } from '../severity-indicator/severity-indicator'
import { AlertRulesActionBar } from './alert-rules-action-bar/alert-rules-action-bar'

const { Table } = TablePrimitives

function getStatusConfig(
  state: AlertRuleState,
  source: AlertRuleSource
): {
  label: string
  color: 'red' | 'yellow' | 'neutral' | 'green'
  icon: IconName
  tooltip?: ReactNode
} {
  if (source === 'GHOST') {
    return {
      label: 'Deleted',
      color: 'neutral' as const,
      icon: 'trash-can' as const,
    }
  }

  return match(state)
    .with('PENDING_NOTIFICATION', 'NOTIFIED', () => ({
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
    .with('UNDEPLOYED', () => ({
      label: 'Undeployed',
      color: 'neutral' as const,
      icon: 'circle-exclamation' as const,
      tooltip: 'Redeploy your cluster to activate this alert',
    }))
    .with('TRIGGERED', () => ({
      label: 'Triggered',
      color: 'yellow' as const,
      icon: 'bolt' as const,
      tooltip: 'Triggered by PromQL condition, but not firing because the required "for" duration has not yet elapsed',
    }))
    .otherwise(() => ({
      label: 'Monitoring',
      color: 'green' as const,
      icon: 'light-emergency' as const,
    }))
}

interface AlertRulesOverviewProps {
  organizationId: string
  service?: AnyService
  filter?: string
  onCreateKeyAlerts?: () => void
}

export function AlertRulesOverview({
  organizationId,
  service,
  filter,
  children,
  onCreateKeyAlerts,
}: PropsWithChildren<AlertRulesOverviewProps>) {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const navigate = useNavigate({ from: '/_authenticated/organization/$organizationId/alerts/alert-rules' })

  const { mutate: deleteAlertRule } = useDeleteAlertRule({ organizationId })

  const { data: alertRules = [], isFetched: isAlertRulesFetched } = useAlertRules({
    organizationId,
    serviceId: service?.id,
  })

  const { data: alertRulesGhosted = [], isFetched: isAlertRulesGhostedFetched } = useAlertRulesGhosted({
    organizationId,
    serviceId: service?.id,
  })

  const allAlertRules = [...alertRulesGhosted, ...alertRules]

  const filteredAlertRules = filter
    ? allAlertRules.filter((alertRule) => {
        const searchTerm = filter.toLowerCase()
        const statusConfig = getStatusConfig(alertRule.state, alertRule.source)
        return (
          alertRule.name.toLowerCase().includes(searchTerm) ||
          statusConfig.label.toLowerCase().includes(searchTerm) ||
          alertRule.target?.service?.name.toLowerCase().includes(searchTerm)
        )
      })
    : allAlertRules

  const [selectedAlertRuleIds, setSelectedAlertRuleIds] = useState<Set<string>>(new Set())

  const selectableAlertRules = useMemo(
    () => filteredAlertRules.filter((alertRule) => alertRule.source === 'MANAGED'),
    [filteredAlertRules]
  )

  const selectedAlertRules = useMemo(
    () =>
      filteredAlertRules.filter((alertRule) => {
        const alertRuleId = match(alertRule)
          .with({ source: 'MANAGED' }, (alertRule) => alertRule.id)
          .otherwise(() => '')
        return selectedAlertRuleIds.has(alertRuleId)
      }),
    [filteredAlertRules, selectedAlertRuleIds]
  )

  const isAllSelected = useMemo(
    () => selectableAlertRules.length > 0 && selectedAlertRuleIds.size === selectableAlertRules.length,
    [selectableAlertRules.length, selectedAlertRuleIds.size]
  )

  const isSomeSelected = useMemo(
    () => selectedAlertRuleIds.size > 0 && selectedAlertRuleIds.size < selectableAlertRules.length,
    [selectedAlertRuleIds.size, selectableAlertRules.length]
  )

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(selectableAlertRules.map((alertRule) => alertRule.id))
      setSelectedAlertRuleIds(allIds)
    } else {
      setSelectedAlertRuleIds(new Set())
    }
  }

  const toggleSelectAlertRule = (alertRuleId: string) => {
    setSelectedAlertRuleIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(alertRuleId)) {
        newSet.delete(alertRuleId)
      } else {
        newSet.add(alertRuleId)
      }
      return newSet
    })
  }

  const resetRowSelection = () => {
    setSelectedAlertRuleIds(new Set())
  }

  if (!isAlertRulesFetched || !isAlertRulesGhostedFetched)
    return (
      <div className="flex h-full w-full items-center justify-center p-5">
        <Chart.Loader />
      </div>
    )

  const editAlertRule = (projectId: string, environmentId: string, serviceId: string, alertRule: AlertRuleResponse) => {
    navigate({
      to:
        APPLICATION_URL(organizationId, projectId, environmentId, serviceId) +
        APPLICATION_MONITORING_URL +
        APPLICATION_MONITORING_ALERT_EDIT_URL(alertRule.id),
    })
  }

  const deleteAlertRuleModal = (alertRule: AlertRuleResponse) => {
    openModalConfirmation({
      title: 'Confirm delete alert rule',
      description: 'To confirm the deletion of your alert rule, please type the name:',
      confirmationMethod: 'action',
      confirmationAction: 'delete',
      name: alertRule.name,
      action: () => deleteAlertRule({ alertRuleId: alertRule.id }),
    })
  }

  const cloneAlertRule = (alertRule: AlertRuleResponse) => {
    openModal({
      content: <AlertRulesCloneModal organizationId={organizationId} alertRule={alertRule} onClose={closeModal} />,
      options: {
        fakeModal: true,
      },
    })
  }

  const findAlertRuleNotDeployed = filteredAlertRules.find((alertRule) =>
    match(alertRule)
      .with({ source: 'MANAGED' }, (alertRule) => alertRule.state === 'UNDEPLOYED' || alertRule.is_up_to_date === false)
      .with({ source: 'GHOST' }, () => true)
      .otherwise(() => false)
  )

  return filteredAlertRules.length === 0 ? (
    <div className="flex flex-col items-center justify-center overflow-hidden rounded-md border border-neutral bg-surface-neutral p-10 text-center">
      <Icon iconName="light-emergency" iconStyle="regular" className="mb-2.5 text-xl text-neutral-subtle" />
      <p className="font-medium text-neutral">
        {service ? 'No alerts created for this service' : 'No alerts created for this organization'}
      </p>
      <p className="mb-3 text-sm text-neutral-subtle">
        {service ? (
          <>
            Define baseline alerts for key metrics like CPU, memory, latency, <br /> and error rate that will help you
            keep your service under control.
          </>
        ) : (
          'Create alerts at the service level to monitor your infrastructure.'
        )}
      </p>
      {onCreateKeyAlerts && (
        <Button size="md" className="gap-1.5" onClick={onCreateKeyAlerts}>
          <Icon iconName="plus-large" className="text-xs" />
          New alert
        </Button>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-6">
      {findAlertRuleNotDeployed && children}

      <Table.Root className="divide-y divide-neutral">
        <Table.Header>
          <Table.Row className="font-code text-xs">
            <Table.ColumnHeaderCell className="h-9 w-12">
              <div className="flex h-5 items-center">
                <Checkbox
                  checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                  onCheckedChange={(checked) => {
                    if (checked === 'indeterminate') return
                    toggleSelectAll(checked)
                  }}
                />
              </div>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="h-9 pl-0 font-normal text-neutral-subtle">
              Alert name
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="h-9 border-l border-neutral font-normal text-neutral-subtle">
              Status
            </Table.ColumnHeaderCell>
            {!service && (
              <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-subtle">Target</Table.ColumnHeaderCell>
            )}
            <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-subtle">Severity</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="h-9 text-right font-normal text-neutral-subtle">
              Actions
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body className="divide-y divide-neutral">
          {filteredAlertRules.map((alertRule, index) => {
            const statusConfig = getStatusConfig(alertRule.state, alertRule.source)
            const isMuted = match(alertRule)
              .with({ source: 'MANAGED' }, (alertRule) => !alertRule.enabled)
              .with({ source: 'GHOST' }, () => false)
              .otherwise(() => false)

            const alertRuleId = match(alertRule)
              .with({ source: 'MANAGED' }, (alertRule) => alertRule.id)
              .otherwise(() => '')
            const isSelectable = alertRule.source === 'MANAGED'
            const isSelected = selectedAlertRuleIds.has(alertRuleId)

            return (
              <Table.Row
                key={match(alertRule)
                  .with({ source: 'MANAGED' }, (alertRule) => alertRule.id)
                  .with({ source: 'GHOST' }, () => index)
                  .exhaustive()}
              >
                <Table.Cell className="h-16 w-12">
                  {isSelectable && (
                    <div className="flex h-full items-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked === 'indeterminate') return
                          toggleSelectAlertRule(alertRuleId)
                        }}
                      />
                    </div>
                  )}
                </Table.Cell>
                <Table.RowHeaderCell className="pl-0">
                  <div className="flex min-w-0 items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-neutral">{alertRule.name}</p>
                      <p className="truncate text-ssm font-normal text-neutral-subtle">
                        {match(alertRule)
                          .with({ source: 'MANAGED' }, (alertRule) => alertRule.description)
                          .with(
                            { source: 'GHOST' },
                            () => 'You need to redeploy your cluster to apply this deleted alert rule'
                          )
                          .exhaustive()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center">
                      {match(alertRule)
                        .with(
                          { source: 'MANAGED' },
                          (alertRule) => !alertRule.is_up_to_date && alertRule.state !== 'UNDEPLOYED'
                        )
                        .with({ source: 'GHOST' }, () => false)
                        .otherwise(() => false) && (
                        <Tooltip content="To apply this change redeploy your cluster">
                          <span>
                            <Icon iconName="circle-exclamation" className="text-yellow-700" />
                          </span>
                        </Tooltip>
                      )}
                      {isMuted && (
                        <Tooltip content="Alert is muted">
                          <Icon
                            iconName="bell-slash"
                            iconStyle="regular"
                            className="ml-2 text-xs text-neutral-subtle"
                          />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </Table.RowHeaderCell>
                <Table.Cell className="h-16 border-l border-neutral">
                  <Tooltip content={statusConfig.tooltip} disabled={!statusConfig.tooltip}>
                    <Badge
                      color={statusConfig.color}
                      variant="surface"
                      radius="full"
                      className="gap-1 truncate font-medium"
                      size="sm"
                    >
                      <Icon iconName={statusConfig.icon} iconStyle="regular" className="text-xs" />
                      {statusConfig.label}
                    </Badge>
                  </Tooltip>
                </Table.Cell>
                {!service && (
                  <Table.Cell className="h-16">
                    <Link
                      as="button"
                      radius="full"
                      variant="surface"
                      color="neutral"
                      size="xs"
                      className="justify-center gap-1.5 pl-0.5"
                      to={
                        APPLICATION_URL(
                          organizationId,
                          alertRule.target?.service?.project_id,
                          alertRule.target?.service?.environment_id,
                          alertRule.target?.service?.id
                        ) +
                        APPLICATION_MONITORING_URL +
                        APPLICATION_MONITORING_ALERTS_URL
                      }
                    >
                      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-surface-neutral-subtle">
                        <Icon
                          name={match(alertRule.target?.target_type)
                            .with('CONTAINER', () => 'APPLICATION')
                            .otherwise((s) => s)}
                          iconStyle="regular"
                          width={13}
                        />
                      </span>
                      {alertRule.target?.service?.name}
                    </Link>
                  </Table.Cell>
                )}
                <Table.Cell className="h-16">
                  <>
                    {match(alertRule)
                      .with({ source: 'MANAGED' }, (alertRule) => <SeverityIndicator severity={alertRule.severity} />)
                      .with({ source: 'GHOST' }, () => '')
                      .exhaustive()}
                  </>
                </Table.Cell>
                <Table.Cell className="h-16">
                  {match(alertRule)
                    .with({ source: 'MANAGED' }, (alertRule) => (
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip content="Edit">
                          <Button
                            variant="outline"
                            color="neutral"
                            size="xs"
                            className="w-6 justify-center"
                            onClick={() =>
                              editAlertRule(
                                alertRule.target.service?.project_id ?? '',
                                alertRule.target.service?.environment_id ?? '',
                                alertRule.target.service?.id ?? '',
                                alertRule
                              )
                            }
                          >
                            <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete alert rule">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <Button variant="outline" color="neutral" size="xs" className="w-6 justify-center">
                                <Icon iconName="ellipsis" iconStyle="regular" className="text-xs" />
                              </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content className="mr-14 w-40">
                              <DropdownMenu.Item
                                icon={<Icon iconName="clone" />}
                                onSelect={() => cloneAlertRule(alertRule)}
                              >
                                Clone
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                color="red"
                                icon={<Icon iconName="trash-can" iconStyle="regular" />}
                                onSelect={() => deleteAlertRuleModal(alertRule)}
                              >
                                Delete
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                        </Tooltip>
                      </div>
                    ))
                    .with({ source: 'GHOST' }, () => '')
                    .exhaustive()}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
      <AlertRulesActionBar
        selectedAlertRules={selectedAlertRules.filter((rule) => rule.source === 'MANAGED')}
        resetRowSelection={resetRowSelection}
        organizationId={organizationId}
      />
    </div>
  )
}

export default AlertRulesOverview
