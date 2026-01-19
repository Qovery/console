import { type FormEvent, type ReactNode } from 'react'
import InputRadio from '../input-radio/input-radio'

export interface InputRadioBoxProps {
  name: string
  onChange: (e: FormEvent<HTMLInputElement> | string) => void
  fieldValue: string
  label: ReactNode
  value: string
  description?: ReactNode | undefined
}

export function InputRadioBox(props: InputRadioBoxProps) {
  const { name, value, description, onChange, fieldValue, label } = props

  return (
    <div
      data-testid="input-radio-box"
      onClick={() => onChange(value)}
      className={`mb-2 rounded border p-4 transition-all ${
        fieldValue === value
          ? 'border-brand-strong bg-surface-brand-subtle'
          : 'border-neutral bg-surface-neutral-subtle'
      }`}
    >
      <InputRadio big name={name} value={value} label={label} onChange={onChange} formValue={fieldValue} />
      {description && <div className="ml-[31px] mt-1 text-sm text-neutral">{description}</div>}
    </div>
  )
}

export default InputRadioBox
