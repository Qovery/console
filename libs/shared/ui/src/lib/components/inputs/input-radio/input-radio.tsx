import { type FormEvent, type ReactNode, useEffect, useState } from 'react'

export interface InputRadioProps {
  name: string
  label?: ReactNode
  value: string
  isChecked?: boolean
  className?: string
  getValue?: (checked: boolean, value: string) => void
  disable?: boolean
  description?: string
  onChange?: (e: FormEvent<HTMLInputElement>) => void
  formValue?: string
  big?: boolean
}

/*
 * @deprecated Use RadioGroup instead
 */
export function InputRadio(props: InputRadioProps) {
  const {
    name,
    value,
    getValue,
    isChecked = false,
    className = '',
    label = '',
    disable = false,
    description,
    formValue,
    onChange,
    big = false,
  } = props

  const [check, setCheck] = useState(isChecked)

  useEffect(() => {
    setCheck(isChecked)
  }, [isChecked])

  useEffect(() => {
    setCheck(value === formValue)
  }, [formValue, value])

  const inputChange = (check: boolean, value: string, e: FormEvent<HTMLInputElement>) => {
    if (getValue) getValue(check, value)
    onChange ? onChange(e) : setCheck(check)
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        id={value}
        type="radio"
        name={name}
        value={value}
        checked={check}
        disabled={disable}
        onChange={(e) => inputChange(e.currentTarget.checked, e.currentTarget.value, e)}
        className="relative mr-5 appearance-none font-icons  before:absolute before:left-[1px] before:top-[1px] before:flex before:h-[1.125rem] before:w-[1.125rem] before:items-center before:justify-center before:rounded-full before:border-2 before:border-neutral-350 before:bg-white before:text-xs before:font-black before:leading-none before:text-white  before:transition-all before:content-[''] after:absolute after:left-[5px] after:top-[5px] after:h-2.5 after:w-2.5 after:rounded-full after:bg-brand-500 after:opacity-0 after:transition-all after:content-[''] checked:before:border-brand-500 checked:after:opacity-100 hover:before:border-brand-500"
      />
      <label
        htmlFor={value}
        className={`font-medium leading-5 text-neutral-400 dark:text-neutral-50 ${big ? 'text-sm' : 'text-ssm'}`}
      >
        {label}
        {description && <p className="mt-1 text-xs font-normal text-neutral-350 dark:text-neutral-50">{description}</p>}
      </label>
    </div>
  )
}

export default InputRadio
