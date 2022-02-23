import { useRef } from 'react'
import './input-radio.module.scss'

/* eslint-disable-next-line */
export interface InputRadioProps {
  name: string,
  isChecked?: boolean,
  className?: string
}

export function InputRadio(props: InputRadioProps) {

  const {
    name,
    isChecked = false,
    className = ''
  } = props

  return (
    <div className={className}>
      <input 
        type="radio"
        name={name}
        checked={isChecked}
      />
    </div>
  )
}

export default InputRadio
