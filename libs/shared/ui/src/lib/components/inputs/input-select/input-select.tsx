import { RefCallBack } from 'react-hook-form'
import { ListboxButton, ListboxInput, ListboxOption, ListboxPopover } from '@reach/listbox'
import { Value } from '@console/shared/interfaces'
import Icon from '../../icon/icon'

export interface InputSelectProps {
  label: string
  value?: string | undefined
  items: Value[]
  className?: string
  onChange?: () => void
  inputRef?: RefCallBack
  // need remove
  name?: string
  error?: string
}

export function InputSelect(props: InputSelectProps) {
  const { label, value, items, className = '', onChange, inputRef, error } = props

  return (
    <div className={`${className} input input--select`}>
      <ListboxInput onChange={onChange} className="input__container">
        <ListboxButton
          className={`input__button ${value !== undefined ? 'input--focused' : ''}`}
          arrow={<Icon name="icon-solid-angle-down" className="input__arrow" />}
        >
          <div className="input__label">
            <label>{label}</label>
          </div>
          {value && <div className="input__value">{value}</div>}
        </ListboxButton>
        <ListboxPopover className="input__list">
          <ListboxOption label='Hidden' className='hidden' value='hidden'></ListboxOption>
          {items.map((currentItem, index) => (
            <ListboxOption
              key={index}
              className={`input__item ${value === currentItem.value ? 'is-active' : ''}`}
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
