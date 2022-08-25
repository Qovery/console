import { ReactNode, useEffect, useState } from 'react'

export interface InputToggleProps {
  small?: boolean
  value?: boolean
  onChange?: (e: boolean) => void
  title?: string | ReactNode
  description?: string
  className?: string
  dataTestId?: string
  forceAlignTop?: boolean
  disabled?: boolean
}

export function InputToggle(props: InputToggleProps) {
  const {
    small,
    value = false,
    onChange,
    description,
    title,
    className = '',
    forceAlignTop = false,
    disabled = false,
  } = props

  const [toggleActive, setToggleActive] = useState(value)

  useEffect(() => {
    setToggleActive(value)
  }, [value])

  const toggleSizeBg = small ? 'w-8 h-4.5' : 'w-12 h-6'
  const toggleSizeCircle = small ? 'w-3.5 h-3.5' : 'w-5 h-5'

  const changeToggle = () => {
    if (disabled) return
    onChange && onChange(!toggleActive)
    setToggleActive(!toggleActive)
  }

  return (
    <div
      data-testid="input-toggle"
      className={`flex  ${description && !forceAlignTop ? 'items-center' : 'items-start'} ${className} ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <div
        data-testid={props.dataTestId || 'input-toggle-button'}
        aria-label="toggle-btn"
        className={`inline-flex justify-between items-center ${!disabled ? 'cursor-pointer' : ''}`}
        onClick={changeToggle}
      >
        <input
          type="checkbox"
          defaultChecked={toggleActive}
          defaultValue={toggleActive.toString()}
          className="hidden"
          disabled={disabled}
        />
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
      <div
        onClick={changeToggle}
        className={`${description && forceAlignTop ? 'relative -top-1' : ''} ml-3 ${!disabled ? 'cursor-pointer' : ''}`}
      >
        {title && <p className="text-text-600 text-ssm font-medium">{title}</p>}
        {description && <div className="text-xs text-text-400">{description}</div>}
      </div>
    </div>
  )
}

export default InputToggle
