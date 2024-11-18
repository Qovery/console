import { type FormEvent, type ReactNode, forwardRef, useEffect, useRef, useState } from 'react'

export interface InputTextAreaProps {
  label: string
  name: string
  value?: string | null
  onChange?: (e: FormEvent<HTMLTextAreaElement>) => void
  className?: string
  disabled?: boolean
  hint?: ReactNode
  error?: string
  dataTestId?: string
}

export const InputTextArea = forwardRef<HTMLTextAreaElement, InputTextAreaProps>(function InputTextArea(props, ref) {
  const { label, value = '', name, onChange, className, hint, error, dataTestId = 'input-textarea' } = props

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

  const isDisabled = props.disabled ? 'input--disabled !border-neutral-250' : ''

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
        <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'translate-y-2 text-sm'}`}>
          {label}
        </label>
        <textarea
          ref={ref}
          name={name}
          id={label}
          className="mt-5 min-h-[52px] w-full appearance-none bg-transparent pr-3 text-sm text-neutral-400 outline-0"
          value={!currentValue ? undefined : currentValue}
          onChange={(e) => {
            if (onChange) onChange(e)
            setCurrentValue(e.currentTarget.value)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={props.disabled}
        />
      </div>
      {hint && <p className="mt-0.5 px-3 text-xs font-normal text-neutral-350">{hint}</p>}
      {error && <p className="mt-1 px-3 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
})

export default InputTextArea
