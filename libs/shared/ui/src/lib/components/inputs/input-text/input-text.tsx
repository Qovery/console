import { useRef, useState } from 'react'

export interface InputTextProps {
  name: string
  label: string
  type?: string
  defaultValue?: string
  getValue?: (name: string, value: string) => void
  error?: string
  isValid?: boolean
  disabled?: boolean
  className?: string
}

export function InputText(props: InputTextProps) {
  const {
    label,
    getValue,
    name,
    error,
    isValid,
    disabled = false,
    type = 'text',
    defaultValue = '',
    className = '',
  } = props

  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  const inputChange = (value: string) => {
    setValue(value)
    if (getValue) getValue(name, value)
  }

  const hasFocus = focused || value.length > 0

  const borderColors = hasFocus
    ? 'border-brand-500'
    : error && error.length > 0
    ? 'border-error-500'
    : isValid && value.length > 0
    ? 'border-success-500'
    : 'border-element-light-lighter-500'

  const isDisabled = disabled
    ? 'bg-element-light-lighter-200 border-element-light-lighter-500 pointer-events-none'
    : 'bg-white'

  return (
    <div
      className={className}
      onClick={() => {
        setFocused(true)
        inputRef.current && inputRef.current.focus()
      }}
    >
      <div className={`relative h-[52px] px-4 py-2 rounded-sm border ${borderColors} ${isDisabled}`}>
        <label
          htmlFor={label}
          className={`absolute ease-in-out duration-[120ms] ${hasFocus ? 'text-xs' : 'text-sm translate-y-2'} ${
            disabled ? 'text-text-400' : 'text-text-500'
          }`}
        >
          {label}
        </label>
        <input
          id={label}
          name={name}
          type={type}
          value={value}
          ref={inputRef}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => inputChange(e.target.value)}
          className="absolute left-0 bottom-2 w-full px-4 bg-transparent appearance-none ring-0 text-xs text-text-700 outline-0"
        />
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputText
