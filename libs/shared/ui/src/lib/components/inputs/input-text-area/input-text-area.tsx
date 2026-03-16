import { type FormEvent, type ReactNode, forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'

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
  const previousValueRef = useRef(value)
  const [isLabelTransitionDisabled, setIsLabelTransitionDisabled] = useState(Boolean(value?.length))

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

  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)

  const hasFocus = focused
  const hasValue = Boolean(currentValue?.length)
  const hasLabelUp = hasFocus || hasValue ? 'input--label-up' : ''
  const hasError = error && error.length > 0 ? 'input--error' : ''
  const inputActions = hasFocus ? 'input--focused' : ''
  const isDisabled = props.disabled ? 'input--disabled !border-neutral' : ''
  const labelClassName = twMerge(
    'input__label',
    hasFocus ? 'text-xs' : 'translate-y-2 text-sm',
    isLabelTransitionDisabled && '!transition-none'
  )

  return (
    <div
      data-testid={dataTestId}
      className={className}
      onClick={() => inputRef.current?.querySelector('textarea')?.focus()}
    >
      <div
        aria-label="textarea-container"
        className={twMerge('input pb-0 pr-2', inputActions, hasError, isDisabled, hasLabelUp)}
        ref={inputRef}
      >
        <label htmlFor={label} className={labelClassName}>
          {label}
        </label>
        <textarea
          ref={ref}
          name={name}
          id={label}
          className="mt-5 min-h-[52px] w-full appearance-none bg-transparent pr-3 text-sm text-neutral outline-0"
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
      {hint && !error && <p className="mt-0.5 px-3 text-xs font-normal text-neutral-subtle">{hint}</p>}
      {error && <p className="mt-1 px-3 text-xs font-medium text-negative">{error}</p>}
    </div>
  )
})

export default InputTextArea
