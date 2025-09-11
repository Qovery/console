import { subDays } from 'date-fns'
import { match } from 'ts-pattern'
import { type ServiceLog } from '@qovery/domains/service-logs/data-access'
import { ServiceStateChip, useService } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Button, DatePicker, DropdownMenu, Icon, Link, Tooltip } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import { HeaderLogs } from '../../header-logs/header-logs'
import { SearchServiceLogs } from '../../search-service-logs/search-service-logs'
import { useServiceLogsContext } from '../service-logs-context/service-logs-context'

export interface HeaderServiceLogsProps {
  logs: ServiceLog[]
}

export function HeaderServiceLogs({ logs }: HeaderServiceLogsProps) {
  const {
    environment,
    serviceId,
    serviceStatus,
    environmentStatus,
    startDate,
    endDate,
    isOpenTimestamp,
    setStartDate,
    setEndDate,
    setIsOpenTimestamp,
    clearDate,
    updateTimeContextValue,
    setUpdateTimeContext,
    downloadLogs,
    isLiveMode,
    setIsLiveMode,
  } = useServiceLogsContext()

  const { data: service } = useService({ environmentId: environment.id, serviceId })

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
      <div className="flex h-[60px] w-full items-center justify-between gap-3 border-b border-neutral-500 px-4 py-2.5">
        <div className="flex w-full items-center gap-3">
          <Tooltip content={isLiveMode ? 'Live refresh (15s) - Active' : 'Switch to live mode'}>
            <Button
              variant="surface"
              color={isLiveMode ? 'brand' : 'neutral'}
              size="md"
              className="gap-1.5"
              onClick={() => setIsLiveMode(!isLiveMode)}
              disabled={!startDate || !endDate}
            >
              <Icon iconName="circle-play" iconStyle="regular" className="relative top-[1px]" />
              Live
            </Button>
          </Tooltip>
          <DatePicker
            onChange={(startDate, endDate) => {
              setStartDate(startDate)
              setEndDate(endDate)
              setIsOpenTimestamp(false)
            }}
            isOpen={isOpenTimestamp}
            maxDate={new Date()}
            minDate={subDays(new Date(), 30)}
            defaultDates={startDate && endDate ? [startDate, endDate] : undefined}
            showTimeInput
            useLocalTime
            onClickOutside={() => setIsOpenTimestamp(false)}
          >
            {!startDate && !endDate ? (
              <Button
                data-testid="timeframe-button"
                type="button"
                variant="surface"
                color="neutral"
                className="gap-2"
                onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
              >
                Timeframe
                <Icon iconName="clock" iconStyle="regular" />
              </Button>
            ) : (
              <Button type="button" data-testid="timeframe-values" onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}>
                from: {dateYearMonthDayHourMinuteSecond(startDate ?? new Date(), true, false)} - to:{' '}
                {dateYearMonthDayHourMinuteSecond(endDate ?? new Date(), true, false)}
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
          <SearchServiceLogs />
        </div>
        <div className="flex gap-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button size="sm" variant="surface" color="neutral" className="gap-1.5">
                Time format
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
                Local browser time
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
          <Button
            onClick={() => downloadLogs(logs)}
            size="sm"
            variant="surface"
            color="neutral"
            className="w-7 justify-center"
          >
            <Icon iconName="file-arrow-down" iconStyle="regular" />
          </Button>
        </div>
      </div>
    </>
  )
}
