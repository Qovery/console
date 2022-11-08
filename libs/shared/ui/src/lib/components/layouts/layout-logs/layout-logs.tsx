import { ClusterLogs, ClusterLogsError, ClusterLogsStepEnum, Log } from 'qovery-typescript-axios'
import { MouseEvent, ReactNode, useEffect, useRef } from 'react'
import { IconEnum, RunningStatus } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { ButtonIcon, ButtonIconStyle, ButtonSize, Icon, IconAwesomeEnum, StatusChip } from '@qovery/shared/ui'
import { scrollParentToChild } from '@qovery/shared/utils'
import TabsLogs from './tabs-logs/tabs-logs'

export interface LayoutLogsDataProps {
  loadingStatus: LoadingStatus
  items?: ClusterLogs[] | Log[]
}

export interface LayoutLogsProps {
  children: ReactNode
  data?: LayoutLogsDataProps
  errors?: ErrorLogsProps[]
  tabInformation?: ReactNode
  withLogsNavigation?: boolean
  application?: ApplicationEntity
  pauseLogs?: boolean
  setPauseLogs?: (pause: boolean) => void
  lineNumbers?: boolean
}

export interface ErrorLogsProps {
  index: number
  timeAgo: string
  step: ClusterLogsStepEnum
  error: ClusterLogsError
}

export function LayoutLogs(props: LayoutLogsProps) {
  const {
    data,
    application,
    tabInformation,
    children,
    errors,
    withLogsNavigation,
    pauseLogs,
    setPauseLogs,
    lineNumbers,
  } = props

  const refScrollSection = useRef<HTMLDivElement>(null)

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

  if (!data || data.items?.length === 0 || data?.loadingStatus === 'not loaded') {
    return (
      <div data-testid="loading-screen" className="mt-20 flex flex-col justify-center items-center text-center">
        <img
          className="w-40 pointer-events-none user-none"
          src="/assets/images/event-placeholder-dark.svg"
          alt="Event placeholder"
        />
        <p className="mt-5 text-text-100 font-medium">
          {data?.loadingStatus === 'not loaded' || !data ? 'Loading...' : 'Logs not available'}
        </p>
      </div>
    )
  }

  const downloadJSON = (event: MouseEvent) => {
    const file = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data))
    const target = event.currentTarget
    target.setAttribute('href', 'data:' + file)
    target.setAttribute('download', `data-${Date.now()}.json`)
  }

  const scrollToError = () => {
    const section = refScrollSection.current
    if (!section) return

    const row = section.querySelector('.row-error')
    if (row) scrollParentToChild(section, row, 100)
  }

  return (
    <div className="overflow-hidden flex relative h-[calc(100vh-4rem)]">
      {withLogsNavigation && (
        <div className="absolute z-20 left-0 w-full flex items-center h-10 bg-element-light-darker-500 border-b border-element-light-darker-100">
          {application && (
            <div
              data-testid="nav-application"
              className="flex items-center h-full px-4 bg-element-light-darker-200 text-text-100 text-sm font-medium"
            >
              <StatusChip
                status={(application?.running_status && application?.running_status.state) || RunningStatus.STOPPED}
                appendTooltipMessage={
                  application?.running_status?.state === RunningStatus.ERROR
                    ? application.running_status.pods[0]?.state_message
                    : ''
                }
                className="mr-2"
              />
              {application.name}
              <Icon name={IconEnum.APPLICATION} width="14" className="ml-2" />
            </div>
          )}
        </div>
      )}
      <div
        className={`absolute z-20 left-0 flex justify-end items-center h-9 bg-element-light-darker-200 px-5 ${
          tabInformation ? 'w-[calc(100%-360px)]' : 'w-full'
        } ${withLogsNavigation ? 'top-10' : ''}`}
      >
        {errors && errors.length > 0 && (
          <p
            data-testid="error-layout-line"
            onClick={() => scrollToError()}
            className="flex items-center w-full ml-1 text-xs font-bold transition-colors text-text-200 hover:text-text-300 cursor-pointer"
          >
            <Icon name="icon-solid-circle-exclamation" className="text-error-500 mr-3" />
            An error occured line {errors[errors.length - 1]?.index}
            <Icon name="icon-solid-arrow-circle-right" className="relative top-px ml-1.5" />
          </p>
        )}
        <div className="flex">
          {setPauseLogs && (
            <ButtonIcon
              className="mr-2"
              icon={!pauseLogs ? IconAwesomeEnum.PAUSE : IconAwesomeEnum.PLAY}
              size={ButtonSize.TINY}
              style={ButtonIconStyle.DARK}
              onClick={() => setPauseLogs(!pauseLogs)}
            />
          )}
          <ButtonIcon
            icon={IconAwesomeEnum.ARROW_UP_TO_LINE}
            className="mr-px !rounded-tr-none !rounded-br-none"
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
      </div>
      <div
        ref={refScrollSection}
        onWheel={(event) => !pauseLogs && setPauseLogs && event.deltaY < 0 && setPauseLogs(true)}
        className={`overflow-y-auto w-full h-full min-h-[calc(100vh-100px] pb-16 ${
          lineNumbers
            ? 'before:bg-element-light-darker-300 before:absolute before:left-0 before:top-9 before:w-10 before:h-full'
            : ''
        } ${withLogsNavigation ? 'mt-[72px]' : 'mt-10'}`}
      >
        <div className="relative z-10">{children}</div>
      </div>
      {tabInformation && <TabsLogs scrollToError={scrollToError} tabInformation={tabInformation} errors={errors} />}
    </div>
  )
}

export default LayoutLogs
