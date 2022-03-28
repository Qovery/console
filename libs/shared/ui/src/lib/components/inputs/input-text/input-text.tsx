import { useRef, useState } from 'react'

export interface InputTextProps {
  name: string
  label: string
  value?: string | undefined
  type?: string
  className?: string
  onChange?: () => void
  error?: string
  disabled?: boolean
}

export function InputText(props: InputTextProps) {
  const { name, label, value, onChange, type = 'text', error, className = '', disabled } = props

  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)

  const hasFocus = focused || (value && value.length > 0)

  const hasError = error && error.length > 0 ? 'input--error' : ''

  const inputActions = hasFocus
    ? 'input--focused'
    : value && value.length > 0
    ? 'input--success'
    : disabled
    ? 'input--disabled'
    : ''

  return (
    <div className={className} onClick={() => inputRef.current?.querySelector('input')?.focus()}>
      <div aria-label="input-container" className={`input ${inputActions} ${hasError}`} ref={inputRef}>
        <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>
          {label}
        </label>
        <input
          name={name}
          id={label}
          className="input__value"
          defaultValue={value}
          type={type}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputText
