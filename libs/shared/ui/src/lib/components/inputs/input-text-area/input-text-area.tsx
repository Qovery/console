import { useRef, useState } from 'react'

export interface InputTextAreaProps {
  label: string
  name: string
  getValue?: (name: string, value: string) => void
  className?: string
  defaultValue?: string
}

export function InputTextArea(props: InputTextAreaProps) {
  const { label, name, className, getValue, defaultValue = '' } = props

  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const inputChange = (value: string) => {
    setValue(value)
    if (getValue) getValue(name, value)
  }

  const hasFocus = focused || value.length > 0
  const inputActions = hasFocus ? 'input--focused' : ''

  return (
    <div className={className} onClick={() => inputRef.current && inputRef.current.focus()}>
      <div className={`input input--text-area ${inputActions}`}>
        <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>
          {label}
        </label>
        <textarea
          className="w-full h-4 mt-5 pr-3 bg-transparent appearance-none text-sm text-text-700 outline-0"
          id={label}
          ref={inputRef}
          name={name}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => inputChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export default InputTextArea
