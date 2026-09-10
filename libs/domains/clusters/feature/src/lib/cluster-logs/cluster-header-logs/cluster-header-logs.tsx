import download from 'downloadjs'
import posthog from 'posthog-js'
import {
  type Cluster,
  type ClusterLogs,
  type ClusterStatus,
  type DeploymentHistoryActionStatus,
} from 'qovery-typescript-axios'
import { type RefObject, useContext } from 'react'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/feature'
import { Button, Icon, Tooltip, Truncate } from '@qovery/shared/ui'
import { dateDifference, dateFullFormat, dateUTCString, formatDuration } from '@qovery/shared/util-dates'
import { useIntervalTick } from '@qovery/shared/util-hooks'
import { trimId } from '@qovery/shared/util-js'

export interface ClusterHeaderLogsProps {
  cluster: Cluster
  clusterStatus: ClusterStatus
  refScrollSection: RefObject<HTMLDivElement>
  data: ClusterLogs[]
  executionId?: string
  onBack?: () => void
  createdAt?: string
  triggeredBy?: string | null
  actionStatus?: DeploymentHistoryActionStatus
  totalDuration?: string | null
}

export function ClusterHeaderLogs({
  cluster,
  clusterStatus,
  refScrollSection,
  data,
  executionId,
  onBack,
  createdAt,
  triggeredBy,
  actionStatus,
  totalDuration,
}: ClusterHeaderLogsProps) {
  const { setDevopsCopilotOpen, sendMessageRef } = useContext(DevopsCopilotContext)

  const isDeploymentOngoing =
    (actionStatus === 'ONGOING' || actionStatus === 'CANCELING' || actionStatus === 'EXECUTING') && Boolean(createdAt)
  useIntervalTick(isDeploymentOngoing)

  const hasDeploymentError = [
    'BUILD_ERROR',
    'DELETE_ERROR',
    'DEPLOYMENT_ERROR',
    'STOP_ERROR',
    'RESTART_ERROR',
    'INVALID_CREDENTIALS',
  ].includes(clusterStatus.status ?? '')

  const downloadJSON = () => {
    download(JSON.stringify(data), `data-${Date.now()}.json`, 'text/json;charset=utf-8')
  }

  const forcedScroll = (down?: boolean) => {
    const section = refScrollSection.current
    if (!section) return

    if (down) {
      section.scroll(0, section.scrollHeight)
    } else {
      section.scroll(0, 0)
    }
  }

  const lastExecutionId = executionId ?? clusterStatus.last_execution_id ?? ''

  return (
    <div className="flex w-full items-center justify-between gap-2 pl-5 pr-3 text-sm">
      <div className="flex items-center gap-2">
        {onBack && (
          <Button onClick={onBack} variant="plain" iconOnly>
            <Icon className="text-base" iconName="arrow-left" iconStyle="regular" />
          </Button>
        )}
        {createdAt && (
          <>
            <span
              className="flex items-center gap-1.5 truncate whitespace-nowrap font-normal text-neutral"
              title={dateUTCString(createdAt)}
            >
              <Icon iconName="calendar" iconStyle="regular" className="text-sm text-neutral-subtle" />
              {dateFullFormat(createdAt, undefined, 'dd MMM, HH:mm')}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
              <circle cx="2.5" cy="2.955" r="2.5" fill="var(--neutral-6)"></circle>
            </svg>
          </>
        )}
        {(isDeploymentOngoing || totalDuration) && (
          <>
            <span className="flex items-center gap-1.5 whitespace-nowrap font-normal text-neutral">
              <Icon iconName="stopwatch" iconStyle="regular" className="text-sm text-neutral-subtle" />
              {isDeploymentOngoing && createdAt
                ? dateDifference(new Date(), new Date(createdAt))
                : formatDuration(totalDuration ?? '')}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
              <circle cx="2.5" cy="2.955" r="2.5" fill="var(--neutral-6)"></circle>
            </svg>
          </>
        )}
        <Tooltip side="bottom" content={<span>Execution id: {lastExecutionId}</span>}>
          <span className="flex items-center gap-1 truncate">
            <Icon iconName="code" iconStyle="regular" className="text-sm text-neutral-subtle" />
            <span className="truncate font-normal text-neutral">{trimId(lastExecutionId)}</span>
          </span>
        </Tooltip>
        <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
          <circle cx="2.5" cy="2.955" r="2.5" fill="var(--neutral-6)"></circle>
        </svg>
        <Tooltip
          side="bottom"
          content={
            <span>
              Cluster version: {cluster.version} <br />
              Cluster ID: {cluster.id}
            </span>
          }
        >
          <span className="whitespace-nowrap font-normal text-neutral">{cluster.version}</span>
        </Tooltip>
        {triggeredBy && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="5" height="6" fill="none" viewBox="0 0 5 6">
              <circle cx="2.5" cy="2.955" r="2.5" fill="var(--neutral-6)"></circle>
            </svg>
            <span className="flex items-center gap-1.5 truncate whitespace-nowrap font-normal text-neutral">
              <Icon iconName="user" iconStyle="regular" className="text-sm text-neutral-subtle" />
              <Truncate text={triggeredBy} truncateLimit={25} />
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {hasDeploymentError && (
          <Button
            color="brand"
            variant="surface"
            onClick={() => {
              posthog.capture('ai-copilot-troubleshoot-triggered', {
                source: 'cluster-logs',
                troubleshoot_type: 'cluster',
                cluster_id: cluster.id,
              })
              const message = `Why did my cluster deployment fail? (cluster id: ${cluster.id})`
              setDevopsCopilotOpen(true)
              sendMessageRef?.current?.(message)
            }}
          >
            <Icon iconName="sparkles" iconStyle="solid" />
            Launch diagnostic for this error
          </Button>
        )}
        <div className="flex items-center gap-0">
          <Button
            data-testid="scroll-up-button"
            className="rounded-br-none rounded-tr-none border-r-0"
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            iconOnly
            onClick={() => forcedScroll()}
          >
            <Icon iconName="arrow-up-to-line" />
          </Button>
          <Button
            data-testid="scroll-down-button"
            className="rounded-bl-none rounded-tl-none"
            variant="outline"
            type="button"
            color="neutral"
            size="sm"
            iconOnly
            onClick={() => forcedScroll(true)}
          >
            <Icon iconName="arrow-down-to-line" />
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="sm"
          className="mr-1"
          iconOnly
          onClick={() => downloadJSON()}
        >
          <Icon iconName="cloud-arrow-down" />
        </Button>
      </div>
    </div>
  )
}

export default ClusterHeaderLogs
