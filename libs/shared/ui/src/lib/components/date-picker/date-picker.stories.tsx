import { type Meta, type StoryObj } from '@storybook/react-webpack5'
import { useEffect, useState } from 'react'
import { DatePicker } from './date-picker'

const periodOptions = [
  { label: 'Last 5 minutes', value: '5m' },
  { label: 'Last 15 minutes', value: '15m' },
  { label: 'Last 30 minutes', value: '30m' },
  { label: 'Last 1 hour', value: '1h' },
  { label: 'Last 3 hours', value: '3h', isDisabled: true },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 12 hours', value: '12h', isLocked: true },
  { label: 'Last 24 hours', value: '24h', isLocked: true, isDisabled: true },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d', isDisabled: true },
]

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  title: 'DatePicker',
  argTypes: {
    isOpen: { control: 'boolean' },
    showCalendar: { control: 'boolean' },
    showPeriodSelect: { control: 'boolean' },
    showTimezoneSelect: { control: 'boolean' },
    showTimeInput: { control: 'boolean' },
    useLocalTime: { control: 'boolean' },
    maxRangeInDays: { control: 'number' },
    periodValue: {
      control: { type: 'select' },
      options: periodOptions.map((option) => option.value),
    },
  },
  args: {
    isOpen: true,
    showCalendar: true,
    showPeriodSelect: true,
    showTimezoneSelect: true,
    showTimeInput: true,
    useLocalTime: true,
    timezoneLabel: 'Timezone',
    lockedLabel: 'Unlock Observe',
    maxDate: new Date(),
  },
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Playground: Story = {
  render: (args) => {
    const [, setDate] = useState<[Date, Date] | undefined>()
    const [useLocalTime, setUseLocalTime] = useState(Boolean(args.useLocalTime))
    const [periodValue, setPeriodValue] = useState(args.periodValue)

    const handleChange = (startDate: Date, endDate?: Date) => {
      if (endDate) setDate([startDate, endDate])
    }

    useEffect(() => {
      setUseLocalTime(Boolean(args.useLocalTime))
    }, [args.useLocalTime])

    useEffect(() => {
      setPeriodValue(args.periodValue)
    }, [args.periodValue])

    return (
      <div style={{ height: '600px', paddingBottom: '400px', paddingLeft: '20px' }}>
        <DatePicker
          {...args}
          isOpen={args.isOpen}
          onChange={handleChange}
          useLocalTime={useLocalTime}
          onTimezoneChange={setUseLocalTime}
          periodOptions={periodOptions}
          periodValue={periodValue}
          onPeriodChange={setPeriodValue}
        />
      </div>
    )
  },
}
