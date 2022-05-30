import { Value } from '@console/shared/interfaces'
import { useEffect, useState } from 'react'
import { MultiSelect } from 'react-multi-select-component'
import Icon from '../../icon/icon'

export interface InputSelectMultipleProps {
  className?: string
  label: string
  value?: Value[]
  options: Value[]
  disabled?: boolean
  error?: string
  onChange?: (values: Value[]) => void
}

export function InputSelectMultiple(props: InputSelectMultipleProps) {
  const { className = '', label, value, options, disabled, error = false, onChange } = props
  const [focused, setFocused] = useState(false)
  const [selected, setSelected] = useState<Value[]>([])

  const hasFocus = focused || selected.length > 0
  const hasError = error ? 'input--select-multiple--error' : ''

  const inputActions = hasFocus
    ? 'input--select-multiple--focused'
    : value && value.length > 0
    ? 'input--select-multiple--success'
    : ''

  const handleChange = (values: Value[]) => {
    setSelected(values)
    onChange && onChange(values)
  }

  useEffect(() => {
    value && setSelected(value)

    console.log(value, selected)
  }, [value])

  return (
    <div
      className={`input--select-multiple ${inputActions} ${className} ${
        disabled ? '!bg-element-light-lighter-200 !border-element-light-lighter-500' : ''
      }`}
    >
      <label htmlFor={label} className={`${hasFocus ? '!text-xs !translate-y-0' : 'text-sm translate-y-2'}`}>
        {label}
      </label>
      <MultiSelect
        options={options}
        value={selected}
        onChange={handleChange}
        onMenuToggle={(e: boolean) => setFocused(e)}
        labelledBy="Select"
        className={`input__value ${hasFocus ? '' : 'h-full top-0 z-50'} ${hasError}`}
        disableSearch
        disabled={disabled}
        ArrowRenderer={() => (
          <Icon
            name="icon-solid-angle-down"
            className="absolute top-1/2 -translate-y-1/2 right-4 text-text-500 text-sm"
          />
        )}
        hasSelectAll={false}
      />
    </div>
  )
}

export default InputSelectMultiple
