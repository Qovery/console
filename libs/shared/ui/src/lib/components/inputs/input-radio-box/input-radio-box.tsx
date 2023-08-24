import { type FormEvent, type ReactNode } from 'react'
import InputRadio from '../input-radio/input-radio'

export interface InputRadioBoxProps {
  name: string
  onChange: (e: FormEvent<HTMLInputElement> | string) => void
  fieldValue: string
  label: string
  value: string
  description?: ReactNode | undefined
}

export function InputRadioBox(props: InputRadioBoxProps) {
  const { name, value, description, onChange, fieldValue, label } = props

  return (
    <div
      data-testid="input-radio-box"
      onClick={() => onChange(value)}
      className={`p-4 rounded border mb-2 transition-all ${
        fieldValue === value ? 'bg-brand-50 border-brand-500' : 'bg-neutral-100 border-neutral-250'
      }`}
    >
      <InputRadio big name={name} value={value} label={label} onChange={onChange} formValue={fieldValue} />
      {description && <div className="ml-[31px] text-neutral-400 text-sm mt-1">{description}</div>}
    </div>
  )
}

export default InputRadioBox
