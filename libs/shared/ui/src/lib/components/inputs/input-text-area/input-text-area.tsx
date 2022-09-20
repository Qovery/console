import { FormEvent, useEffect, useRef, useState } from 'react'

export interface InputTextAreaProps {
  label: string
  name: string
  value?: string | undefined
  onChange?: (e: FormEvent<HTMLTextAreaElement>) => void
  className?: string
  disabled?: boolean
  error?: string
  dataTestId?: string
}

export function InputTextArea(props: InputTextAreaProps) {
  const { label, value = '', name, onChange, className, error, dataTestId = 'input-textarea' } = props

  const [currentValue, setCurrentValue] = useState(value)

  useEffect(() => {
    if (value) setCurrentValue(value)
  }, [value, setCurrentValue])

  const [focused, setFocused] = useState(false)

  const inputRef = useRef<HTMLDivElement>(null)

  const hasFocus = focused
  const hasLabelUp = hasFocus || (value && value.length > 0) ? 'input--label-up' : ''
  const hasError = error && error.length > 0 ? 'input--error' : ''
  const inputActions = hasFocus ? 'input--focused' : ''

  const isDisabled = props.disabled ? 'input--disabled !border-element-light-lighter-500' : ''

  return (
    <div
      data-testid={dataTestId}
      className={className}
      onClick={() => inputRef.current?.querySelector('textarea')?.focus()}
    >
      <div
        aria-label="textarea-container"
        className={`input pb-0 pr-2 ${inputActions} ${hasError} ${isDisabled} ${hasLabelUp}`}
        ref={inputRef}
      >
        <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>
          {label}
        </label>
        <textarea
          name={name}
          id={label}
          className="w-full min-h-[52px] mt-5 pr-3 bg-transparent appearance-none text-sm text-text-700 outline-0"
          value={currentValue}
          onChange={(e) => {
            if (onChange) onChange(e)
            setCurrentValue(e.currentTarget.value)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={props.disabled}
        />
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputTextArea
