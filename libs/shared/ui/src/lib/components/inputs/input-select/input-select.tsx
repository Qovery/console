import { ListboxButton, ListboxInput, ListboxList, ListboxOption, ListboxPopover } from '@reach/listbox'
import { Value } from '@console/shared/interfaces'
import Icon from '../../icon/icon'

export interface InputSelectProps {
  label: string
  value?: string | undefined
  items: Value[]
  className?: string
  onChange?: () => void
  error?: string
  disabled?: boolean
  portal?: boolean
  dataTestId?: string
}

export function InputSelect(props: InputSelectProps) {
  const { label, value, items, className = '', onChange, error, dataTestId, disabled = false, portal = true } = props

  const selectedValue = value && items.find((item) => item.value === value)
  const hasError = error && error.length > 0 ? 'input--error' : ''

  return (
    <div
      data-testid={dataTestId || 'input-select'}
      className={`input input--select ${hasError} ${
        disabled ? '!bg-element-light-lighter-200 pointer-events-none' : ''
      } ${className}`}
    >
      <ListboxInput key={label} onChange={onChange} disabled={disabled}>
        <ListboxButton
          className={`input__button ${value !== undefined ? 'input__button--focused' : ''} ${
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
              {value && (
                <div className={`input__value ${selectedValue && selectedValue.icon ? 'pl-11' : ''}`}>
                  {selectedValue ? selectedValue.label : ''}
                </div>
              )}
            </div>
          </div>
        </ListboxButton>
        <ListboxPopover className={`input__list ${!portal ? 'absolute' : ''}`} portal={portal}>
          <ListboxList>
            <ListboxOption label="Hidden" className="hidden" value="hidden"></ListboxOption>
            {items.map((currentItem) => (
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
