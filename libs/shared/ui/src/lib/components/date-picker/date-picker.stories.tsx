import { Meta, Story } from '@storybook/react'
import { useState } from 'react'
import { dateFullFormat } from '@qovery/shared/utils'
import Button from '../buttons/button/button'
import { DatePicker } from './date-picker'

export default {
  component: DatePicker,
  title: 'DatePicker',
} as Meta

const Template: Story = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<[Date, Date] | undefined>()

  const handleChange = (startDate: Date, endDate?: Date) => {
    if (endDate) setDate([startDate, endDate])
    setIsOpen(!isOpen)
  }

  return (
    <div>
      <Button className="inline-flex" onClick={() => setIsOpen(!isOpen)}>
        Open date-picker
      </Button>
      {isOpen && <DatePicker onChange={handleChange} />}
      <p className="mt-1 text-text-700 font-medium">
        {date && dateFullFormat(date[0].toString())} - {date && dateFullFormat(date[1].toString())}
      </p>
    </div>
  )
}

export const Primary = Template.bind({})
