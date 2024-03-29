import { type Meta, type Story } from '@storybook/react'
import { useState } from 'react'
import { dateFullFormat } from '@qovery/shared/util-dates'
import ButtonLegacy from '../buttons/button-legacy/button-legacy'
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
    <>
      <DatePicker onChange={handleChange} isOpen={isOpen} showTimeInput>
        <ButtonLegacy className="inline-flex" onClick={() => setIsOpen(!isOpen)}>
          Open date-picker
        </ButtonLegacy>
      </DatePicker>
      <p className="mt-1 text-neutral-400 font-medium">
        {date && dateFullFormat(date[0].toString())} - {date && dateFullFormat(date[1].toString())}
      </p>
    </>
  )
}

export const Primary = Template.bind({})
