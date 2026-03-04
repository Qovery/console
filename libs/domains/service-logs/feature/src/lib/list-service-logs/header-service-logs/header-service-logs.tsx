import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import clsx from 'clsx'
import { subDays, subHours } from 'date-fns'
import { useCallback, useState } from 'react'
import { match } from 'ts-pattern'
import { type NormalizedServiceLog } from '@qovery/domains/service-logs/data-access'
import { ServiceStateChip, useService } from '@qovery/domains/services/feature'
import { type ServiceLogsParams } from '@qovery/shared/router'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Button, DatePicker, DropdownMenu, Icon, Link, Tooltip } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import { HeaderLogs } from '../../header-logs/header-logs'
import { SearchServiceLogs } from '../../search-service-logs/search-service-logs'
import { useServiceLogsContext } from '../service-logs-context/service-logs-context'

export interface HeaderServiceLogsProps {
  logs: NormalizedServiceLog[]
  refetchHistoryLogs: () => void
  isLiveMode: boolean
}

export function HeaderServiceLogs({ logs, isLiveMode, refetchHistoryLogs }: HeaderServiceLogsProps) {
  const {
    environment,
    serviceId,
    serviceStatus,
    environmentStatus,
    updateTimeContextValue,
    setUpdateTimeContext,
    downloadLogs,
  } = useServiceLogsContext()

  const [isOpenDatePicker, setIsOpenDatePicker] = useState(false)
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryParams = useSearch({ strict: false })

  const { data: service } = useService({ environmentId: environment.id, serviceId, suspense: true })

  const startDate = queryParams.startDate ? new Date(queryParams.startDate) : undefined
  const endDate = queryParams.endDate ? new Date(queryParams.endDate) : undefined
  const hasDeploymentId = Boolean(queryParams.deploymentId)

  const setQueryParams = useCallback(
    (searchParams: ServiceLogsParams) => {
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/service-logs',
        params: {
          organizationId,
          projectId,
          environmentId,
          serviceId,
        },
        search: searchParams,
      })
    },
    [navigate, organizationId, projectId, environmentId, serviceId]
  )

  const clearDate = useCallback(() => {
    setQueryParams({
      startDate: undefined,
      endDate: undefined,
      mode: 'live',
    })
  }, [setQueryParams])

  return (
    <>
      <HeaderLogs
        type="SERVICE"
        environment={environment}
        serviceId={serviceId}
        serviceStatus={serviceStatus}
        environmentStatus={environmentStatus}
      >
        {/* TODO new-nav: This path will need to be updated once we have the deployment logs route */}
        {/*<Link
          as="button"
          className="gap-1.5"
          variant="outline"
          to={
            // ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id) +
            // DEPLOYMENT_LOGS_VERSION_URL(serviceId, serviceStatus.execution_id ?? '')
            '/organization/$orgnizationId/project/4projectId/environment/$environmentId/logs/$logId/deployment-logs/$deploymentId'
          }
          params={{
            organizationId,
            projectId,
            environmentId,
            logId: '',
            deploymentId: serviceStatus.execution_id ?? '',
          }}
        >
          {match(service)
            .with({ serviceType: 'DATABASE' }, (db) => db.mode === 'CONTAINER')
            .otherwise(() => true) ? (
            <ServiceStateChip mode="deployment" environmentId={environment.id} serviceId={serviceId} />
          ) : null}
          Go to latest deployment
          <Icon iconName="arrow-right" />
        </Link>*/}
      </HeaderLogs>
      <div className="sticky top-[93px] z-header flex h-[60px] w-full items-center justify-between gap-2 border-b border-neutral bg-background px-4 py-2.5">
        <div className="flex w-full items-center gap-2">
          <Button
            variant="outline"
            color={isLiveMode ? 'brand' : 'neutral'}
            size="md"
            className={clsx('gap-1.5 pl-2.5', {
              'bg-brand-500/10 hover:!bg-brand-500/20 focus:!bg-brand-500/20': isLiveMode,
            })}
            onClick={() => {
              if (!isLiveMode) {
                setQueryParams({ startDate: undefined, endDate: undefined, mode: 'live' })
              } else {
                const now = new Date()
                setQueryParams({
                  startDate: subHours(now, 1).toISOString(),
                  endDate: now.toISOString(),
                  mode: 'history',
                })
              }
            }}
          >
            <span className="relative block h-3.5 w-3.5">
              {isLiveMode ? (
                <Icon iconName="loader" iconStyle="regular" className="absolute left-0 animate-spin" />
              ) : (
                <Icon iconName="circle-play" iconStyle="regular" className="absolute left-0" />
              )}
            </span>
            Live
          </Button>
          <DatePicker
            onChange={(startDate, endDate) => {
              setQueryParams({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                mode: 'history',
              })
              setIsOpenDatePicker(false)
            }}
            isOpen={isOpenDatePicker}
            maxDate={new Date()}
            minDate={subDays(new Date(), 84)}
            defaultDates={startDate && endDate ? [startDate, endDate] : undefined}
            showDateTimeInputs
            useLocalTime
            onClickOutside={() => setIsOpenDatePicker(false)}
          >
            {!startDate && !endDate ? (
              <Button
                type="button"
                variant="outline"
                color="neutral"
                className="gap-2"
                size="md"
                onClick={() => setIsOpenDatePicker(!isOpenDatePicker)}
              >
                Timeframe
                <Icon iconName="clock" iconStyle="regular" className="relative top-[1px]" />
              </Button>
            ) : (
              <Button type="button" size="md" onClick={() => setIsOpenDatePicker(!isOpenDatePicker)}>
                <span className="inline-flex text-nowrap">
                  {hasDeploymentId && startDate && !endDate ? (
                    <>from: {dateYearMonthDayHourMinuteSecond(startDate, true, false)}</>
                  ) : (
                    <>
                      from: {dateYearMonthDayHourMinuteSecond(startDate ?? new Date(), true, false)} - to:{' '}
                      {dateYearMonthDayHourMinuteSecond(endDate ?? new Date(), true, false)}
                    </>
                  )}
                </span>
                <span
                  data-testid="clear-timestamp"
                  className="relative left-1 px-1 py-1"
                  role="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    clearDate()
                  }}
                >
                  <Icon iconName="xmark" />
                </span>
              </Button>
            )}
          </DatePicker>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button size="md" variant="outline" color="neutral" className="gap-1.5">
                {updateTimeContextValue.utc ? 'UTC' : 'Browser time'}
                <Icon iconName="chevron-down" iconStyle="regular" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="z-header">
              <DropdownMenu.Item
                className="gap-2"
                onSelect={() =>
                  setUpdateTimeContext({
                    utc: false,
                  })
                }
              >
                <Icon
                  iconName="check"
                  iconStyle="regular"
                  className={`text-green-500 ${!updateTimeContextValue.utc ? 'opacity-100' : 'opacity-0'}`}
                />
                Browser time
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="gap-2"
                onSelect={() =>
                  setUpdateTimeContext({
                    utc: true,
                  })
                }
              >
                <Icon
                  iconName="check"
                  iconStyle="regular"
                  className={`text-green-500 ${updateTimeContextValue.utc ? 'opacity-100' : 'opacity-0'}`}
                />
                UTC
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <SearchServiceLogs
            service={service}
            clusterId={environment.cluster_id}
            serviceId={serviceId}
            refetchHistoryLogs={refetchHistoryLogs}
          />
        </div>
        <Tooltip
          content={Object.values(queryParams).some((value) => value) ? 'Download filtered logs' : 'Download logs'}
        >
          <Button onClick={() => downloadLogs(logs)} size="md" variant="outline" iconOnly>
            <Icon iconName="file-arrow-down" iconStyle="regular" />
          </Button>
        </Tooltip>
      </div>
    </>
  )
}
