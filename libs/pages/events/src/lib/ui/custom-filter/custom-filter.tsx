import { subDays } from 'date-fns'
import { type Organization } from 'qovery-typescript-axios'
import { useSearchParams } from 'react-router-dom'
import { Button, DatePicker, Icon, type SelectedTimestamps } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'

export interface CustomFilterProps {
  onChangeTimestamp: (startDate: Date, endDate: Date) => void
  onChangeClearTimestamp: () => void
  isOpenTimestamp: boolean
  setIsOpenTimestamp: (isOpen: boolean) => void
  clearFilter: () => void
  timestamps: SelectedTimestamps
  organization?: Organization
}

function getDefaultDates(timestamps: SelectedTimestamps): [Date, Date] | undefined {
  if (timestamps.fromTimestamp && timestamps.toTimestamp) {
    return [timestamps.fromTimestamp, timestamps.toTimestamp]
  }
  return undefined
}

export function CustomFilter({
  clearFilter,
  onChangeTimestamp,
  onChangeClearTimestamp,
  isOpenTimestamp,
  timestamps,
  setIsOpenTimestamp,
  organization,
}: CustomFilterProps) {
  const [searchParams] = useSearchParams()

  // Calculate retention days and determine if we need to enforce 30-day limit
  const retentionDays = organization?.organization_plan?.audit_logs_retention_in_days ?? 30
  const maxRangeInDays = retentionDays > 30 ? 30 : undefined

  return (
    <>
      <div className="mr-2">
        <DatePicker
          key={timestamps.fromTimestamp ? timestamps.fromTimestamp.toString() : 'timestamp'}
          onChange={onChangeTimestamp}
          isOpen={isOpenTimestamp}
          maxDate={new Date()}
          minDate={subDays(new Date(), retentionDays)}
          defaultDates={getDefaultDates(timestamps)}
          showDateTimeInputs
          useLocalTime
          onClickOutside={() => setIsOpenTimestamp(!isOpenTimestamp)}
          maxRangeInDays={maxRangeInDays}
        >
          {!timestamps.fromTimestamp && !timestamps.toTimestamp ? (
            <Button
              data-testid="timeframe-button"
              type="button"
              variant="surface"
              color="neutral"
              className="gap-2"
              size="md"
              onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
            >
              Timeframe
              <Icon iconName="calendar-day" iconStyle="regular" />
            </Button>
          ) : (
            <Button
              type="button"
              data-testid="timeframe-values"
              className="whitespace-nowrap"
              variant={timestamps.automaticallySelected ? 'surface' : 'solid'}
              color={timestamps.automaticallySelected ? 'neutral' : 'brand'}
              size="md"
              onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
            >
              {timestamps.automaticallySelected ? (
                <>
                  30d <Icon iconName="calendar-day" className="pl-2" />
                </>
              ) : (
                <>
                  from: {dateYearMonthDayHourMinuteSecond(timestamps.fromTimestamp ?? new Date(), true, false)} - to:{' '}
                  {dateYearMonthDayHourMinuteSecond(timestamps.toTimestamp ?? new Date(), true, false)}
                  <span
                    data-testid="clear-timestamp"
                    className="relative left-1 px-1 py-1"
                    role="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onChangeClearTimestamp()
                    }}
                  >
                    <Icon iconName="xmark" />
                  </span>
                </>
              )}
            </Button>
          )}
        </DatePicker>
      </div>
      <div className="relative flex w-full items-center gap-1 text-ssm font-medium text-neutral-350">
        {searchParams.toString()?.length > 0 && (
          <Button className="ml-1 gap-2" size="md" color="neutral" variant="surface" onClick={clearFilter}>
            Clear all
            <Icon iconName="xmark" iconStyle="regular" />
          </Button>
        )}
      </div>
    </>
  )
}

export default CustomFilter
