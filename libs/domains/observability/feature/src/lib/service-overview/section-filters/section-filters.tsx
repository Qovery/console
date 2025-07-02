import { Checkbox, InputSelectSmall, Section } from '@qovery/shared/ui'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'
import { type TimeRangeOption, timeRangeOptions } from '../util-filter/time-range'

export function SectionFilters() {
  const {
    useLocalTime,
    setUseLocalTime,
    timeRange,
    handleTimeRangeChange,
    hideEvents,
    setHideEvents,
    expandCharts,
    setExpandCharts,
  } = useServiceOverviewContext()

  return (
    <Section className="flex-row items-center justify-between px-4 py-2">
      <div className="flex items-center gap-4">
        <span className="mr-1.5 text-ssm font-medium text-neutral-350">Filters:</span>
        <div className="flex gap-2">
          <InputSelectSmall
            name="timezone"
            className="w-28"
            items={[
              { label: 'Local Time', value: 'local' },
              { label: 'UTC', value: 'utc' },
            ]}
            defaultValue={useLocalTime ? 'local' : 'utc'}
            onChange={(e) => setUseLocalTime(e === 'local')}
          />
          <InputSelectSmall
            name="time-range"
            className="w-44 text-ssm"
            items={timeRangeOptions}
            defaultValue={timeRange}
            onChange={(e) => handleTimeRangeChange(e as TimeRangeOption)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="hide-events"
            name="hide-events"
            className="h-4 w-4 min-w-4 text-ssm"
            checked={hideEvents}
            onCheckedChange={(checked) => setHideEvents(checked as boolean)}
          />
          <label htmlFor="hide-events" className="text-ssm font-medium text-neutral-400">
            Hide events
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="expand-charts"
            name="expand-charts"
            className="h-4 w-4 min-w-4 text-ssm"
            checked={expandCharts}
            onCheckedChange={(checked) => setExpandCharts(checked as boolean)}
          />
          <label htmlFor="expand-charts" className="text-ssm font-medium text-neutral-400">
            Expand charts
          </label>
        </div>
      </div>
    </Section>
  )
}

export default SectionFilters
