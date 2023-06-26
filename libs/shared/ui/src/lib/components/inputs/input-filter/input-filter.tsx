import { useState } from 'react'
import { Value } from '@qovery/shared/interfaces'
import Button, { ButtonSize, ButtonStyle } from '../../buttons/button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import InputSelect from '../input-select/input-select'

export interface InputFilterProps {
  name: string
  options: Value[]
  onChange?: (value: string | string[]) => void
  defaultValue?: string | string[]
}

export function InputFilter({ name, options, onChange, defaultValue }: InputFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentValue, setCurrentValue] = useState<string | string[] | undefined>(defaultValue)

  return (
    <div>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          style={ButtonStyle.STROKED}
          size={ButtonSize.TINY}
          iconRight={IconAwesomeEnum.MAGNIFYING_GLASS}
        >
          {name}
        </Button>
      )}
      {isOpen && (
        <>
          {!currentValue ? (
            <InputSelect
              isFilter
              autoFocus
              isSearchable
              placeholder="Type"
              className="w-[92px]"
              options={options}
              onChange={(value) => {
                onChange && onChange(value)
                setCurrentValue(value)
              }}
            />
          ) : (
            <Button size={ButtonSize.TINY}>
              {options.find((option: Value) => option.value === currentValue)?.label}
              <span
                data-testid="clear-timestamp"
                className="px-1 py-1 relative left-1"
                role="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setCurrentValue(undefined)
                }}
              >
                <Icon name={IconAwesomeEnum.CROSS} />
              </span>
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export default InputFilter
