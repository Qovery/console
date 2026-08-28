import download from 'downloadjs'
import posthog from 'posthog-js'
import { type Cluster, type ClusterLogs, type ClusterStatus } from 'qovery-typescript-axios'
import { type RefObject, useContext } from 'react'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/feature'
import { Badge, Button, CopyToClipboardButtonIcon, Icon, Tooltip } from '@qovery/shared/ui'
import { trimId } from '@qovery/shared/util-js'

export interface ClusterHeaderLogsProps {
  cluster: Cluster
  clusterStatus: ClusterStatus
  refScrollSection: RefObject<HTMLDivElement>
  data: ClusterLogs[]
}

export function ClusterHeaderLogs({ cluster, clusterStatus, refScrollSection, data }: ClusterHeaderLogsProps) {
  const { setDevopsCopilotOpen, sendMessageRef } = useContext(DevopsCopilotContext)

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

  const lastExecutionId = clusterStatus.last_execution_id ?? ''

  return (
    <div className="flex w-full items-center justify-between gap-2 pl-5 pr-3 text-sm">
      <div className="flex items-center gap-2">
        <Tooltip
          side="bottom"
          content={
            <span>
              Cluster version: {cluster.version} <br />
              Cluster ID: {cluster.id}
            </span>
          }
        >
          <Badge variant="surface" className="max-w-full whitespace-nowrap text-sm">
            {cluster.version}
          </Badge>
        </Tooltip>
        <Tooltip side="bottom" content={<span>Execution id: {lastExecutionId}</span>}>
          <span className="group flex items-center gap-1 truncate">
            <Icon iconName="code" iconStyle="regular" className="text-sm text-neutral-subtle" />
            <span className="flex items-center gap-0.5 truncate">
              <span className="font-normal text-neutral">{trimId(lastExecutionId)}</span>
              {lastExecutionId && (
                <CopyToClipboardButtonIcon
                  content={lastExecutionId}
                  tooltipContent="Copy execution id"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  iconClassName="text-xs"
                />
              )}
            </span>
          </span>
        </Tooltip>
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
