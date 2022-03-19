import { Value } from '@console/shared/interfaces'
import { useState } from 'react'
import Icon from '../../icon/icon'
import { ListboxButton, ListboxInput, ListboxOption, ListboxPopover } from '@reach/listbox'

export interface InputSelectProps {
  name: string
  label: string
  items: Value[]
  getValue?: (name: string, value: Value | null) => void
  defaultItem?: Value
  className?: string
}

export function InputSelect(props: InputSelectProps) {
  const { label, name, items, defaultItem, getValue, className = '' } = props

  const [item, setItem] = useState(defaultItem || null)

  const onClickItem = (value: string) => {
    const selectedItem = items.find((i) => i.value === value) || null
    if (selectedItem !== defaultItem) setItem(selectedItem)
    if (getValue) getValue(name, selectedItem)
  }

  return (
    <div className={`${className} input__select ${item !== null ? 'input--focused' : ''}`}>
      <ListboxInput onChange={onClickItem} className="input__select__box">
        <ListboxButton
          className="input__select__button"
          arrow={<Icon name="icon-solid-angle-down" className="input__select__arrow" />}
        >
          <div className="input__label">
            <label>{label}</label>
          </div>
          {item && <div className="input__value">{item.label}</div>}
        </ListboxButton>
        <ListboxPopover portal={false} className="input__select__list">
          {items.map((currentItem, index) => (
            <ListboxOption
              className={`input__select__item ${item?.value === currentItem.value ? 'is-active' : ''}`}
              key={index}
              value={currentItem.value}
            >
              <Icon
                name="icon-solid-check"
                className={`text-success-500 mr-3 ${item?.value === currentItem.value ? 'opacity-100' : 'opacity-0'}`}
              ></Icon>
              {currentItem.label}
            </ListboxOption>
          ))}
        </ListboxPopover>
      </ListboxInput>
    </div>
  )
}

export default InputSelect
