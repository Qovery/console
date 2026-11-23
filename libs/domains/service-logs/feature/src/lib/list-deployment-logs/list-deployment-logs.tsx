import { Link, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import {
  type DeploymentHistoryEnvironmentV2,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
  type Stage,
  type Status,
} from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { Button, CopyToClipboardButtonIcon, DropdownMenu, Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import { trimId } from '@qovery/shared/util-js'
import { DeploymentLogsSteps } from '../deployment-logs-steps/deployment-logs-steps'
import { HeaderDeploymentLogs } from '../header-deployment-logs/header-deployment-logs'
import { useServiceDeploymentHistory } from '../hooks/use-service-deployment-history/use-service-deployment-history'

export interface ListDeploymentLogsProps {
  environment: Environment
  serviceStatus: Status
  stage?: Stage
  environmentStatus?: EnvironmentStatus
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
}

interface DeploymentHistoryDropdownProps {
  environment: Environment
  deploymentHistory: DeploymentHistoryEnvironmentV2[]
}

function DeploymentHistoryDropdown({ environment, deploymentHistory }: DeploymentHistoryDropdownProps) {
  const { organizationId = '', projectId = '', serviceId = '', executionId = '' } = useParams({ strict: false })
  const [open, setOpen] = useState(false)

  const currentDeploymentHistory = useMemo(
    () => deploymentHistory.find((deployment) => deployment.identifier.execution_id === executionId),
    [deploymentHistory, executionId]
  )

  const selectedDeploymentHistory = executionId ? currentDeploymentHistory : deploymentHistory[0]
  const selectedDeploymentDate = selectedDeploymentHistory?.auditing_data.created_at
  const isLastVersion = deploymentHistory[0]?.identifier.execution_id === executionId || !executionId

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline">
            <Icon iconName="clock-rotate-left" className="text-neutral-subtle" />
            {isLastVersion
              ? 'Latest'
              : selectedDeploymentDate
                ? dateYearMonthDayHourMinuteSecond(new Date(selectedDeploymentDate))
                : 'Not available'}
            <Icon iconName="angle-down" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="z-dropdown max-h-96 w-80 overflow-y-auto">
          {deploymentHistory.map((deployment) => (
            <DropdownMenu.Item
              asChild
              key={deployment.identifier.execution_id}
              className={clsx('min-h-9', {
                'bg-surface-brand-component': deployment.identifier.execution_id === executionId,
              })}
            >
              <Link
                className="flex w-full justify-between"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
                params={{
                  organizationId,
                  projectId,
                  environmentId: environment.id,
                  serviceId,
                  executionId: deployment.identifier.execution_id,
                }}
                replace={true}
              >
                <Tooltip content={deployment.identifier.execution_id}>
                  <span className="group flex items-center gap-0.5 truncate">
                    <span>{trimId(deployment.identifier.execution_id ?? '')}</span>
                    {deployment.identifier.execution_id && (
                      <CopyToClipboardButtonIcon
                        content={deployment.identifier.execution_id}
                        tooltipContent="Copy execution id"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        iconClassName="text-xs"
                      />
                    )}
                  </span>
                </Tooltip>
                <span className="flex items-center gap-2.5 text-xs text-neutral-subtle">
                  {dateYearMonthDayHourMinuteSecond(new Date(deployment.auditing_data.created_at))}
                  <StatusChip status={deployment.status} />
                </span>
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

export function ListDeploymentLogs({
  environment,
  environmentStatus,
  serviceStatus,
  stage,
  preCheckStage,
}: ListDeploymentLogsProps) {
  const { executionId = '', serviceId = '' } = useParams({ strict: false })
  const { data: deploymentHistory = [] } = useServiceDeploymentHistory({
    environmentId: environment.id,
    serviceId,
    suspense: true,
  })
  const deployment = executionId
    ? deploymentHistory.find((deployment) => deployment.identifier.execution_id === executionId)
    : deploymentHistory[0]

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      <HeaderDeploymentLogs serviceStatus={serviceStatus} deploymentDate={deployment?.auditing_data.created_at}>
        <DeploymentHistoryDropdown environment={environment} deploymentHistory={deploymentHistory} />
      </HeaderDeploymentLogs>
      <DeploymentLogsSteps
        key={executionId || 'latest'}
        environment={environment}
        serviceStatus={serviceStatus}
        stage={stage}
        environmentStatus={environmentStatus}
        preCheckStage={preCheckStage}
        deploymentHistory={deploymentHistory}
      />
    </div>
  )
}

export default ListDeploymentLogs
