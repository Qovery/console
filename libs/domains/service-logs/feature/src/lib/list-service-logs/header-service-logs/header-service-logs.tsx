import clsx from 'clsx'
import { subDays, subHours } from 'date-fns'
import { useCallback, useState } from 'react'
import { match } from 'ts-pattern'
import { useQueryParams } from 'use-query-params'
import { type NormalizedServiceLog } from '@qovery/domains/service-logs/data-access'
import { ServiceStateChip, useService } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Button, DatePicker, DropdownMenu, Icon, Link, Tooltip } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import { HeaderLogs } from '../../header-logs/header-logs'
import { SearchServiceLogs } from '../../search-service-logs/search-service-logs'
import { useServiceLogsContext } from '../service-logs-context/service-logs-context'
import { queryParamsServiceLogs } from '../service-logs-context/service-logs-context'

export interface HeaderServiceLogsProps {
  logs: NormalizedServiceLog[]
  isLiveMode: boolean
}

export function HeaderServiceLogs({ logs, isLiveMode }: HeaderServiceLogsProps) {
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
  const [queryParams, setQueryParams] = useQueryParams(queryParamsServiceLogs)

  const { data: service } = useService({ environmentId: environment.id, serviceId })

  const startDate = queryParams.startDate ? new Date(queryParams.startDate) : undefined
  const endDate = queryParams.endDate ? new Date(queryParams.endDate) : undefined
  const hasDeploymentId = Boolean(queryParams.deploymentId)

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
        <Link
          as="button"
          className="gap-1.5"
          variant="surface"
          to={
            ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id) +
            DEPLOYMENT_LOGS_VERSION_URL(serviceId, serviceStatus.execution_id)
          }
        >
          {match(service)
            .with({ serviceType: 'DATABASE' }, (db) => db.mode === 'CONTAINER')
            .otherwise(() => true) ? (
            <ServiceStateChip mode="deployment" environmentId={environment.id} serviceId={serviceId} />
          ) : null}
          Go to latest deployment
          <Icon iconName="arrow-right" />
        </Link>
      </HeaderLogs>
      <div className="flex h-[60px] w-full items-center justify-between gap-2 border-b border-neutral-500 px-4 py-2.5">
        <div className="flex w-full items-center gap-2">
          <Button
            variant="surface"
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
                  startDate: subHours(now, 1),
                  endDate: now,
                  mode: 'history',
                })
              }
            }}
          >
            <span className="relative block h-3.5 w-3.5">
              {isLiveMode ? (
                <Icon iconName="loader" iconStyle="regular" className="absolute left-0 animate-spin" />
              ) : (
                <Icon iconName="circle-play" iconStyle="regular" className="absolute left-0 top-[1px]" />
              )}
            </span>
            Live
          </Button>
          <DatePicker
            onChange={(startDate, endDate) => {
              setQueryParams({
                startDate,
                endDate,
                mode: 'history',
              })
              setIsOpenDatePicker(false)
            }}
            isOpen={isOpenDatePicker}
            maxDate={new Date()}
            minDate={subDays(new Date(), 84)}
            defaultDates={startDate && endDate ? [startDate, endDate] : undefined}
            showTimeInput
            useLocalTime
            onClickOutside={() => setIsOpenDatePicker(false)}
          >
            {!startDate && !endDate ? (
              <Button
                type="button"
                variant="surface"
                color="neutral"
                className="gap-2"
                size="md"
                onClick={() => setIsOpenDatePicker(!isOpenDatePicker)}
              >
                Timeframe
                <Icon iconName="clock" iconStyle="regular" className="relative top-[1px]" />
              </Button>
            ) : (
              <Button
                type="button"
                size="md"
                onClick={() => setIsOpenDatePicker(!isOpenDatePicker)}
                className={clsx('min-w-[337px]', {
                  'min-w-max': hasDeploymentId,
                })}
              >
                {hasDeploymentId && startDate && !endDate ? (
                  dateYearMonthDayHourMinuteSecond(startDate, true, false)
                ) : (
                  <>
                    from: {dateYearMonthDayHourMinuteSecond(startDate ?? new Date(), true, false)} - to:{' '}
                    {dateYearMonthDayHourMinuteSecond(endDate ?? new Date(), true, false)}
                  </>
                )}
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
              <Button size="md" variant="surface" color="neutral" className="gap-1.5">
                {updateTimeContextValue.utc ? 'UTC' : 'Browser time'}
                <Icon iconName="chevron-down" iconStyle="regular" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
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
          <SearchServiceLogs service={service} clusterId={environment.cluster_id} serviceId={serviceId} />
        </div>
        <Tooltip
          content={Object.values(queryParams).some((value) => value) ? 'Download filtered logs' : 'Download logs'}
        >
          <Button
            onClick={() => downloadLogs(logs)}
            size="md"
            variant="surface"
            color="neutral"
            className="w-9 justify-center"
          >
            <Icon iconName="file-arrow-down" iconStyle="regular" />
          </Button>
        </Tooltip>
      </div>
    </>
  )
}
