import { Value } from '@console/shared/interfaces'
import { Listbox, ListboxOption } from '@reach/listbox'
import { useState } from 'react'
import Icon from '../../icon/icon'

export interface InputSelectSmallProps {
  name: string
  label?: string
  items: Value[]
  getValue?: (name: string, value: Value | null) => void
  defaultItem?: Value
  className?: string
}

export function InputSelectSmall(props: InputSelectSmallProps) {
  const { name, label, items, defaultItem, className = '', getValue } = props

  const [item, setItem] = useState(defaultItem || null)

  const onClickItem = (value: string) => {
    const selectedItem = items.find((i) => i.value === value) || null
    setItem(selectedItem)
    if (getValue) getValue(name, selectedItem)
  }

  return (
    <div>
      {label && <label>{label}</label>}
      <Listbox
        defaultValue={defaultItem?.value}
        className={className}
        arrow={<Icon name="icon-solid-angle-down" className="text-sm" />}
        name={name}
        onChange={onClickItem}
      >
        {items.map((item: Value, index: number) => {
          return (
            <ListboxOption key={index} value={item.value}>
              {item.label}
            </ListboxOption>
          )
        })}
      </Listbox>
    </div>
  )
}

export default InputSelectSmall
