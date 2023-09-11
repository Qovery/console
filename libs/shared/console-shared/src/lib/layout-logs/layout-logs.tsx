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
import { ServiceStateChip } from '@qovery/domains/services/feature'
import { type ApplicationEntity, type DatabaseEntity, type LoadingStatus } from '@qovery/shared/interfaces'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { Icon, IconAwesomeEnum, IconFa, InputCheckbox, Tooltip } from '@qovery/shared/ui'
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
  service?: ApplicationEntity | DatabaseEntity
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
        className={`flex items-center h-full px-6 text-sm font-medium text-neutral-50 transition-colors transition-timing duration-250 hover:bg-neutral-700 rounded-t ${
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
      className={`overflow-hidden flex relative w-full p-1 ${
        clusterBanner ? 'h-[calc(100vh-8rem)]' : 'h-[calc(100vh-4rem)]'
      }`}
    >
      {withLogsNavigation && (
        <div className="absolute z-20 overflow-y-auto left-1 flex items-center w-[calc(100%-8px)] h-11 bg-neutral-900">
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
            (service as DatabaseEntity)?.mode !== DatabaseModeEnum.MANAGED
          )}
        </div>
      )}

      {!data || data?.items?.length === 0 || data?.hideLogs ? (
        <PlaceholderLogs
          type={type}
          serviceDeploymentStatus={serviceDeploymentStatus}
          serviceName={service?.name}
          databaseMode={(service as DatabaseEntity)?.mode}
          loadingStatus={data?.loadingStatus}
          itemsLength={data?.items?.length}
          customPlaceholder={customPlaceholder}
          hideLogs={data?.hideLogs}
        />
      ) : (
        <>
          <div
            className={`absolute left-1 z-20 flex justify-end items-center h-11 bg-neutral-650 px-5 border-y border-neutral-550  ${
              tabInformation ? 'w-[calc(100%-360px)]' : 'w-[calc(100%-8px)]'
            } ${withLogsNavigation ? 'top-12' : ''}`}
          >
            <div className="flex mr-auto">
              {errors && errors.length > 0 && (
                <p
                  data-testid="error-layout-line"
                  onClick={() => scrollToError()}
                  className="flex items-center w-full ml-1 text-xs font-bold transition-colors text-neutral-100 hover:text-neutral-300 cursor-pointer mr-5"
                >
                  <Icon name="icon-solid-circle-exclamation" className="text-red-500 mr-3" />
                  An error occured line {errors[errors.length - 1]?.index}
                  <Icon name="icon-solid-arrow-circle-right" className="relative top-px ml-1.5" />
                </p>
              )}
              {setEnabledNginx && (
                <Tooltip open={pauseLogs} content="To activate the nginx logs button, unpause the logs" side="right">
                  <div key={serviceId} className="flex items-center shrink-0 text-neutral-300 text-xs font-medium">
                    <InputCheckbox
                      dataTestId="checkbox-debug"
                      name="checkbox-debug"
                      value={(enabledNginx || false).toString()}
                      onChange={() => setEnabledNginx(!enabledNginx)}
                      label="NGINX logs"
                      className="-ml-1"
                      disabled={pauseLogs}
                    />
                    {enabledNginx && countNginx !== undefined ? <span className="block ml-1">({countNginx})</span> : ''}
                    <Tooltip content="Display the logs of the Kubernetes ingress controller (NGINX). Click here to know the log format.">
                      <a
                        className="relative top-[1px] ml-2 hover:text-neutral-100"
                        rel="noreferrer"
                        href="https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/log-format/"
                        target="_blank"
                      >
                        <IconFa name={IconAwesomeEnum.CIRCLE_INFO} />
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
            className={`overflow-y-auto w-full h-[calc(100%-20px)] bg-neutral-700 pb-16 mb-5 ${
              lineNumbers
                ? 'before:bg-neutral-700 before:absolute before:left-1 before:top-9 before:w-10 before:h-full'
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
