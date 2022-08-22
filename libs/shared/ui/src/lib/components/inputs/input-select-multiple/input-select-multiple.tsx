import { useEffect, useState } from 'react'
import Select, { GroupBase, MultiValue, MultiValueProps, OptionProps, components } from 'react-select'
import { Value } from '@console/shared/interfaces'
import Icon from '../../icon/icon'

export interface InputSelectMultipleProps {
  className?: string
  label: string
  value?: Value[]
  options: Value[]
  disabled?: boolean
  error?: string
  onChange?: (values: MultiValue<Value>) => void
  dataTestId?: string
}

export function InputSelectMultiple(props: InputSelectMultipleProps) {
  const { className = '', label, value, options, disabled, error = false, onChange, dataTestId } = props
  const [focused, setFocused] = useState(false)
  const [selected, setSelected] = useState<MultiValue<Value>>([])

  const hasFocus = focused || selected.length > 0
  const hasError = error ? 'input--select-multiple--error' : ''

  const handleChange = (values: MultiValue<Value>) => {
    setSelected(values)
    onChange && onChange(values)
    values.length === 0 && setFocused(false)
  }

  useEffect(() => {
    value && setSelected(value)
  }, [value])

  const Option = (props: OptionProps<Value, true, GroupBase<Value>>) => (
    <components.Option {...props}>
      <span className="input--select-multiple__checkbox">
        {props.isSelected && <Icon name="icon-solid-check" className="text-xs" />}
      </span>
      <label className="ml-2">{props.label}</label>
    </components.Option>
  )

  const MultiValue = (props: MultiValueProps<Value, true, GroupBase<Value>>) => (
    <span className="text-sm text-text-600 mr-1">
      {props.data.label}
      {props.index + 1 !== selected.length && ', '}
    </span>
  )

  const inputActions =
    hasFocus && !disabled
      ? '!border-brand-500 !shadow-[0_2px_2px_rgba(0, 0, 0, 0.05)]'
      : disabled
      ? '!bg-element-light-lighter-200 !border-element-light-lighter-500 !pointer-events-none'
      : hasError
      ? 'input--error'
      : ''

  return (
    <div className={className}>
      <div
        className={`input input--select-multiple ${inputActions} ${
          disabled ? '!bg-element-light-lighter-200 !border-element-light-lighter-500' : ''
        }`}
        data-testid={dataTestId || 'select-multiple'}
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
          onFocus={() => setFocused(true)}
        />
        <div className="absolute top-1/2 -translate-y-1/2 right-4">
          <Icon name="icon-solid-angle-down" className="text-sm text-text-500" />
        </div>
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputSelectMultiple
