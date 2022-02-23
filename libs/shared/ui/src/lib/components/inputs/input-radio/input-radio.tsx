import { useEffect, useState } from 'react'
import './input-radio.module.scss'

/* eslint-disable-next-line */
export interface InputRadioProps {
  name: string,
  label: string,
  value: string,
  isChecked?: boolean,
  className?: string
  labelVisible?: boolean,
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
    labelVisible = true
  } = props

  const [check, setCheck] = useState(isChecked);

  useEffect(() => {
    setCheck(isChecked)
  }, [])

  const inputChange = (check: boolean, value: string) => {
    console.log(check, value)
    setCheck(check)
    if (getValue) getValue(check, value)
  }

  return (
    <div className={`input__radio ${className}`}>
      <input
        id={label}
        type="radio"
        name={name}
        value={value}
        checked={check}
        onChange={(e) => inputChange(e.currentTarget.checked, e.currentTarget.value)}
      />
      <label htmlFor={label} className={!labelVisible ? 'invisible' : 'visible'}>{label}</label>
    </div>
  )
}

export default InputRadio
