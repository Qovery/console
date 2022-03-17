import { ListboxButton, ListboxInput, ListboxOption, ListboxPopover } from '@reach/listbox'
import { Value } from '@console/shared/interfaces'
import Icon from '../../icon/icon'

export interface InputSelectProps {
  label: string
  value?: string | undefined
  items: Value[]
  className?: string
  onChange?: () => void
  error?: string
}

export function InputSelect(props: InputSelectProps) {
  const { label, value, items, className = '', onChange, error } = props

  const selectedLabel = value && items.find((item) => item.value === value)?.label

  return (
    <div className={`input input--select ${className}`}>
      <ListboxInput onChange={onChange} className="input--container">
        <ListboxButton
          className={`input--button ${value !== undefined ? 'input--focused' : ''}`}
          arrow={<Icon name="icon-solid-angle-down" className="input--arrow" />}
        >
          <div className="input__label">
            <label>{label}</label>
          </div>
          {value && <div className="input__value">{selectedLabel}</div>}
        </ListboxButton>
        <ListboxPopover className="input--list">
          <ListboxOption label="Hidden" className="hidden" value="hidden"></ListboxOption>
          {items.map((currentItem, index) => (
            <ListboxOption
              key={index}
              className={`input--item ${value === currentItem.value ? 'is-active' : ''}`}
              value={currentItem.value}
            >
              <Icon
                name="icon-solid-check"
                className={`text-success-500 mr-3 ${value === currentItem.value ? 'opacity-100' : 'opacity-0'}`}
              ></Icon>
              {currentItem.label}
            </ListboxOption>
          ))}
        </ListboxPopover>
      </ListboxInput>
      {error && <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>}
    </div>
  )
}

export default InputSelect
