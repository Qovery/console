import { useRef, useState } from 'react'
import Icon from '../../icon/icon'

export interface InputTextProps {
  name: string
  label: string
  value?: string | number | undefined
  type?: string
  className?: string
  onChange?: () => void
  error?: string
  disabled?: boolean
  dataTestId?: string
  rightFloatingComponent?: React.ReactNode
}

export function InputText(props: InputTextProps) {
  const { name, label, value, onChange, type = 'text', error, className = '', disabled, rightFloatingComponent, dataTestId } = props

  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)

  const hasFocus = focused || (value?.toString() && value?.toString().length > 0)

  const hasError = error && error.length > 0 ? 'input--error' : ''

  const inputActions = hasFocus
    ? 'input--focused'
    : value?.toString() && value.toString().length > 0
    ? 'input--success'
    : disabled
    ? 'input--disabled'
    : ''

  const isDisabled = disabled ? 'input--disabled !border-element-light-lighter-500' : ''

  const displayPicker = () => {
    const input: any = inputRef.current?.querySelector('input')
    if (!disabled) input.showPicker()
  }

  const isInputDate = type === 'time' || type === 'date' || type === 'datetime'

  return (
    <div
      className={className}
      onClick={() => (isInputDate ? displayPicker() : inputRef.current?.querySelector('input')?.focus())}
    >
      <div className="relative">
        <div aria-label="input-container" className={`input ${inputActions} ${isDisabled} ${hasError}`} ref={inputRef}>
          <div className={`${disabled ? 'pointer-events-none' : ''}`}>
            <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>
              {label}
            </label>
            <input
              data-testid={dataTestId || 'input-text'}
              name={name}
              id={label}
              className="input__value"
              defaultValue={value}
              type={type}
              onChange={onChange}
              disabled={disabled}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {isInputDate && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <Icon name="icon-solid-angle-down" className="text-sm text-text-500" />
              </div>
            )}
          </div>
        </div>
        {!isInputDate && rightFloatingComponent && (
          <div data-testid="right-floating-component" className="absolute top-1/2 -translate-y-1/2 right-4">
            {rightFloatingComponent}
          </div>
        )}
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputText
