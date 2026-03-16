import download from 'downloadjs'
import { type ClusterLogs } from 'qovery-typescript-axios'
import { type RefObject } from 'react'
import { Button, Icon } from '@qovery/shared/ui'

export interface ClusterHeaderLogsProps {
  refScrollSection: RefObject<HTMLDivElement>
  data: ClusterLogs[]
}

export function ClusterHeaderLogs(props: ClusterHeaderLogsProps) {
  const { refScrollSection, data } = props

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

  return (
    <>
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
    </>
  )
}

export default ClusterHeaderLogs
