import { useEffect, useState } from 'react'
import { Value } from '@qovery/shared/interfaces'
import Icon from '../../icon/icon'

export interface InputSelectSmallProps {
  name: string
  label?: string
  items: Value[]
  getValue?: (name: string, value: Value | null) => void
  className?: string
  dataTestId?: string
  onChange?: (item: string | undefined) => void
  defaultValue?: string
}

export function InputSelectSmall(props: InputSelectSmallProps) {
  const { name, label, items, defaultValue, className = '', onChange, getValue, dataTestId } = props

  const [value, setValue] = useState(defaultValue)

  const onClickItem = (value: string) => {
    const selectedItem = items.find((i) => i.value === value) || null
    if (!selectedItem) return
    if (value !== defaultValue) {
      setValue(value)
      onChange && onChange(value)
    }
    if (getValue) getValue(name, selectedItem)
  }

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue)
    }
  }, [defaultValue])

  return (
    <div className={`${className} relative flex gap-4 items-center`}>
      {label && <label className="text-sm shrink-0">{label}</label>}
      <select
        data-testid={dataTestId || 'input-select-small'}
        name={name}
        value={value}
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
        className="absolute top-3 right-4 text-sm text-text-500 leading-3 translate-y-0.5 pointer-events-none"
      />
    </div>
  )
}

export default InputSelectSmall
