import { Value } from '@console/shared/interfaces'
import { useEffect, useState } from 'react'
import Icon from '../../icon/icon'
import Select, { components } from 'react-select'

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

  const handleChange = (values: any) => {
    setSelected(values)
    onChange && onChange(values)
    values.length === 0 && setFocused(false)
  }

  useEffect(() => {
    value && setSelected(value)
  }, [value])

  const Option = (props: any) => (
    <div>
      <components.Option {...props}>
        <span className="input--select-multiple__checkbox">
          {props.isSelected && <Icon name="icon-solid-check" className="text-xs" />}
        </span>
        <label>{props.label}</label>
      </components.Option>
    </div>
  )

  const MultiValue = (props: any) => (
    <span className="text-sm text-text-600 mr-1">
      {props.data.label}
      {props.index + 1 !== selected.length && ', '}
    </span>
  )

  const inputActions =
    hasFocus && !disabled
      ? '!border-brand-500 !shadow-[0_2px_2px_rgba(0, 0, 0, 0.05)]'
      : value && value.length > 0
      ? 'input--success'
      : disabled
      ? '!bg-element-light-lighter-200 !border-element-light-lighter-500 !pointer-events-none'
      : hasError
      ? 'input--error'
      : ''

  return (
    <div
      className={`input input--select-multiple ${inputActions} ${className} ${
        disabled ? '!bg-element-light-lighter-200 !border-element-light-lighter-500' : ''
      }`}
      data-testid="select-multiple"
    >
      <label htmlFor={label} className={`${hasFocus ? '!text-xs !translate-y-0' : 'text-sm translate-y-2 top-1.5'}`}>
        {label}
      </label>
      <Select
        options={options}
        isMulti
        components={{ Option, MultiValue }}
        closeMenuOnSelect={false}
        onChange={handleChange}
        classNamePrefix="input--select-multiple"
        hideSelectedOptions={false}
        isSearchable={false}
        isClearable={false}
        isDisabled={disabled}
        value={selected}
        placeholder=""
        onFocus={() => setFocused(true)}
      />
      <div className="absolute top-1/2 -translate-y-1/2 right-4">
        <Icon name="icon-solid-angle-down" className="text-sm text-text-500" />
      </div>
    </div>
  )
}

export default InputSelectMultiple
