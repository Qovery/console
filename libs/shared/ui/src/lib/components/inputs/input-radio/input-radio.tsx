import { useEffect, useState } from 'react'

export interface InputRadioProps {
  name: string
  label?: string
  value: string
  isChecked?: boolean
  className?: string
  getValue?: (checked: boolean, value: string) => void
  disable?: boolean
  description?: string
}

export function InputRadio(props: InputRadioProps) {
  const { name, value, getValue, isChecked = false, className = '', label = '', disable = false, description } = props

  const [check, setCheck] = useState(isChecked)

  useEffect(() => {
    setCheck(isChecked)
  }, [isChecked])

  const inputChange = (check: boolean, value: string) => {
    setCheck(check)

    if (getValue) getValue(check, value)
  }

  return (
    <div className={`flex gap-3 items-center ${className}`}>
      <input
        id={value}
        type="radio"
        name={name}
        value={value}
        checked={check}
        disabled={disable}
        onChange={(e) => inputChange(e.currentTarget.checked, e.currentTarget.value)}
        className="relative font-icons w-0 h-0 mr-5 appearance-none  after:absolute after:bg-brand-500 after:rounded-full after:-top-[5px] after:left-[5px] after:w-2.5 after:h-2.5 before:absolute before:flex before:justify-center before:items-center before:text-white before:w-5 before:h-5 before:top-0 before:left-0 before:-translate-y-1/2 before:rounded-full before:bg-white before:border-element-light-lighter-700 before:border-2 hover:before:border-brand-500 before:font-black before:text-xs before:leading-none before:content-[''] after:content-[''] after:opacity-0 checked:after:opacity-100 checked:before:border-brand-500 before:transition-all after:transition-all"
      />
      <label htmlFor={value} className="leading-5 h-5 text-text-600 font-medium text-ssm">
        {label}
        {description && <p className="text-text-400 mt-1 text-xs">{description}</p>}
      </label>
    </div>
  )
}

export default InputRadio
