import {
  type ChangeEventHandler,
  type ReactNode,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
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
  autoComplete?: string
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
    autoComplete = 'off',
  } = props

  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)
  const previousValueRef = useRef(value)
  const [currentValue, setCurrentValue] = useState(value)
  const [currentType, setCurrentType] = useState(type)
  const [isLabelTransitionDisabled, setIsLabelTransitionDisabled] = useState(Boolean(value?.toString().length))

  // TODO(new-inputs): remove this workaround once the floating label logic is handled by the new inputs.
  // It keeps the label transition disabled for one frame when a prop value is injected after mount.
  useLayoutEffect(() => {
    if (previousValueRef.current === value) return

    previousValueRef.current = value
    setIsLabelTransitionDisabled(true)
    setCurrentValue(value)
  }, [value])

  useEffect(() => {
    if (!isLabelTransitionDisabled) return

    const frameId = requestAnimationFrame(() => setIsLabelTransitionDisabled(false))

    return () => cancelAnimationFrame(frameId)
  }, [isLabelTransitionDisabled])

  const hasFocus = focused
  const hasValue = Boolean(currentValue?.toString().length)
  const hasLabelUp = hasFocus || hasValue || Boolean(placeholder) ? 'input--label-up' : ''
  const hasError = error && error.length > 0 ? 'input--error' : ''
  const inputActions = hasFocus ? 'input--focused' : disabled ? 'input--disabled' : ''
  const isDisabled = disabled ? 'input--disabled !border-neutral' : ''

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
  const labelClassName = twMerge(
    'input__label',
    hasFocus ? 'text-xs' : 'translate-y-2 text-sm',
    isLabelTransitionDisabled && '!transition-none'
  )

  return (
    <div
      className={className}
      onClick={() => (isInputDate ? displayPicker() : inputRef.current?.querySelector('input')?.focus())}
      data-testid={`${dataTestId || 'input-text'}-wrapper`}
    >
      <div className="relative">
        <div
          aria-label="input-container"
          className={twMerge('input group', inputActions, isDisabled, hasError, hasLabelUp)}
          ref={inputRef}
        >
          <div className={twMerge(disabled && 'pointer-events-none')}>
            <label htmlFor={label} className={labelClassName}>
              {label}
            </label>
            <input
              data-testid={dataTestId || 'input-text'}
              ref={ref}
              name={name}
              id={label}
              className={twMerge('input__value', rightElement && '!pr-9')}
              type={currentType}
              disabled={disabled}
              value={currentValue}
              placeholder={placeholder}
              autoFocus={autoFocus}
              autoComplete={autoComplete}
              onChange={(e) => {
                if (onChange) onChange(e)
                setCurrentValue(e.currentTarget.value)
              }}
              onFocus={() => setFocused(true)}
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
