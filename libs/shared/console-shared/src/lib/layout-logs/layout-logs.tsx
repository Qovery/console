import {
  type ClusterLogs,
  type ClusterLogsError,
  type ClusterLogsStepEnum,
  type EnvironmentLogs,
  type EnvironmentLogsError,
} from 'qovery-typescript-axios'
import { type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren, type ReactNode, useRef } from 'react'
import { type LoadingStatus } from '@qovery/shared/interfaces'
import { Icon } from '@qovery/shared/ui'
import { scrollParentToChild } from '@qovery/shared/util-js'
import ButtonsActionsLogs from './buttons-actions-logs/buttons-actions-logs'
import { PlaceholderLogs } from './placeholder-logs/placeholder-logs'
import TabsClusterLogs from './tabs-cluster-logs/tabs-cluster-logs'

export interface LayoutLogsDataProps {
  loadingStatus: LoadingStatus
  hideLogs?: boolean
  items?: ClusterLogs[] | EnvironmentLogs[] | ServiceLogResponseDto[]
}

export type logsType = 'infra'

export interface LayoutLogsProps {
  type: logsType
  data?: LayoutLogsDataProps
  errors?: ErrorLogsProps[]
  tabInformation?: ReactNode
  withLogsNavigation?: boolean
  lineNumbers?: boolean
  clusterBanner?: boolean
}

export interface ErrorLogsProps {
  index: number
  error?: ClusterLogsError | EnvironmentLogsError
  timeAgo?: string
  step?: ClusterLogsStepEnum
}

export function LayoutLogs({
  type,
  data,
  tabInformation,
  children,
  errors,
  withLogsNavigation,
  lineNumbers,
  clusterBanner,
}: PropsWithChildren<LayoutLogsProps>) {
  const refScrollSection = useRef<HTMLDivElement>(null)

  const scrollToError = () => {
    const section = refScrollSection.current
    if (!section) return

    const row = section.querySelector('.row-error')
    if (row) scrollParentToChild(section, row, 100)
  }

  return (
    <div
      className={`relative flex w-full max-w-[calc(100vw-64px)] overflow-hidden p-1 ${
        clusterBanner ? 'h-[calc(100vh-8rem)]' : 'h-[calc(100vh-4rem)]'
      }`}
    >
      {!data || data?.items?.length === 0 || data?.hideLogs ? (
        <PlaceholderLogs type={type} loadingStatus={data?.loadingStatus} />
      ) : (
        <>
          <div
            className={`absolute left-1 flex h-11 items-center justify-end border-y border-neutral-550 bg-neutral-650 px-5  ${
              tabInformation ? 'w-[calc(100%-360px)]' : 'w-[calc(100%-8px)]'
            } ${withLogsNavigation ? 'top-12' : ''}`}
          >
            <div className="mr-auto flex">
              {errors && errors.length > 0 && (
                <p
                  data-testid="error-layout-line"
                  onClick={() => scrollToError()}
                  className="ml-1 mr-5 flex w-full cursor-pointer items-center text-xs font-bold text-neutral-100 transition-colors hover:text-neutral-300"
                >
                  <Icon name="icon-solid-circle-exclamation" className="mr-3 text-red-500" />
                  An error occured line {errors[errors.length - 1]?.index}
                  <Icon name="icon-solid-arrow-circle-right" className="relative top-px ml-1.5" />
                </p>
              )}
            </div>
            <div className="flex">
              <ButtonsActionsLogs data={data} refScrollSection={refScrollSection} />
            </div>
          </div>
          <div
            ref={refScrollSection}
            className={`mb-5 h-[calc(100%-20px)] w-full overflow-y-auto bg-neutral-700 pb-16 ${
              lineNumbers
                ? 'before:absolute before:left-1 before:top-9 before:-z-[1] before:h-full before:w-10 before:bg-neutral-700'
                : ''
            } ${withLogsNavigation ? 'mt-[88px]' : 'mt-11'}`}
          >
            <div className="relative">{children}</div>
          </div>
          {tabInformation && (
            <TabsClusterLogs scrollToError={scrollToError} tabInformation={tabInformation} errors={errors} />
          )}
        </>
      )}
    </div>
  )
}

export default LayoutLogs
