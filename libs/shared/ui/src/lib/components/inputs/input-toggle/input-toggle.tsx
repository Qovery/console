import { useState } from 'react'

export interface InputToggleProps {
  small?: boolean
}

export function InputToggle(props: InputToggleProps) {
  const { small } = props

  const [toggleActive, setToggleActive] = useState(false)

  const toggleSizeBg = small ? 'w-6 h-3.5' : 'w-12 h-6'
  const toggleSizeCircle = small ? 'w-2.5 h-2.5' : 'w-5 h-5'

  return (
    <div
      aria-label="toggle-btn"
      className="inline-flex justify-between items-center"
      onClick={() => setToggleActive(!toggleActive)}
    >
      <div
        aria-label="bg"
        className={`${toggleSizeBg} flex items-center rounded-full p-0.5 duration-300 ease-in-out ${
          toggleActive
            ? `${small ? 'bg-success-500' : 'bg-brand-500'}`
            : `${small ? 'bg-element-light-lighter-600' : 'bg-gray-300'}`
        }`}
      >
        <div
          aria-label="circle"
          className={`${toggleSizeCircle} bg-white rounded-full shadow-lg transform duration-300 ease-in-out ${
            toggleActive ? `${small ? 'translate-x-2.5' : 'translate-x-6'}` : ''
          }`}
        ></div>
      </div>
    </div>
  )
}

export default InputToggle
