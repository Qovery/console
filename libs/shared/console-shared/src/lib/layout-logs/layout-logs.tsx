import {
  type ClusterLogs,
  type ClusterLogsError,
  type ClusterLogsStepEnum,
  DatabaseModeEnum,
  type EnvironmentLogs,
  type EnvironmentLogsError,
  type ServiceDeploymentStatusEnum,
} from 'qovery-typescript-axios'
import { type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren, type ReactNode, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { type AnyService, type Database } from '@qovery/domains/services/data-access'
import { ServiceStateChip } from '@qovery/domains/services/feature'
import { type LoadingStatus } from '@qovery/shared/interfaces'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { Icon, InputCheckbox, Tooltip } from '@qovery/shared/ui'
import { scrollParentToChild } from '@qovery/shared/util-js'
import ButtonsActionsLogs from './buttons-actions-logs/buttons-actions-logs'
import MenuTimeFormat from './menu-time-format/menu-time-format'
import { PlaceholderLogs } from './placeholder-logs/placeholder-logs'
import TabsClusterLogs from './tabs-cluster-logs/tabs-cluster-logs'
import { UpdateTimeContext, defaultUpdateTimeContext } from './update-time-context/update-time-context'

export interface LayoutLogsDataProps {
  loadingStatus: LoadingStatus
  hideLogs?: boolean
  items?: ClusterLogs[] | EnvironmentLogs[] | ServiceLogResponseDto[]
}

export type logsType = 'infra' | 'live' | 'deployment'

export interface LayoutLogsProps {
  type: logsType
  service?: AnyService
  data?: LayoutLogsDataProps
  errors?: ErrorLogsProps[]
  tabInformation?: ReactNode
  withLogsNavigation?: boolean
  pauseLogs?: boolean
  setPauseLogs?: (pause: boolean) => void
  lineNumbers?: boolean
  enabledNginx?: boolean
  setEnabledNginx?: (debugMode: boolean) => void
  clusterBanner?: boolean
  countNginx?: number
  customPlaceholder?: string | ReactNode
  serviceDeploymentStatus?: ServiceDeploymentStatusEnum
  isProgressing?: boolean
  progressingMsg?: string
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
  pauseLogs,
  setPauseLogs,
  lineNumbers,
  enabledNginx,
  setEnabledNginx,
  clusterBanner,
  countNginx,
  customPlaceholder,
  service,
  serviceDeploymentStatus,
  isProgressing,
  progressingMsg,
}: PropsWithChildren<LayoutLogsProps>) {
  const location = useLocation()
  const refScrollSection = useRef<HTMLDivElement>(null)
  const [updateTimeContextValue, setUpdateTimeContext] = useState(defaultUpdateTimeContext)

  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams()

  const scrollToError = () => {
    const section = refScrollSection.current
    if (!section) return

    const row = section.querySelector('.row-error')
    if (row) scrollParentToChild(section, row, 100)
  }

  const LinkNavigation = (
    name: string,
    link: string,
    environmentId?: string,
    serviceId?: string,
    displayStatusChip = true
  ) => {
    const isActive = location.pathname.includes(link)
    return (
      <Link
        data-testid="nav"
        className={`transition-timing duration-250 flex h-full items-center rounded-t px-6 text-sm font-medium text-neutral-50 transition-colors hover:bg-neutral-700 ${
          isActive ? 'bg-neutral-650' : ''
        }`}
        to={link}
      >
        {displayStatusChip && (
          <ServiceStateChip className="mr-2" mode="running" environmentId={environmentId} serviceId={serviceId} />
        )}

        <span className="truncate">{name}</span>
      </Link>
    )
  }

  return (
    <div
      className={`relative flex w-full overflow-hidden p-1 ${
        clusterBanner ? 'h-[calc(100vh-8rem)]' : 'h-[calc(100vh-4rem)]'
      }`}
    >
      {withLogsNavigation && (
        <div className="absolute left-1 flex h-11 w-[calc(100%-8px)] items-center overflow-y-auto bg-neutral-900">
          {LinkNavigation(
            'Deployment logs',
            ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(serviceId),
            undefined,
            undefined,
            false
          )}
          {LinkNavigation(
            'Live logs',
            ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId),
            environmentId,
            serviceId,
            (service as Database)?.mode !== DatabaseModeEnum.MANAGED
          )}
        </div>
      )}

      {!data || data?.items?.length === 0 || data?.hideLogs ? (
        <PlaceholderLogs
          type={type}
          serviceDeploymentStatus={serviceDeploymentStatus}
          serviceName={service?.name}
          databaseMode={(service as Database)?.mode}
          loadingStatus={data?.loadingStatus}
          itemsLength={data?.items?.length}
          customPlaceholder={customPlaceholder}
          hideLogs={data?.hideLogs}
        />
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
              {setEnabledNginx && (
                <Tooltip open={pauseLogs} content="To activate the nginx logs button, unpause the logs" side="right">
                  <div key={serviceId} className="flex shrink-0 items-center text-xs font-medium text-neutral-300">
                    <InputCheckbox
                      dataTestId="checkbox-debug"
                      name="checkbox-debug"
                      value={(enabledNginx || false).toString()}
                      onChange={() => setEnabledNginx(!enabledNginx)}
                      label="NGINX logs"
                      className="-ml-1"
                      disabled={pauseLogs}
                    />
                    {enabledNginx && countNginx !== undefined ? <span className="ml-1 block">({countNginx})</span> : ''}
                    <Tooltip content="Display the logs of the Kubernetes ingress controller (NGINX). Click here to know the log format.">
                      <a
                        className="relative top-[1px] ml-2 hover:text-neutral-100"
                        rel="noreferrer"
                        href="https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/log-format/"
                        target="_blank"
                      >
                        <Icon iconName="circle-info" />
                      </a>
                    </Tooltip>
                  </div>
                </Tooltip>
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
            onWheel={(event) =>
              !pauseLogs &&
              setPauseLogs &&
              refScrollSection.current &&
              refScrollSection.current.clientHeight !== refScrollSection.current.scrollHeight &&
              event.deltaY < 0 &&
              setPauseLogs(true)
            }
            className={`mb-5 h-[calc(100%-20px)] w-full overflow-y-auto bg-neutral-700 pb-16 ${
              lineNumbers
                ? 'before:absolute before:left-1 before:top-9 before:-z-[1] before:h-full before:w-10 before:bg-neutral-700'
                : ''
            } ${withLogsNavigation ? 'mt-[88px]' : 'mt-11'}`}
          >
            <UpdateTimeContext.Provider
              value={{
                ...updateTimeContextValue,
                setUpdateTimeContext,
              }}
            >
              <div className="relative">
                {children}
                {isProgressing && (
                  <div
                    role="progressbar"
                    className="relative -top-8 flex h-8 items-center border-b border-neutral-500 pl-3 text-sm text-neutral-350"
                  >
                    <span className="mr-1.5">{progressingMsg}</span>
                    <span className="mr-[2px] h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_100ms_infinite] rounded-[0.5px] bg-neutral-350" />
                    <span className="mr-[2px] h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_300ms_infinite]  rounded-[0.5px] bg-neutral-350" />
                    <span className="h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_600ms_infinite] rounded-[0.5px] bg-neutral-350" />
                  </div>
                )}
              </div>
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
