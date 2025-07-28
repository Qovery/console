import { type ChangeEventHandler, type ReactNode, forwardRef, useEffect, useRef, useState } from 'react'
import Icon from '../../icon/icon'

export interface InputTextProps {
  name: string
  label: string
  value?: string | number | undefined
  type?: 'text' | 'number' | 'password' | 'email' | 'date' | 'datetime' | 'time'
  className?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  hint?: ReactNode
  error?: string
  disabled?: boolean
  dataTestId?: string
  rightElement?: ReactNode
}

export const InputText = forwardRef<HTMLInputElement, InputTextProps>(function InputText(props, ref) {
  const {
    name,
    label,
    value = '',
    onChange,
    type = 'text',
    hint,
    error,
    className = '',
    disabled,
    rightElement,
    dataTestId,
  } = props

  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)
  const [currentValue, setCurrentValue] = useState(value)
  const [currentType, setCurrentType] = useState(type)

  useEffect(() => {
    setCurrentValue(value)
  }, [value, setCurrentValue])

  const hasFocus = focused
  const hasLabelUp =
    hasFocus || (currentValue?.toString() && currentValue?.toString().length > 0) ? 'input--label-up' : ''

  const hasError = error && error.length > 0 ? 'input--error' : ''

  const inputActions = hasFocus ? 'input--focused' : disabled ? 'input--disabled' : ''

  const isDisabled = disabled ? 'input--disabled !border-neutral-250' : ''

  const displayPicker = () => {
    const input = inputRef.current?.querySelector('input')
    if (!disabled && input) input.showPicker()
  }

  const isInputDate = type === 'time' || type === 'date' || type === 'datetime'

  return (
    <div
      className={className}
      onClick={() => (isInputDate ? displayPicker() : inputRef.current?.querySelector('input')?.focus())}
      data-testid={`${dataTestId || 'input-text'}-wrapper`}
    >
      <div className="relative">
        <div
          aria-label="input-container"
          className={`input ${inputActions} ${isDisabled} ${hasError} ${hasLabelUp} `}
          ref={inputRef}
        >
          <div className={`${disabled ? 'pointer-events-none' : ''}`}>
            <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'translate-y-2 text-sm'}`}>
              {label}
            </label>
            <input
              data-testid={dataTestId || 'input-text'}
              ref={ref}
              name={name}
              id={label}
              className={`input__value ${rightElement ? '!pr-9' : ''}`}
              type={currentType}
              disabled={disabled}
              value={currentValue}
              onChange={(e) => {
                if (onChange) onChange(e)
                setCurrentValue(e.currentTarget.value)
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {isInputDate && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Icon iconName="angle-down" className="text-sm text-neutral-400" />
              </div>
            )}
            {(currentValue as string)?.length > 0 && type === 'password' && (
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-400"
                onClick={() => (currentType === 'password' ? setCurrentType('text') : setCurrentType('password'))}
              >
                {currentType === 'password' && <Icon iconName="eye" className="text-sm" />}
                {currentType !== 'password' && <Icon iconName="eye-slash" className="text-sm" />}
              </div>
            )}
          </div>
        </div>
        {!isInputDate && rightElement && (
          <div data-testid="right-floating-component" className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {hint && <p className="mt-0.5 px-3 text-xs font-normal text-neutral-350 dark:text-neutral-50">{hint}</p>}
      {error && <p className="mt-0.5 px-3 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
})

export default InputText
