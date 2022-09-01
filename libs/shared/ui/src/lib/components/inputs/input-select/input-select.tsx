import { ListboxButton, ListboxInput, ListboxList, ListboxOption, ListboxPopover } from '@reach/listbox'
import { useEffect, useState } from 'react'
import { Value } from '@console/shared/interfaces'
import Icon from '../../icon/icon'
import InputSearch from '../input-search/input-search'

export interface InputSelectProps {
  label: string
  value?: string | undefined
  items: Value[]
  className?: string
  onChange?: (e: string) => void
  error?: string
  disabled?: boolean
  portal?: boolean
  dataTestId?: string
  search?: boolean
}

export function InputSelect(props: InputSelectProps) {
  const {
    label,
    value,
    items,
    className = '',
    onChange,
    error,
    dataTestId,
    disabled = false,
    portal = true,
    search,
  } = props

  const [selectedValue, setSelectedValue] = useState(value && items.find((item) => item.value === value))
  const hasError = error && error.length > 0 ? 'input--error' : ''

  const [currentItems, setCurrentItems] = useState(items)

  useEffect(() => {
    if (value) setSelectedValue(items.find((item) => item.value === value))
  }, [value, items, setSelectedValue])

  useEffect(() => {
    setCurrentItems(items)
  }, [items])

  const filterData = (value: string) => {
    value = value.toUpperCase()
    const currentItems = items.filter((item) => item.label.toUpperCase().includes(value))
    setCurrentItems(currentItems)
  }

  return (
    <div
      data-testid={dataTestId || 'input-select'}
      className={`input input--select ${hasError} ${disabled ? 'input--disabled' : ''} ${className}`}
    >
      <ListboxInput
        key={label}
        onChange={(e) => {
          if (onChange) onChange(e)
          setSelectedValue(items.find((item) => item.value === e))
        }}
        disabled={disabled}
      >
        <ListboxButton
          data-testid={'input-select-button'}
          className={`input__button ${selectedValue !== undefined ? 'input__button--focused' : ''} ${
            disabled ? '!border-element-light-lighter-500' : ''
          }`}
          arrow={<Icon name="icon-solid-angle-down" className="input__arrow" />}
        >
          <div className="flex">
            {selectedValue && selectedValue.icon ? (
              <span className="mr-3 w-4 h-4 mt-[10px]">{selectedValue.icon}</span>
            ) : (
              ''
            )}
            <div>
              <div className="input__label">
                <label>{label}</label>
              </div>
              {selectedValue && (
                <div
                  data-testid="input-select-value"
                  className={`input__value ${selectedValue && selectedValue.icon ? '!pl-11' : ''}`}
                >
                  {selectedValue ? selectedValue.label : ''}
                </div>
              )}
            </div>
          </div>
        </ListboxButton>
        <ListboxPopover className={`input__list ${!portal ? 'absolute z-10' : 'z-50'}`} portal={portal}>
          <ListboxList className="relative">
            {search && (
              <InputSearch
                autofocus
                placeholder="Search"
                className="mb-3 sticky top-0"
                onChange={(value: string) => filterData(value)}
                isEmpty={currentItems.length === 0}
                customSize="h-9 text-sm"
              />
            )}
            <ListboxOption label="Hidden" className="hidden" value="hidden"></ListboxOption>
            {currentItems.map((currentItem) => (
              <ListboxOption
                key={currentItem.value}
                className={`input__item ${value === currentItem.value ? 'is-active' : ''}`}
                value={currentItem.value}
              >
                <Icon
                  name="icon-solid-check"
                  className={`text-success-500 mr-3 ${value === currentItem.value ? 'opacity-100' : 'opacity-0'}`}
                />
                {currentItem.label}
              </ListboxOption>
            ))}
          </ListboxList>
        </ListboxPopover>
      </ListboxInput>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputSelect
