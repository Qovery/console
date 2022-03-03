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

  const inputActions = hasFocus
    ? 'input--focused'
    : error && error.length > 0
    ? 'input--error'
    : isValid && value.length > 0
    ? 'input--success'
    : disabled
    ? 'input--disabled'
    : ''

  return (
    <div className={className} onClick={() => inputRef.current && inputRef.current.focus()}>
      <div className={`input ${inputActions}`}>
        <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>
          {label}
        </label>
        <input
          id={label}
          name={name}
          className="input__value"
          type={type}
          value={value}
          ref={inputRef}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => inputChange(e.target.value)}
        />
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputText
