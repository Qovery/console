import { useEffect, useState } from 'react'
import Select, {
  GroupBase,
  MultiValue,
  MultiValueProps,
  NoticeProps,
  OptionProps,
  SingleValue,
  SingleValueProps,
  components,
} from 'react-select'
import { Value } from '@qovery/shared/interfaces'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import Tooltip from '../../tooltip/tooltip'

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

  const selectedWithIconClassName = 'ml-8'

  const hasFocus = focused
  const hasError = error ? 'input--error' : ''

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
        if (Array.isArray(value)) {
          return (value as string[])?.includes(option.value)
        } else {
          return option.value === (value as string)
        }
      }
    })

    items && setSelectedItems(items)
    if (isMulti) {
      setSelectedValue(items.map((item) => item.value))
    } else {
      if (items && items.length > 0) {
        setSelectedValue(items[0]?.value)
      }
    }
  }, [value, isMulti, options])

  const Option = (props: OptionProps<Value, true, GroupBase<Value>>) => (
    <components.Option {...props}>
      {isMulti ? (
        <span className="input-select__checkbox">
          {props.isSelected && <Icon name={IconAwesomeEnum.CHECK} className="text-xs" />}
        </span>
      ) : props.isSelected ? (
        <Icon name={IconAwesomeEnum.CHECK} className="text-success-500" />
      ) : props.data.icon ? (
        <div className="w-4 h-full flex items-center justify-center">{props.data.icon}</div>
      ) : (
        <Icon name={IconAwesomeEnum.CHECK} className="opacity-0" />
      )}
      <Tooltip content={props.label}>
        <label className="ml-2 truncate">{props.label}</label>
      </Tooltip>
    </components.Option>
  )

  const MultiValue = (props: MultiValueProps<Value, true, GroupBase<Value>>) => (
    <span className="text-sm text-text-600 mr-1">
      {props.data.label}
      {props.index + 1 !== (selectedItems as MultiValue<Value>).length && ', '}
    </span>
  )

  const SingleValue = (props: SingleValueProps<Value>) => (
    <span
      className={`text-sm text-text-600 mr-1 ${props.data.icon && !props.isMulti ? selectedWithIconClassName : ''}`}
    >
      {props.data.label}
    </span>
  )

  const NoOptionsMessage = (props: NoticeProps<Value>) => {
    return (
      <components.NoOptionsMessage {...props}>
        <div className="text-center px-3 py-6">
          <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-text-400" />
          <p className="text-text-400 font-medium text-xs mt-1">No result for this search</p>
        </div>{' '}
      </components.NoOptionsMessage>
    )
  }

  const inputActions =
    hasFocus && !disabled
      ? '!border-brand-500 !shadow-[0_2px_2px_rgba(0, 0, 0, 0.05)] input--focused'
      : disabled
      ? '!bg-element-light-lighter-200 !border-element-light-lighter-500 !pointer-events-none'
      : hasError
      ? 'input--error'
      : ''

  const [hasLabelUp, setHasLabelUp] = useState(value?.length !== 0 ? 'input--label-up' : '')

  useEffect(() => {
    setHasLabelUp(hasFocus || selectedValue.length !== 0 ? 'input--label-up' : '')
  }, [hasFocus, selectedValue, setHasLabelUp])

  const currentIcon = options.find((option) => option.value === selectedValue)
  const hasIcon = !props.isMulti && currentIcon?.icon

  return (
    <div className={className}>
      <div
        className={`input input--select ${inputActions} ${
          disabled ? '!bg-element-light-lighter-200 !border-element-light-lighter-500' : ''
        }`}
        data-testid={dataTestId || 'select'}
      >
        {hasIcon && (
          <div
            data-testid="selected-icon"
            className="w-12 h-full absolute left-0 top-0 flex items-center justify-center"
          >
            {currentIcon.icon}
          </div>
        )}
        <label
          htmlFor={label}
          className={
            hasIcon
              ? `!text-xs !translate-y-0 ${selectedWithIconClassName}`
              : `${hasLabelUp ? '!text-xs !translate-y-0' : 'text-sm translate-y-2 top-1.5'}`
          }
        >
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
            NoOptionsMessage,
          }}
          name={label}
          inputId={label}
          menuPlacement={'auto'}
          closeMenuOnSelect={!isMulti}
          onChange={handleChange}
          classNamePrefix="input-select"
          hideSelectedOptions={false}
          isSearchable={isSearchable}
          isClearable={isClearable}
          isDisabled={disabled}
          value={selectedItems}
          menuPortalTarget={props.portal ? document.body : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 50, pointerEvents: 'auto' }) }}
        />
        <input type="hidden" name={label} value={selectedValue} />
        <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none">
          <Icon name="icon-solid-angle-down" className="text-sm text-text-500" />
        </div>
      </div>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputSelect
