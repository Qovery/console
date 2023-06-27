import { addMonths } from 'date-fns'
import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { useSearchParams } from 'react-router-dom'
import { Button, ButtonSize, ButtonStyle, DatePicker, Icon, IconAwesomeEnum, InputFilter } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/utils'

export interface CustomFilterProps {
  onChangeTimestamp: (startDate: Date, endDate: Date) => void
  onChangeClearTimestamp: () => void
  isOpenTimestamp: boolean
  setIsOpenTimestamp: (isOpen: boolean) => void
  onChangeType: (value?: string | string[]) => void
  clearFilter: () => void
  timestamps?: [Date, Date]
}

export function CustomFilter({
  onChangeType,
  clearFilter,
  onChangeTimestamp,
  onChangeClearTimestamp,
  isOpenTimestamp,
  timestamps,
  setIsOpenTimestamp,
}: CustomFilterProps) {
  const [searchParams] = useSearchParams()

  return (
    <>
      <p className="text-text-400 text-ssm font-medium mr-1.5">Select</p>
      <div className="mr-5">
        <DatePicker
          key={timestamps ? timestamps[0].toString() : 'timestamp'}
          onChange={onChangeTimestamp}
          isOpen={isOpenTimestamp}
          maxDate={new Date()}
          minDate={addMonths(new Date(), -1)}
          defaultDates={timestamps}
          showTimeInput
        >
          {!timestamps ? (
            <Button
              dataTestId="timeframe-button"
              className={`${isOpenTimestamp ? 'btn--active' : ''}`}
              onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
              style={ButtonStyle.STROKED}
              size={ButtonSize.TINY}
              iconRight={IconAwesomeEnum.CLOCK}
            >
              Timeframe
            </Button>
          ) : (
            <Button
              dataTestId="timeframe-values"
              onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
              size={ButtonSize.TINY}
            >
              from: {dateYearMonthDayHourMinuteSecond(timestamps[0], true, false)} - to:{' '}
              {dateYearMonthDayHourMinuteSecond(timestamps[1], true, false)}
              <span
                data-testid="clear-timestamp"
                className="px-1 py-1 relative left-1"
                role="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onChangeClearTimestamp()
                }}
              >
                <Icon name={IconAwesomeEnum.CROSS} />
              </span>
            </Button>
          )}
        </DatePicker>
      </div>
      <div className="flex items-center relative z-20 text-text-400 text-ssm font-medium">
        <p className=" mr-1.5">Search</p>
        <InputFilter
          name="Type"
          options={Object.keys(OrganizationEventTargetType).map((type) => ({
            label: upperCaseFirstLetter(type)?.split('_').join(' ') || '',
            value: type,
          }))}
          onChange={onChangeType}
          defaultValue={searchParams.get('targetType') as string}
        />
        {searchParams.toString().length > 0 && (
          <span className="link text-brand-500 cursor-pointer ml-6" onClick={clearFilter}>
            Clear all
          </span>
        )}
      </div>
    </>
  )
}

export default CustomFilter
