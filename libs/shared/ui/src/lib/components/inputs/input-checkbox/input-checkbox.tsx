import { type FormEvent, useEffect, useState } from 'react'
import Icon from '../../icon/icon'

export interface InputCheckboxProps {
  name: string
  value: string
  id?: string
  label?: string
  isChecked?: boolean
  className?: string
  onChange?: (e: FormEvent<HTMLInputElement> | Event) => void
  disabled?: boolean
  type?: string
  formValue?: string
  dataTestId?: string
  big?: boolean
}

/*
 * @deprecated Use Checkbox instead
 */
export function InputCheckbox(props: InputCheckboxProps) {
  const {
    name,
    value,
    onChange,
    isChecked = false,
    className = '',
    label = '',
    disabled = false,
    type = 'checkbox',
    formValue,
    id = name,
    dataTestId = 'input-checkbox',
    big = false,
  } = props

  const [check, setCheck] = useState(isChecked)
  const bigClasses = big ? 'mr-6 before:w-5 before:h-5' : 'mr-5 before:w-4 before:h-4'

  useEffect(() => {
    setCheck(isChecked)
  }, [isChecked])

  useEffect(() => {
    if (formValue) setCheck(value === formValue)
  }, [formValue, value])

  const inputChange = (check: boolean, e: FormEvent<HTMLInputElement>) => {
    onChange && onChange(e)
    type === 'checkbox' && setCheck(check)
  }

  return (
    <div className={`relative flex gap-2 items-center ${className}`}>
      <input
        data-testid={dataTestId}
        id={id}
        type={type}
        name={name}
        value={value}
        checked={check}
        disabled={disabled}
        onChange={(e) => inputChange(e.currentTarget.checked, e)}
        className={`input-checkbox relative font-icons w-0 h-0 appearance-none before:absolute before:flex before:justify-center before:items-center before:text-white before:top-0 before:left-0 before:-translate-y-1/2 before:rounded-sm before:bg-white dark:before:bg-neutral-500 ${bigClasses} ${
          disabled
            ? 'before:border-neutral-250 dark:before:border-neutral-350'
            : 'before:border-neutral-350 cursor-pointer'
        } before:border-2 before:font-black before:text-xs before:leading-none before:content-[''] before:transition-all checked:before:bg-brand-500 checked:before:border-brand-500`}
      />
      {label && (
        <label
          htmlFor={id}
          className={`cursor-pointer leading-5 h-5 text-neutral-400 dark:text-neutral-300 text-sm ${
            big ? 'font-medium' : ''
          } ${disabled ? '' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
      {check && <Icon iconName="check" className={`text-white absolute text-2xs ${big ? 'left-1.5' : 'left-1'}`} />}
    </div>
  )
}

export default InputCheckbox
