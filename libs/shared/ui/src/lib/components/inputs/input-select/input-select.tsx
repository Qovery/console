import { DetectClickOutside } from '@console/shared/utils'
import { useState } from 'react'

export interface InputSelectProps {
  name: string
  label: string
  items: { label: string; value: string }[]
  defaultItem?: { label: string; value: string }
  className?: string
}

export function InputSelect(props: InputSelectProps) {
  const { label, name, items, defaultItem, className = '' } = props

  const [isOpen, setIsOpen] = useState(false)
  const [item, setItem] = useState(defaultItem || null)

  const onClickItem = (value: { label: string; value: string }) => {
    setIsOpen(false)

    if (value !== item) {
      setItem(value)
    } else {
      setItem(null)
    }
  }

  return (
    <DetectClickOutside callback={() => setIsOpen(false)}>
      <div className={`input ${className} ${item !== null ? 'input--focused' : ''}`} onClick={() => setIsOpen(true)}>
        <label>{label}</label>
        {item && <div className="input__value">{item.label}</div>}
        <div className={`input__select ${isOpen ? 'is-open' : ''}`}>
          {items.map((currentItem, index) => (
            <div
              role="button"
              key={index}
              className={`input__select__item ${item?.value === currentItem.value ? 'is-active' : ''}`}
              onClick={() => onClickItem(currentItem)}
            >
              {currentItem.label}
            </div>
          ))}
        </div>
      </div>
    </DetectClickOutside>
  )
}

export default InputSelect
