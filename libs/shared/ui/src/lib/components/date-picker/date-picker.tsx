import { useState } from 'react'
import DatePickerLib from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// export interface DatePickerProps {
//   description: string
//   links?: BaseLink[]
//   className?: string
// }

export function DatePicker() {
  const [isOpen, setIsOpen] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(null)

  const handleChange = (e: any) => {
    setIsOpen(!isOpen)
    // setStartDate(e);
  }
  const handleClick = (e: any) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }
  return (
    <>
      <button onClick={handleClick}>test</button>
      {isOpen && (
        <DatePickerLib
          selected={startDate}
          onChange={handleChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
        />
      )}
    </>
  )
}

export default DatePicker
