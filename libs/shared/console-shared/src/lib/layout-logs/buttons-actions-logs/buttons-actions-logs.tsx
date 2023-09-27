import { type MouseEvent, type RefObject, useEffect } from 'react'
import { ButtonIcon, ButtonIconStyle, ButtonLegacySize, Icon, IconAwesomeEnum, Tooltip } from '@qovery/shared/ui'
import { type LayoutLogsDataProps } from '../layout-logs'

export interface ButtonsActionsLogsProps {
  refScrollSection: RefObject<HTMLDivElement>
  data: LayoutLogsDataProps
  setPauseLogs?: (pause: boolean) => void
  pauseLogs?: boolean
}

export function ButtonsActionsLogs(props: ButtonsActionsLogsProps) {
  const { refScrollSection, data, pauseLogs, setPauseLogs } = props

  const downloadJSON = (event: MouseEvent) => {
    const file = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data?.items))
    const target = event.currentTarget as HTMLElement
    target?.setAttribute('href', 'data:' + file)
    target?.setAttribute('download', `data-${Date.now()}.json`)
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
            <ButtonIcon
              dataTestId="pause-button"
              icon={!pauseLogs ? IconAwesomeEnum.PAUSE : IconAwesomeEnum.PLAY}
              size={ButtonLegacySize.TINY}
              style={!pauseLogs ? ButtonIconStyle.DARK : ButtonIconStyle.BASIC}
              onClick={() => setPauseLogs(!pauseLogs)}
            />
          </div>
        </Tooltip>
      )}
      <ButtonIcon
        dataTestId="scroll-up-button"
        icon={IconAwesomeEnum.ARROW_UP_TO_LINE}
        className="ml-2 mr-px !rounded-tr-none !rounded-br-none"
        size={ButtonLegacySize.TINY}
        style={ButtonIconStyle.DARK}
        onClick={() => forcedScroll()}
      />
      <ButtonIcon
        dataTestId="scroll-down-button"
        icon={IconAwesomeEnum.ARROW_DOWN_TO_LINE}
        className="mr-2 !rounded-tl-none !rounded-bl-none"
        size={ButtonLegacySize.TINY}
        style={ButtonIconStyle.DARK}
        onClick={() => forcedScroll(true)}
      />
      <a
        data-testid="download"
        className="btn btn-icon btn-icon--small btn-icon--dark"
        onClick={(event) => downloadJSON(event)}
      >
        <Icon name={IconAwesomeEnum.CLOUD_ARROW_DOWN} />
      </a>
    </>
  )
}

export default ButtonsActionsLogs
