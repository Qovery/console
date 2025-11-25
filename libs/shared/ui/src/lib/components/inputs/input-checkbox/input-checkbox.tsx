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
    <div className={`relative flex items-center gap-2 ${className}`}>
      <input
        data-testid={dataTestId}
        id={id}
        type={type}
        name={name}
        value={value}
        checked={check}
        disabled={disabled}
        onChange={(e) => inputChange(e.currentTarget.checked, e)}
        className={`input-checkbox relative h-0 w-0 appearance-none font-icons before:absolute before:left-0 before:top-0 before:flex before:-translate-y-1/2 before:items-center before:justify-center before:rounded-sm before:bg-white before:text-white dark:before:bg-neutral-500 ${bigClasses} ${
          disabled
            ? 'before:border-neutral-250 dark:before:border-neutral-350'
            : 'cursor-pointer before:border-neutral-350'
        } before:border-2 before:text-xs before:font-black before:leading-none before:transition-all before:content-[''] checked:before:border-brand-500 checked:before:bg-brand-500`}
      />
      {label && (
        <label
          htmlFor={id}
          className={`h-5 cursor-pointer text-sm leading-5 text-neutral-400 dark:text-neutral-300 ${
            big ? 'font-medium' : ''
          } ${disabled ? '' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
      {check && <Icon iconName="check" className={`absolute text-2xs text-white ${big ? 'left-1.5' : 'left-1'}`} />}
    </div>
  )
}

export default InputCheckbox
