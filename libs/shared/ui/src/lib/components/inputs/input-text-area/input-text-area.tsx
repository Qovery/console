import { useRef, useState } from 'react'
import { UseFormRegister } from 'react-hook-form'

export interface InputTextAreaProps {
  label: string
  name: string
  register: UseFormRegister<any>
  className?: string
  defaultValue?: string
  required?: string | boolean
}

export function InputTextArea(props: InputTextAreaProps) {
  const { label, name, className, defaultValue = '', register, required = false } = props

  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const inputChange = (value: string) => {
    setValue(value)
  }

  const hasFocus = focused || value.length > 0
  const inputActions = hasFocus ? 'input--focused' : ''

  return (
    <div className={className} onClick={() => inputRef.current && inputRef.current.focus()}>
      <div className={`input pb-0 pr-2 ${inputActions}`}>
        <label htmlFor={label} className={`${hasFocus ? 'text-xs' : 'text-sm translate-y-2'}`}>
          {label}
        </label>
        <textarea
          className="w-full min-h-[52px] mt-5 pr-3 bg-transparent appearance-none text-sm text-text-700 outline-0"
          id={label}
          value={value}
          onFocus={() => setFocused(true)}
          {...register(name, {
            required: required,
            value: value,
            min: 10,
            onBlur: () => setFocused(false),
            onChange: (e) => inputChange(e.target.value),
          })}
        />
      </div>
    </div>
  )
}

export default InputTextArea
