import {
  ClusterLogs,
  ClusterLogsError,
  ClusterLogsStepEnum,
  EnvironmentLogs,
  EnvironmentLogsError,
  Log,
} from 'qovery-typescript-axios'
import { MouseEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { IconEnum, RunningStatus } from '@qovery/shared/enums'
import { ApplicationEntity, EnvironmentEntity, LoadingStatus } from '@qovery/shared/interfaces'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { APPLICATION_LOGS_URL, DEPLOYMENT_LOGS_URL } from '@qovery/shared/routes'
import { scrollParentToChild } from '@qovery/shared/utils'
import ButtonIcon, { ButtonIconStyle } from '../../buttons/button-icon/button-icon'
import Button, { ButtonSize, ButtonStyle } from '../../buttons/button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import { Menu, MenuAlign, MenuData } from '../../menu/menu'
import StatusChip from '../../status-chip/status-chip'
import Tooltip from '../../tooltip/tooltip'
import TabsLogs from './tabs-logs/tabs-logs'
import { UpdateTimeContext, defaultUpdateTimeContext } from './update-time-context/update-time-context'

export interface LayoutLogsDataProps {
  loadingStatus: LoadingStatus
  items?: ClusterLogs[] | Log[] | EnvironmentLogs[]
}

export interface LayoutLogsProps {
  children: ReactNode
  data?: LayoutLogsDataProps
  errors?: ErrorLogsProps[]
  tabInformation?: ReactNode
  withLogsNavigation?: boolean
  applications?: ApplicationEntity[]
  environment?: EnvironmentEntity
  pauseLogs?: boolean
  setPauseLogs?: (pause: boolean) => void
  lineNumbers?: boolean
}

export interface ErrorLogsProps {
  index: number
  error?: ClusterLogsError | EnvironmentLogsError
  timeAgo?: string
  step?: ClusterLogsStepEnum
}

export function LayoutLogs(props: LayoutLogsProps) {
  const {
    data,
    applications,
    environment,
    tabInformation,
    children,
    errors,
    withLogsNavigation,
    pauseLogs,
    setPauseLogs,
    lineNumbers,
  } = props

  const location = useLocation()
  const refScrollSection = useRef<HTMLDivElement>(null)
  const [updateTimeContextValue, setUpdateTimeContext] = useState(defaultUpdateTimeContext)

  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

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

  const downloadJSON = (event: MouseEvent) => {
    const file = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data?.items))
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

  const menusTimeFormat: MenuData = [
    {
      title: 'Time format',
      items: [
        {
          name: 'Local browser time',
          contentLeft: (
            <Icon
              name={IconAwesomeEnum.CHECK}
              className={`text-success-500 ${!updateTimeContextValue.utc ? 'opacity-100' : 'opacity-0'}`}
            />
          ),
          onClick: () => setUpdateTimeContext({ utc: false }),
        },
        {
          name: 'UTC',
          contentLeft: (
            <Icon
              name={IconAwesomeEnum.CHECK}
              className={`text-success-500 ${updateTimeContextValue.utc ? 'opacity-100' : 'opacity-0'}`}
            />
          ),
          onClick: () => setUpdateTimeContext({ utc: true }),
        },
      ],
    },
  ]

  return (
    <div className="overflow-hidden flex relative h-[calc(100vh-4rem)]">
      {withLogsNavigation && (
        <div className="absolute overflow-y-auto z-20 left-0 w-full flex items-center h-10 bg-element-light-darker-500 border-b border-element-light-darker-100">
          {environment && (
            <Link
              data-testid="nav-environment"
              className={`flex items-center h-full px-4 text-sm font-medium text-text-100 transition-colors transition-timing duration-250 hover:bg-element-light-darker-300 ${
                applicationId ? 'bg-element-light-darker-500 ' : 'bg-element-light-darker-200'
              }`}
              to={DEPLOYMENT_LOGS_URL(organizationId, projectId, environmentId)}
            >
              <StatusChip
                status={(environment?.running_status && environment?.running_status.state) || RunningStatus.STOPPED}
                className="mr-2"
              />
              <span className="truncate">Deployment logs</span>
            </Link>
          )}
          {applications?.map((application: ApplicationEntity) => (
            <Link
              key={application.id}
              data-testid="nav-application"
              to={APPLICATION_LOGS_URL(organizationId, projectId, environmentId, application.id)}
              className={`flex items-center h-full px-4 text-text-100 text-sm font-medium transition-colors transition-timing duration-250 hover:bg-element-light-darker-300 ${
                applicationId === application.id ? 'bg-element-light-darker-200' : 'bg-element-light-darker-500'
              }`}
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
              <span className="truncate">{application.name}</span>
              <Icon name={IconEnum.APPLICATION} width="14" className="ml-2" />
            </Link>
          ))}
        </div>
      )}
      {!data || data.items?.length === 0 || data?.loadingStatus === 'not loaded' ? (
        <div data-testid="loading-screen" className="mt-[200px] w-full flex justify-center text-center">
          <div>
            <img
              className="w-40 pointer-events-none user-none"
              src="/assets/images/event-placeholder-dark.svg"
              alt="Event placeholder"
            />
            <p className="mt-5 text-text-100 font-medium">
              {data?.loadingStatus === 'not loaded' || !data ? 'Loading...' : 'Logs not available'}
            </p>
          </div>
        </div>
      ) : (
        <>
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
              {location.pathname.includes(
                APPLICATION_LOGS_URL(organizationId, projectId, environmentId, applicationId)
              ) && (
                <Menu
                  menus={menusTimeFormat}
                  arrowAlign={MenuAlign.END}
                  trigger={
                    <Button
                      className="mr-2"
                      size={ButtonSize.TINY}
                      style={ButtonStyle.DARK}
                      iconRight={IconAwesomeEnum.ANGLE_DOWN}
                    >
                      Time format
                    </Button>
                  }
                />
              )}
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
          </div>
          <div
            ref={refScrollSection}
            onWheel={(event) => !pauseLogs && setPauseLogs && event.deltaY < 0 && setPauseLogs(true)}
            className={`overflow-y-auto w-full h-full min-h-[calc(100vh-100px] pb-16 ${
              lineNumbers
                ? 'before:bg-element-light-darker-300 before:absolute before:left-0 before:top-9 before:w-10 before:h-full'
                : ''
            } ${withLogsNavigation ? 'mt-[76px]' : 'mt-[36px]'}`}
          >
            <UpdateTimeContext.Provider
              value={{
                ...updateTimeContextValue,
                setUpdateTimeContext,
              }}
            >
              <div className="relative z-10">{children}</div>
            </UpdateTimeContext.Provider>
          </div>
          {tabInformation && <TabsLogs scrollToError={scrollToError} tabInformation={tabInformation} errors={errors} />}
        </>
      )}
    </div>
  )
}

export default LayoutLogs
