import clsx from 'clsx'
import { type ChangeEventHandler, type ReactNode, forwardRef, useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
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
  placeholder?: string
  autoFocus?: boolean
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
    placeholder,
    autoFocus,
  } = props

  const [focused, setFocused] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)
  const [currentValue, setCurrentValue] = useState(value)
  const [currentType, setCurrentType] = useState(type)

  useLayoutEffect(() => {
    setCurrentValue(value)
  }, [value, setCurrentValue])

  const hasFocus = focused
  const hasValue = Boolean(currentValue?.toString()?.length)
  const hasLabelUp = hasFocus || hasValue || Boolean(placeholder)
  const hasError = Boolean(error?.length)

  const displayPicker = () => {
    const input = inputRef.current?.querySelector('input')
    if (!disabled && input) {
      try {
        input.showPicker()
      } catch (error) {
        // Ignore showPicker errors (e.g., when called without user gesture)
        console.debug('showPicker failed:', error)
      }
    }
  }

  const isInputDate = type === 'time' || type === 'date' || type === 'datetime'
  const inputContainerClassName = twMerge(
    clsx('input group', {
      'input--focused': hasFocus,
      'input--disabled': disabled,
      '!border-neutral': disabled,
      'input--error': hasError,
      'input--label-up': hasLabelUp,
    })
  )
  const labelClassName = twMerge(
    clsx('input__label', {
      'text-xs': hasFocus,
      'translate-y-2 text-sm': !hasFocus,
      'transition-none': !hasInteracted,
    })
  )
  const inputValueClassName = twMerge(
    clsx('input__value', {
      '!pr-9': Boolean(rightElement),
    })
  )

  return (
    <div
      className={className}
      onClick={() => (isInputDate ? displayPicker() : inputRef.current?.querySelector('input')?.focus())}
      data-testid={`${dataTestId || 'input-text'}-wrapper`}
    >
      <div className="relative">
        <div aria-label="input-container" className={inputContainerClassName} ref={inputRef}>
          <div className={clsx({ 'pointer-events-none': disabled })}>
            <label htmlFor={label} className={labelClassName}>
              {label}
            </label>
            <input
              data-testid={dataTestId || 'input-text'}
              ref={ref}
              name={name}
              id={label}
              className={inputValueClassName}
              type={currentType}
              disabled={disabled}
              value={currentValue}
              placeholder={placeholder}
              autoFocus={autoFocus}
              onChange={(e) => {
                setHasInteracted(true)
                if (onChange) onChange(e)
                setCurrentValue(e.currentTarget.value)
              }}
              onFocus={() => {
                setHasInteracted(true)
                setFocused(true)
              }}
              onBlur={() => setFocused(false)}
            />
            {isInputDate && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Icon iconName="angle-down" className="text-sm text-neutral-subtle group-hover:text-neutral" />
              </div>
            )}
            {hasValue && type === 'password' && (
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral transition-colors hover:text-neutral"
                onClick={() => (currentType === 'password' ? setCurrentType('text') : setCurrentType('password'))}
              >
                {currentType === 'password' && <Icon iconName="eye" className="text-sm" />}
                {currentType !== 'password' && <Icon iconName="eye-slash" className="text-sm" />}
              </div>
            )}
          </div>
        </div>
        {!isInputDate && rightElement && (
          <div
            data-testid="right-floating-component"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-subtle hover:text-neutral"
          >
            {rightElement}
          </div>
        )}
      </div>
      {hint && !error && <p className="mt-0.5 px-3 text-xs text-neutral-subtle">{hint}</p>}
      {error && <p className="mt-0.5 px-3 text-xs text-negative">{error}</p>}
    </div>
  )
})

export default InputText
