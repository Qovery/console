import { Value } from '@console/shared/interfaces'
import { useState } from 'react'
import Icon from '../../icon/icon'

export interface InputSelectSmallProps {
  name: string
  label?: string
  items: Value[]
  getValue?: (name: string, value: Value | null) => void
  defaultItem?: Value
  className?: string
  dataTestId?: string
  onChange?: (item: string | undefined) => void
}

export function InputSelectSmall(props: InputSelectSmallProps) {
  const { name, label, items, defaultItem, className = '', getValue } = props

  const [item, setItem] = useState(defaultItem || null)

  const onClickItem = (value: string) => {
    const selectedItem = items.find((i) => i.value === value) || null
    if (selectedItem !== defaultItem) {
      setItem(selectedItem)
      props.onChange && props.onChange(selectedItem?.value)
    }
    if (getValue) getValue(name, selectedItem)
  }

  return (
    <div className={`${className} relative flex gap-4 items-center`}>
      {label && <label className="text-sm shrink-0">{label}</label>}
      <select
        data-testid={props.dataTestId || 'input-select-small'}
        name={name}
        value={item?.value}
        className="input input__select--small"
        onChange={(e) => onClickItem(e.target.value)}
      >
        {items.map((item: Value, index: number) => (
          <option key={index} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <Icon
        name="icon-solid-angle-down"
        className="absolute top-3 right-4 text-sm text-text-500 leading-3 translate-y-0.5"
      />
    </div>
  )
}

export default InputSelectSmall
