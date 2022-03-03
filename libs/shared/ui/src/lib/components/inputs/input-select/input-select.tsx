import { DetectClickOutside } from '@console/shared/utils'
import { useState } from 'react'
import { Value } from '../../../types/common/value.interface'
import IconFa from '../../icon-fa/icon-fa'

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

  const [isOpen, setIsOpen] = useState(false)
  const [item, setItem] = useState(defaultItem || null)

  const onClickItem = (value: Value | null) => {
    setIsOpen(false)

    let currentValue = value

    if (currentValue !== item) {
      setItem(currentValue)
    } else {
      currentValue = null
      setItem(null)
    }

    getValue && getValue(name, currentValue)
  }

  return (
    <DetectClickOutside callback={() => setIsOpen(false)}>
      <div className={`input ${className} ${item !== null ? 'input--focused' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="input__label">
          <label>{label}</label>
          {item && <div className="input__value">{item.label}</div>}
          <IconFa name="icon-solid-angle-down" className="absolute text-text-500 text-sm right-4 top-4" />
        </div>
        <div className={`input__select ${isOpen ? 'is-open' : ''}`}>
          {items.map((currentItem, index) => (
            <div
              role="button"
              key={index}
              className={`input__select__item ${item?.value === currentItem.value ? 'is-active' : ''}`}
              onClick={() => onClickItem(currentItem)}
            >
              <IconFa
                name="icon-solid-check"
                className={`text-success-500 mr-3 ${item?.value === currentItem.value ? 'opacity-100' : 'opacity-0'}`}
              />
              {currentItem.label}
            </div>
          ))}
        </div>
      </div>
    </DetectClickOutside>
  )
}

export default InputSelect
