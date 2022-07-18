import React, { ReactNode, MouseEvent, useRef, useEffect } from 'react'
import { ClusterLogs, ClusterLogsError, ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { ButtonIcon, ButtonSize, ButtonIconStyle, Icon } from '@console/shared/ui'
import { LoadingStatus } from '@console/shared/interfaces'
import { dateDifferenceMinutes, scrollParentToChild } from '@console/shared/utils'
import TabsLogs from './tabs-logs/tabs-logs'

export interface LayoutLogsProps {
  children: ReactNode
  data?: {
    loadingStatus: LoadingStatus
    items?: ClusterLogs[]
  }
  tabInformation?: ReactNode
}

export interface ErrorLogsProps {
  index: number
  timeAgo: string
  step: ClusterLogsStepEnum
  error: ClusterLogsError
}

export function LayoutLogsMemo(props: LayoutLogsProps) {
  const { data, tabInformation, children } = props

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
    forcedScroll && forcedScroll(true)
  }, [data])

  if (!data || data.items?.length === 0 || data?.loadingStatus === 'not loaded')
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

  const errors =
    data.items &&
    (data.items
      .map(
        (currentData: ClusterLogs, index: number) =>
          currentData.error && {
            index: index + 1,
            timeAgo:
              data.items &&
              data.items[0].timestamp &&
              currentData.timestamp &&
              dateDifferenceMinutes(new Date(currentData.timestamp), new Date(data.items[0].timestamp)),
            step: currentData.step,
            error: currentData.error,
          }
      )
      .filter((error) => error) as ErrorLogsProps[])

  const realErrors = errors?.filter(
    (error: ErrorLogsProps) =>
      error.step === ClusterLogsStepEnum.DELETE_ERROR ||
      error.step === ClusterLogsStepEnum.PAUSE_ERROR ||
      error.step === ClusterLogsStepEnum.CREATE_ERROR
  )

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
    <div className="overflow-hidden flex relative h-full">
      <div className="absolute z-20 left-0 w-[calc(100%-360px)] flex justify-end items-center h-9 bg-element-light-darker-200 px-5">
        {realErrors && realErrors.length > 0 && (
          <p
            data-testid="error-layout-line"
            onClick={() => scrollToError()}
            className="flex items-center w-full ml-1 text-xs font-bold transition-colors text-text-200 hover:text-text-300 cursor-pointer"
          >
            <Icon name="icon-solid-circle-exclamation" className="text-error-500 mr-3" />
            An error occured line {realErrors[realErrors.length - 1]?.index}
            <Icon name="icon-solid-arrow-circle-right" className="relative top-px ml-1.5" />
          </p>
        )}
        <div className="flex">
          <ButtonIcon
            icon="icon-solid-arrow-up-to-line"
            className="mr-px !rounded-tr-none !rounded-br-none"
            size={ButtonSize.SMALL}
            style={ButtonIconStyle.DARK}
            onClick={() => forcedScroll()}
          />
          <ButtonIcon
            icon="icon-solid-arrow-down-to-line"
            className="mr-2 !rounded-tl-none !rounded-bl-none"
            size={ButtonSize.SMALL}
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
        className="overflow-y-auto w-full h-full min-h-[calc(100vh-100px] mt-9 pb-16 before:bg-element-light-darker-300 before:absolute before:left-0 before:top-9 before:w-10 before:h-full"
      >
        <div className="relative z-10">{children}</div>
      </div>
      <TabsLogs scrollToError={scrollToError} tabInformation={tabInformation} errors={realErrors} />
    </div>
  )
}

export const LayoutLogs = React.memo(LayoutLogsMemo, (prevProps: LayoutLogsProps, nextProps: LayoutLogsProps) => {
  // stringify is necessary to avoid Redux selector behavior
  const isEqual = JSON.stringify(prevProps.data?.items) === JSON.stringify(nextProps.data?.items)
  return isEqual
})
