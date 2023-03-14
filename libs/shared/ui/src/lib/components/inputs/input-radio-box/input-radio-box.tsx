import { FormEvent, ReactNode } from 'react'
import InputRadio from '../input-radio/input-radio'

export interface InputRadioBoxProps {
  name: string
  onChange: (e: FormEvent<HTMLInputElement> | string) => void
  fieldValue: string
  label: string
  value: string
  description?: ReactNode | undefined
  rightElement?: ReactNode | undefined
}

export function InputRadioBox(props: InputRadioBoxProps) {
  const { name, value, description, onChange, fieldValue, label, rightElement } = props

  return (
    <div
      data-testid="input-radio-box"
      onClick={() => onChange(value)}
      className={`p-4 rounded border mb-2 transition-all ${
        fieldValue === value
          ? 'bg-brand-50 border-brand-500'
          : 'bg-element-light-lighter-200 border-element-light-lighter-500'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div>
          <InputRadio big name={name} value={value} label={label} onChange={onChange} formValue={fieldValue} />
          {description && <div className="ml-[31px] text-text-500 text-sm mt-1">{description}</div>}
        </div>
        {rightElement}
      </div>
    </div>
  )
}

export default InputRadioBox
