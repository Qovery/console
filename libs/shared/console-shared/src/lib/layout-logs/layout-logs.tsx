import {
  ClusterLogs,
  ClusterLogsError,
  ClusterLogsStepEnum,
  EnvironmentLogs,
  EnvironmentLogsError,
  Log,
} from 'qovery-typescript-axios'
import { type PropsWithChildren, type ReactNode, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { RunningStatus } from '@qovery/shared/enums'
import { LoadingStatus, ServiceRunningStatus } from '@qovery/shared/interfaces'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { Icon, IconAwesomeEnum, IconFa, InputCheckbox, LoaderSpinner, StatusChip, Tooltip } from '@qovery/shared/ui'
import { scrollParentToChild } from '@qovery/shared/utils'
import ButtonsActionsLogs from './buttons-actions-logs/buttons-actions-logs'
import MenuTimeFormat from './menu-time-format/menu-time-format'
import TabsClusterLogs from './tabs-cluster-logs/tabs-cluster-logs'
import { UpdateTimeContext, defaultUpdateTimeContext } from './update-time-context/update-time-context'

export interface LayoutLogsDataProps {
  loadingStatus: LoadingStatus
  items?: ClusterLogs[] | (EnvironmentLogs | Log)[]
}

export interface LayoutLogsProps {
  data?: LayoutLogsDataProps
  errors?: ErrorLogsProps[]
  tabInformation?: ReactNode
  withLogsNavigation?: boolean
  serviceRunningStatus?: ServiceRunningStatus
  pauseLogs?: boolean
  setPauseLogs?: (pause: boolean) => void
  lineNumbers?: boolean
  enabledNginx?: boolean
  setEnabledNginx?: (debugMode: boolean) => void
  clusterBanner?: boolean
  countNginx?: number
  placeholderDescription?: string | ReactNode
}

export interface ErrorLogsProps {
  index: number
  error?: ClusterLogsError | EnvironmentLogsError
  timeAgo?: string
  step?: ClusterLogsStepEnum
}

export function LayoutLogs(props: PropsWithChildren<LayoutLogsProps>) {
  const {
    data,
    tabInformation,
    children,
    errors,
    withLogsNavigation,
    pauseLogs,
    setPauseLogs,
    lineNumbers,
    enabledNginx,
    setEnabledNginx,
    clusterBanner,
    countNginx,
    serviceRunningStatus,
    placeholderDescription = 'Logs not available',
  } = props

  const location = useLocation()
  const refScrollSection = useRef<HTMLDivElement>(null)
  const [updateTimeContextValue, setUpdateTimeContext] = useState(defaultUpdateTimeContext)

  const { organizationId = '', projectId = '', environmentId = '', serviceId = '', versionId = '' } = useParams()

  const scrollToError = () => {
    const section = refScrollSection.current
    if (!section) return

    const row = section.querySelector('.row-error')
    if (row) scrollParentToChild(section, row, 100)
  }

  const LinkNavigation = (name: string, link: string, status?: ServiceRunningStatus, displayStatusChip = true) => {
    const isActive = location.pathname.includes(link)
    return (
      <Link
        data-testid="nav"
        className={`flex items-center h-full px-6 text-sm font-medium text-text-100 transition-colors transition-timing duration-250 hover:bg-element-light-darker-500 rounded-t ${
          isActive ? 'bg-element-light-darker-400' : ''
        }`}
        to={link}
      >
        {displayStatusChip && (
          <StatusChip
            status={(status as ServiceRunningStatus)?.state || RunningStatus.STOPPED}
            appendTooltipMessage={
              (status as ServiceRunningStatus)?.state === RunningStatus.ERROR
                ? (status as ServiceRunningStatus).pods[0]?.state_message
                : ''
            }
            className="mr-2"
          />
        )}

        <span className="truncate">{name}</span>
      </Link>
    )
  }

  return (
    <div
      className={`overflow-hidden flex relative w-full p-1 ${
        clusterBanner ? 'h-[calc(100vh-8rem)]' : 'h-[calc(100vh-4.25rem)]'
      }`}
    >
      {withLogsNavigation && (
        <div className="absolute z-20 overflow-y-auto left-1 flex items-center w-[calc(100%-8px)] h-11 border-b border-element-light-darker-200 bg-element-light-darker-700">
          {LinkNavigation(
            'Deployment logs',
            ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
              DEPLOYMENT_LOGS_VERSION_URL(serviceId, versionId !== ':versionId' ? '' : versionId),
            undefined,
            false
          )}
          {LinkNavigation(
            'Live logs',
            ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId),
            serviceRunningStatus
          )}
        </div>
      )}
      {!data || data.items?.length === 0 || data?.loadingStatus === 'not loaded' ? (
        <div data-testid="loading-screen" className="mt-[88px] w-full flex justify-center text-center">
          {data?.loadingStatus === 'not loaded' || !data ? (
            <LoaderSpinner className="w-6 h-6" theme="dark" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-text-100 font-medium text-center">{placeholderDescription}</div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            className={`absolute left-1 z-20 flex justify-end items-center h-11 bg-element-light-darker-400 px-5 border-b border-element-light-darker-200 ${
              tabInformation ? 'w-[calc(100%-360px)]' : 'w-[calc(100%-8px)]'
            } ${withLogsNavigation ? 'top-12' : ''}`}
          >
            <div className="flex mr-auto">
              {errors && errors.length > 0 && (
                <p
                  data-testid="error-layout-line"
                  onClick={() => scrollToError()}
                  className="flex items-center w-full ml-1 text-xs font-bold transition-colors text-text-200 hover:text-text-300 cursor-pointer mr-5"
                >
                  <Icon name="icon-solid-circle-exclamation" className="text-error-500 mr-3" />
                  An error occured line {errors[errors.length - 1]?.index}
                  <Icon name="icon-solid-arrow-circle-right" className="relative top-px ml-1.5" />
                </p>
              )}
              {setEnabledNginx && (
                <div key={serviceId} className="flex items-center shrink-0 text-text-300 text-xs font-medium">
                  <InputCheckbox
                    dataTestId="checkbox-debug"
                    name="checkbox-debug"
                    value={(enabledNginx || false).toString()}
                    onChange={() => setEnabledNginx(!enabledNginx)}
                    label="NGINX logs"
                    className="-ml-1"
                  />
                  {enabledNginx && countNginx !== undefined ? <span className="block ml-1">({countNginx})</span> : ''}
                  <Tooltip content="Documentation about NGINX formats">
                    <a
                      className="relative top-[1px] ml-2"
                      rel="noreferrer"
                      href="https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/log-format/"
                      target="_blank"
                    >
                      <IconFa name={IconAwesomeEnum.CIRCLE_INFO} />
                    </a>
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="flex">
              {location.pathname.includes(
                ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId)
              ) && (
                <MenuTimeFormat
                  updateTimeContextValue={updateTimeContextValue}
                  setUpdateTimeContext={setUpdateTimeContext}
                />
              )}
              <ButtonsActionsLogs
                data={data}
                refScrollSection={refScrollSection}
                pauseLogs={pauseLogs}
                setPauseLogs={setPauseLogs}
              />
            </div>
          </div>
          <div
            ref={refScrollSection}
            onWheel={(event) => !pauseLogs && setPauseLogs && event.deltaY < 0 && setPauseLogs(true)}
            className={`overflow-y-auto w-full h-[calc(100%-20px)] bg-element-light-darker-500 pb-16 mb-5 ${
              lineNumbers
                ? 'before:bg-element-light-darker-500 before:absolute before:left-1 before:top-9 before:w-10 before:h-full'
                : ''
            } ${withLogsNavigation ? 'mt-[88px]' : 'mt-11'}`}
          >
            <UpdateTimeContext.Provider
              value={{
                ...updateTimeContextValue,
                setUpdateTimeContext,
              }}
            >
              <div className="relative z-20">{children}</div>
            </UpdateTimeContext.Provider>
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
