import { ReactNode } from 'react'
import { ControllerRenderProps, FieldValues } from 'react-hook-form'
import InputRadio from '../input-radio/input-radio'

export interface InputRadioBoxProps {
  field: ControllerRenderProps<FieldValues, 'selected'>
  name: string
  value: string
  description?: ReactNode | undefined
  onClick: (name: string, value: string) => void
}

export function InputRadioBox(props: InputRadioBoxProps) {
  const { field, name, value, description, onClick } = props

  return (
    <div
      data-testid="input-radio-box"
      onClick={() => {
        onClick('selected', value)
      }}
      className={`p-4 rounded border mb-2 transition transition-all ${
        field.value === value
          ? 'bg-brand-50 border-brand-500'
          : 'bg-element-light-lighter-200 border-element-light-lighter-500'
      }`}
    >
      <InputRadio big name={field.name} value={value} label={name} onChange={field.onChange} formValue={field.value} />
      {description && <div className="ml-[31px] text-text-500 text-sm mt-1">{description}</div>}
    </div>
  )
}

export default InputRadioBox
