import download from 'downloadjs'
import { type RefObject, useEffect } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { type LayoutLogsDataProps } from '../layout-logs'

export interface ButtonsActionsLogsProps {
  refScrollSection: RefObject<HTMLDivElement>
  data: LayoutLogsDataProps
}

export function ButtonsActionsLogs(props: ButtonsActionsLogsProps) {
  const { refScrollSection, data } = props

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
    forcedScroll && forcedScroll(true)
  }, [data])

  return (
    <>
      <Button
        data-testid="scroll-up-button"
        className="ml-2 mr-px w-10 justify-center !rounded-br-none !rounded-tr-none"
        type="button"
        color="neutral"
        onClick={() => forcedScroll()}
      >
        <Icon iconName="arrow-up-to-line" />
      </Button>
      <Button
        data-testid="scroll-down-button"
        className="mr-2 w-10 justify-center !rounded-bl-none !rounded-tl-none"
        type="button"
        color="neutral"
        onClick={() => forcedScroll(true)}
      >
        <Icon iconName="arrow-down-to-line" />
      </Button>
      <Button type="button" color="neutral" className="w-10 justify-center" onClick={() => downloadJSON()}>
        <Icon iconName="cloud-arrow-down" />
      </Button>
    </>
  )
}

export default ButtonsActionsLogs
