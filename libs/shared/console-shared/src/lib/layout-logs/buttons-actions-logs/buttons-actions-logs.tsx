import download from 'downloadjs'
import { type RefObject, useEffect } from 'react'
import { Button, Icon, Tooltip } from '@qovery/shared/ui'
import { type LayoutLogsDataProps } from '../layout-logs'

export interface ButtonsActionsLogsProps {
  refScrollSection: RefObject<HTMLDivElement>
  data: LayoutLogsDataProps
  setPauseLogs?: (pause: boolean) => void
  pauseLogs?: boolean
}

export function ButtonsActionsLogs(props: ButtonsActionsLogsProps) {
  const { refScrollSection, data, pauseLogs, setPauseLogs } = props

  const downloadJSON = () => {
    download(JSON.stringify(data?.items), `data-${Date.now()}.json`, 'text/json;charset=utf-8')
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

  useEffect(() => {
    // auto scroll when we add data
    !pauseLogs && forcedScroll && forcedScroll(true)
  }, [data])

  return (
    <>
      {setPauseLogs && (
        <Tooltip side="top" content="Resume real-time logs" open={pauseLogs}>
          <div>
            <Button
              className="w-10 justify-center"
              type="button"
              color={pauseLogs ? 'brand' : 'neutral'}
              onClick={() => setPauseLogs(!pauseLogs)}
            >
              <Icon iconName={pauseLogs ? 'play' : 'pause'} />
            </Button>
          </div>
        </Tooltip>
      )}
      <Button
        data-testid="scroll-up-button"
        className="w-10 justify-center ml-2 mr-px !rounded-tr-none !rounded-br-none"
        type="button"
        color="neutral"
        onClick={() => forcedScroll()}
      >
        <Icon iconName="arrow-up-to-line" />
      </Button>
      <Button
        data-testid="scroll-down-button"
        className="w-10 justify-center mr-2 !rounded-tl-none !rounded-bl-none"
        type="button"
        color="neutral"
        onClick={() => forcedScroll(true)}
      >
        <Icon iconName="arrow-down-to-line" />
      </Button>
      <Button
        data-testid="download"
        type="button"
        color="neutral"
        className="w-10 justify-center"
        onClick={() => downloadJSON()}
      >
        <Icon iconName="cloud-arrow-down" />
      </Button>
    </>
  )
}

export default ButtonsActionsLogs
