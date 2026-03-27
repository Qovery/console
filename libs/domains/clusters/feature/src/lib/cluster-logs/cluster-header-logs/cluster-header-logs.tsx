import download from 'downloadjs'
import { type Cluster, type ClusterLogs, type ClusterStatus } from 'qovery-typescript-axios'
import { type RefObject } from 'react'
import { Badge, Button, Icon, Tooltip } from '@qovery/shared/ui'
import { trimId } from '@qovery/shared/util-js'

export interface ClusterHeaderLogsProps {
  cluster: Cluster
  clusterStatus: ClusterStatus
  refScrollSection: RefObject<HTMLDivElement>
  data: ClusterLogs[]
}

export function ClusterHeaderLogs({ cluster, clusterStatus, refScrollSection, data }: ClusterHeaderLogsProps) {
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
          <Badge variant="surface" className="max-w-full whitespace-nowrap">
            {cluster.version}
          </Badge>
        </Tooltip>
        <Tooltip side="bottom" content={<span>Execution id: {lastExecutionId}</span>}>
          <span className="flex items-center gap-1.5 truncate">
            <Icon iconName="code" iconStyle="regular" className="text-base text-neutral-subtle" />
            <span className="font-normal text-neutral">{trimId(lastExecutionId)}</span>
          </span>
        </Tooltip>
      </div>
      <div>
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
          className="mr-2 rounded-bl-none rounded-tl-none"
          variant="outline"
          type="button"
          color="neutral"
          size="sm"
          iconOnly
          onClick={() => forcedScroll(true)}
        >
          <Icon iconName="arrow-down-to-line" />
        </Button>
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
