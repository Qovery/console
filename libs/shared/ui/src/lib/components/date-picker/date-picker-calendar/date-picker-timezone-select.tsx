import Icon from '../../icon/icon'

interface DatePickerTimezoneSelectProps {
  selectedTimezoneLabel: string
  timezoneValue: 'local' | 'utc'
  timezoneOptions: Array<{ label: string; value: string }>
  onTimezoneChange?: (useLocalTime: boolean) => void
}

export function DatePickerTimezoneSelect({
  selectedTimezoneLabel,
  timezoneValue,
  timezoneOptions,
  onTimezoneChange,
}: DatePickerTimezoneSelectProps) {
  return (
    <div className="relative my-1 flex w-full items-center justify-center gap-1 text-xs font-medium  text-neutral-subtle transition-colors hover:text-neutral">
      <span>{selectedTimezoneLabel}</span>
      <Icon iconName="chevron-down" iconStyle="regular" className="pointer-events-none text-xs" />
      <select
        name="timezone"
        value={timezoneValue}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        onChange={(event) => {
          onTimezoneChange?.(event.target.value === 'local')
        }}
      >
        {timezoneOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default DatePickerTimezoneSelect
