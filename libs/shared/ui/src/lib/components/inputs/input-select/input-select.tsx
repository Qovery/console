import { useEffect, useState } from 'react'
import Select, {
  GroupBase,
  MultiValue,
  MultiValueProps,
  OptionProps,
  SingleValue,
  SingleValueProps,
  components,
} from 'react-select'
import { Value } from '@console/shared/interfaces'
import Icon from '../../icon/icon'

export interface InputSelectProps {
  className?: string
  label: string
  value?: string | string[]
  options: Value[]
  disabled?: boolean
  error?: string
  onChange?: (e: string | string[]) => void
  dataTestId?: string
  isMulti?: true
  portal?: boolean
  isSearchable?: boolean
  isClearable?: boolean
}

export function InputSelect(props: InputSelectProps) {
  const {
    className = '',
    label,
    value,
    options,
    disabled,
    error = false,
    onChange,
    dataTestId,
    isMulti = undefined,
    isSearchable = false,
    isClearable = false,
  } = props
  const [focused, setFocused] = useState(false)
  const [selectedItems, setSelectedItems] = useState<MultiValue<Value> | SingleValue<Value>>([])
  const [selectedValue, setSelectedValue] = useState<string | string[]>([])

  const hasFocus = focused
  const hasError = error ? 'input--select-multiple--error' : ''

  const handleChange = (values: MultiValue<Value> | SingleValue<Value>) => {
    setSelectedItems(values)

    if (isMulti) {
      const vals = (values as MultiValue<Value>).map((value) => value.value)
      onChange && onChange(vals)
      setSelectedValue(vals)
    } else {
      if (values) {
        onChange && onChange((values as Value).value)
        setSelectedValue((values as Value).value)
      }
    }
  }

  useEffect(() => {
    const items = options.filter((option) => {
      if (isMulti) {
        return (value as string[])?.includes(option.value)
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          return (value as string[])?.includes(option.value)
        } else {
          return option.value === (value as string)
        }
      }
    })

    value && items && setSelectedItems(items)
    value && setSelectedValue(items.map((item) => item.value))
  }, [value, isMulti, options])

  useEffect(() => {
    setFocused(selectedValue.length !== 0)
  }, [selectedValue])

  const Option = (props: OptionProps<Value, true, GroupBase<Value>>) => (
    <components.Option {...props}>
      {isMulti ? (
        <span className="input--select-multiple__checkbox">
          {props.isSelected && <Icon name="icon-solid-check" className="text-xs" />}
        </span>
      ) : (
        <Icon
          name="icon-solid-check"
          className={`text-success-500 ${props.isSelected ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      <label className="ml-2">{props.label}</label>
    </components.Option>
  )

  const MultiValue = (props: MultiValueProps<Value, true, GroupBase<Value>>) => (
    <span className="text-sm text-text-600 mr-1">
      {props.data.label}
      {props.index + 1 !== (selectedItems as MultiValue<Value>).length && ', '}
    </span>
  )

  const SingleValue = (props: SingleValueProps<Value>) => (
    <span className="text-sm text-text-600 mr-1">{props.data.label}</span>
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
          isMulti={isMulti}
          data-testid="select-react-select"
          components={{
            Option,
            MultiValue,
            SingleValue,
          }}
          name={label}
          inputId={label}
          closeMenuOnSelect={!isMulti}
          onChange={handleChange}
          classNamePrefix="input--select-multiple"
          hideSelectedOptions={false}
          isSearchable={isSearchable}
          isClearable={isClearable}
          isDisabled={disabled}
          value={selectedItems}
          menuPortalTarget={props.portal ? document.body : undefined}
          onFocus={() => setFocused(true)}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 50, pointerEvents: 'auto' }) }}
        />
        <input type="hidden" name={label} value={selectedValue} />
        <div className="absolute top-1/2 -translate-y-1/2 right-4">
          <Icon name="icon-solid-angle-down" className="text-sm text-text-500" />
        </div>
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputSelect
