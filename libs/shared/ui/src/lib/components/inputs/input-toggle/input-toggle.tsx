import { useEffect, useState } from 'react'

export interface InputToggleProps {
  small?: boolean
  value?: boolean
  onChange?: (e: boolean) => void
  title?: string
  description?: string
  className?: string
}

export function InputToggle(props: InputToggleProps) {
  const { small, value = false, onChange, description, title, className = '' } = props

  const [toggleActive, setToggleActive] = useState(value)

  useEffect(() => {
    value && setToggleActive(value)
  }, [value])

  const toggleSizeBg = small ? 'w-8 h-4.5' : 'w-12 h-6'
  const toggleSizeCircle = small ? 'w-3.5 h-3.5' : 'w-5 h-5'

  const changeToggle = () => {
    onChange && onChange(!toggleActive)
    setToggleActive(!toggleActive)
  }

  return (
    <div className={`flex items-start ${className}`}>
      <div aria-label="toggle-btn" className="inline-flex justify-between items-center" onClick={changeToggle}>
        <div
          aria-label="bg"
          className={`${toggleSizeBg} flex items-center rounded-full p-0.5 duration-300 ease-in-out ${
            toggleActive
              ? `${small ? 'bg-brand-500' : 'bg-brand-500'}`
              : `${small ? 'bg-element-light-lighter-600' : 'bg-gray-300'}`
          }`}
        >
          <div
            aria-label="circle"
            className={`${toggleSizeCircle} bg-white rounded-full shadow-lg transform duration-300 ease-in-out ${
              toggleActive ? `${small ? 'translate-x-3.5' : 'translate-x-6'}` : ''
            }`}
          />
        </div>
      </div>
      <div className="ml-3">
        {title && <p className="text-text-600 text-ssm font-medium">{title}</p>}
        {description && <p className="text-xs text-text-400">{description}</p>}
      </div>
    </div>
  )
}

export default InputToggle
