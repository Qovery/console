import InputTextSmall from '../../inputs/input-text-small/input-text-small'

export type DateTimeInputType = 'startDate' | 'startTime' | 'endDate' | 'endTime'

interface DatePickerDateTimeInputsProps {
  startDateText: string
  startTimeText: string
  endDateText: string
  endTimeText: string
  startDateError: string
  startTimeError: string
  endDateError: string
  endTimeError: string
  onInputChange: (type: DateTimeInputType, value: string) => void
}

const DateTimeInputGroup = ({
  label,
  dateName,
  timeName,
  dateType,
  timeType,
  dateValue,
  timeValue,
  dateError,
  timeError,
  onInputChange,
}: {
  label: string
  dateName: string
  timeName: string
  dateType: DateTimeInputType
  timeType: DateTimeInputType
  dateValue: string
  timeValue: string
  dateError: string
  timeError: string
  onInputChange: (type: DateTimeInputType, value: string) => void
}) => (
  <div>
    <div className="mb-1 flex items-center justify-between">
      <p className="text-sm text-neutral">{label}</p>
      {(dateError || timeError) && <span className="text-xs text-negative">{dateError || timeError}</span>}
    </div>
    <div className="flex gap-2">
      <InputTextSmall
        label="Date"
        name={dateName}
        type="text"
        className="flex-1"
        value={dateValue}
        onChange={(event) => onInputChange(dateType, event.target.value)}
      />
      <InputTextSmall
        label="Time"
        name={timeName}
        type="text"
        className="w-20"
        value={timeValue}
        onChange={(event) => onInputChange(timeType, event.target.value)}
      />
    </div>
  </div>
)

export function DatePickerDateTimeInputs({
  startDateText,
  startTimeText,
  endDateText,
  endTimeText,
  startDateError,
  startTimeError,
  endDateError,
  endTimeError,
  onInputChange,
}: DatePickerDateTimeInputsProps) {
  return (
    <div className="space-y-3">
      <DateTimeInputGroup
        label="Start"
        dateName="start-date"
        timeName="start-time"
        dateType="startDate"
        timeType="startTime"
        dateValue={startDateText}
        timeValue={startTimeText}
        dateError={startDateError}
        timeError={startTimeError}
        onInputChange={onInputChange}
      />
      <DateTimeInputGroup
        label="End"
        dateName="end-date"
        timeName="end-time"
        dateType="endDate"
        timeType="endTime"
        dateValue={endDateText}
        timeValue={endTimeText}
        dateError={endDateError}
        timeError={endTimeError}
        onInputChange={onInputChange}
      />
    </div>
  )
}

export default DatePickerDateTimeInputs
