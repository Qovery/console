import { useEffect, useState } from 'react'

export interface InputRadioProps {
  name: string,
  label: string,
  value: string,
  isChecked?: boolean,
  className?: string
  getValue?: (checked: boolean, value: string) => void
}

export function InputRadio(props: InputRadioProps) {

  const {
    name,
    value,
    getValue,
    isChecked = false,
    className = '',
    label = '',
  } = props

  const [check, setCheck] = useState(isChecked);

  useEffect(() => {
    setCheck(isChecked)
  }, [])

  const inputChange = (check: boolean, value: string) => {
    setCheck(check)
    if (getValue) getValue(check, value)
  }

  return (
    <div className={`input__radio flex gap-2 items-center ${className}`}>
      <input
        id={value}
        type="radio"
        name={name}
        value={value}
        checked={check}
        onChange={(e) => inputChange(e.currentTarget.checked, e.currentTarget.value)}
        className="relative font-icons w-0 h-0 mr-5 before:absolute before:flex before:justify-center before:items-center before:text-white before:w-5 before:h-5 before:top-0 before:left-0 before:-translate-y-1/2 before:rounded-full before:bg-white before:border-element-light-lighter-600 before:border before:font-black before:text-xs before:leading-none before:content-[''] before:font-icons checked:before:content-['\f00c'] checked:before:bg-brand-500 checked:before:border-brand-500"
      />
      <label htmlFor={label} className='leading-5 h-5 text-text-700'>{label}</label>
    </div>
  )
}

export default InputRadio
