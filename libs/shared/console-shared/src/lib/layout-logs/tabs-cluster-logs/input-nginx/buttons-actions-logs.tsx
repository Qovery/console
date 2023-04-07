import { MouseEvent, RefObject, useEffect } from 'react'
import { ButtonIcon, ButtonIconStyle, ButtonSize, Icon, IconAwesomeEnum, Tooltip } from '@qovery/shared/ui'
import { LayoutLogsDataProps } from '../../layout-logs'

export interface ButtonsActionsLogsProps {
  refScrollSection: RefObject<HTMLDivElement>
  setPauseLogs: any
  data: LayoutLogsDataProps
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
    <div>
      {setPauseLogs && (
        <Tooltip side="top" content="Resume real-time logs" open={pauseLogs}>
          <div>
            <ButtonIcon
              icon={!pauseLogs ? IconAwesomeEnum.PAUSE : IconAwesomeEnum.PLAY}
              size={ButtonSize.TINY}
              style={!pauseLogs ? ButtonIconStyle.DARK : ButtonIconStyle.BASIC}
              onClick={() => setPauseLogs(!pauseLogs)}
            />
          </div>
        </Tooltip>
      )}
      <ButtonIcon
        icon={IconAwesomeEnum.ARROW_UP_TO_LINE}
        className="ml-2 mr-px !rounded-tr-none !rounded-br-none"
        size={ButtonSize.TINY}
        style={ButtonIconStyle.DARK}
        onClick={() => forcedScroll()}
      />
      <ButtonIcon
        icon={IconAwesomeEnum.ARROW_DOWN_TO_LINE}
        className="mr-2 !rounded-tl-none !rounded-bl-none"
        size={ButtonSize.TINY}
        style={ButtonIconStyle.DARK}
        onClick={() => forcedScroll(true)}
      />
      <a className="btn btn-icon btn-icon--small btn-icon--dark" onClick={(event) => downloadJSON(event)}>
        <Icon name="icon-solid-cloud-arrow-down" />
      </a>
    </div>
  )
}

export default ButtonsActionsLogs
