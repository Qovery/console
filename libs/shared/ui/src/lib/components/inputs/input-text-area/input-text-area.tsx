import { useRef, useState } from 'react'

export interface InputTextAreaProps {
  label: string
  name: string
  value?: string | undefined
  onChange?: () => void
  className?: string
}

export function InputTextArea(props: InputTextAreaProps) {
  const { label, value, name, onChange, className } = props

  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)

  const hasFocus = focused || (value && value.length > 0)
  const inputActions = hasFocus ? 'input--focused' : ''

  return (
    <div className={className} onClick={() => inputRef.current?.querySelector('textarea')?.focus()}>
      <div aria-label="textarea-container" className={`input pb-0 pr-2 ${inputActions}`} ref={inputRef}>
        <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>
          {label}
        </label>
        <textarea
          name={name}
          id={label}
          className="w-full min-h-[52px] mt-5 pr-3 bg-transparent appearance-none text-sm text-text-700 outline-0"
          defaultValue={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  )
}

export default InputTextArea
