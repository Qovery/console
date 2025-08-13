import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DatePicker } from './date-picker'

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  title: 'DatePicker',
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Primary: Story = {
  render: () => {
    const [date, setDate] = useState<[Date, Date] | undefined>()

    const handleChange = (startDate: Date, endDate?: Date) => {
      if (endDate) setDate([startDate, endDate])
    }

    return (
      <div style={{ height: '600px', paddingBottom: '400px' }}>
        <DatePicker onChange={handleChange} isOpen={true} showTimeInput />
      </div>
    )
  },
}
