import { useRef, useState } from 'react'

export interface InputTextAreaProps {
  label: string
  name: string
  value?: string | undefined
  onChange?: () => void
  className?: string
  error?: string
}

export function InputTextArea(props: InputTextAreaProps) {
  const { label, value, name, onChange, className, error } = props

  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)

  const hasFocus = focused || (value && value.length > 0)
  const hasError = error && error.length > 0 ? 'input--error' : ''
  const inputActions = hasFocus ? 'input--focused' : ''

  return (
    <div className={className} onClick={() => inputRef.current?.querySelector('textarea')?.focus()}>
      <div aria-label="textarea-container" className={`input pb-0 pr-2 ${inputActions} ${hasError}`} ref={inputRef}>
        <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>
          {label}
        </label>
        <textarea
          name={name}
          id={label}
          className="w-full min-h-[52px] mt-5 pr-3 bg-transparent appearance-none text-sm text-text-700 outline-0"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputTextArea
