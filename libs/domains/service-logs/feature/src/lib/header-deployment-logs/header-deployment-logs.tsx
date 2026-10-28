import { useParams, useRouter } from '@tanstack/react-router'
import { type Status } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { match } from 'ts-pattern'
import {
  Badge,
  Button,
  CopyToClipboardButtonIcon,
  DeploymentAction,
  Icon,
  StatusChip,
  Tooltip,
  getTriggerAction,
} from '@qovery/shared/ui'
import { useIntervalTick } from '@qovery/shared/util-hooks'
import { trimId } from '@qovery/shared/util-js'
import { getOngoingDeploymentComputingDurationSec } from '../header-logs/header-logs'
import { hasLiveServiceStepComputingDuration } from '../service-step-metrics'

export interface HeaderDeploymentLogsProps extends PropsWithChildren {
  serviceStatus: Status | null
}

// `3:58` reads `03:58`, and `1:02:05` past an hour
export function formatDeploymentDurationClock(durationSec: number) {
  const hours = Math.floor(durationSec / 3600)
  const minutes = Math.floor((durationSec % 3600) / 60)
  const seconds = Math.floor(durationSec % 60)
  const pad = (value: number) => value.toString().padStart(2, '0')

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

export function HeaderDeploymentLogs({ serviceStatus, children }: HeaderDeploymentLogsProps) {
  const router = useRouter()
  const { executionId = '' } = useParams({ strict: false })

  const triggerAction = getTriggerAction(serviceStatus?.status_details)
  const actionStatus = serviceStatus?.status_details?.status

  const isOngoing = match(actionStatus)
    .with('ONGOING', 'CANCELING', () => true)
    .otherwise(() => false)
  const hasLiveComputingDuration = hasLiveServiceStepComputingDuration(serviceStatus?.steps?.details ?? [])

  useIntervalTick(isOngoing && hasLiveComputingDuration)

  const computingDurationSec = isOngoing
    ? getOngoingDeploymentComputingDurationSec(serviceStatus, Date.now())
    : serviceStatus?.steps?.total_computing_duration_sec ?? 0

  return (
    <div className="flex h-12 w-full shrink-0 items-center justify-between border-b border-neutral bg-background px-4">
      <div className="flex h-full items-center gap-4">
        <div className="flex items-center gap-1">
          <Button onClick={() => router.history.back()} variant="plain" iconOnly aria-label="Back">
            <Icon className="text-base" iconName="arrow-left" iconStyle="regular" />
          </Button>
          <div className="flex items-center gap-2">
            <DeploymentAction status={triggerAction} iconClassName="hidden" textClassName="text-base font-medium" />
            <StatusChip status={actionStatus} className="h-4 w-4" />
          </div>
        </div>
        <span className="h-full border-l border-neutral" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <Tooltip content="Deployment duration">
            <Badge className="gap-1 text-ssm text-neutral-subtle">
              <Icon iconName="stopwatch" iconStyle="regular" />
              <span>{formatDeploymentDurationClock(computingDurationSec)}</span>
            </Badge>
          </Tooltip>
          {executionId && (
            <Badge className="gap-1 text-ssm text-neutral-subtle">
              <Icon iconName="code" iconStyle="regular" />
              <Tooltip content={`Execution id: ${executionId}`}>
                <span>{trimId(executionId)}</span>
              </Tooltip>
              <CopyToClipboardButtonIcon content={executionId} tooltipContent="Copy execution id" />
            </Badge>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default HeaderDeploymentLogs
