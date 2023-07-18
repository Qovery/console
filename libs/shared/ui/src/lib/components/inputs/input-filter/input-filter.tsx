import { useEffect, useState } from 'react'
import { Value } from '@qovery/shared/interfaces'
import Button, { ButtonSize, ButtonStyle } from '../../buttons/button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import InputSelect from '../input-select/input-select'

export interface InputFilterProps {
  name: string
  nameKey: string
  options: Value[]
  onChange: (type: string, value?: string | string[]) => void
  defaultValue?: string | string[]
}

export function InputFilter({ name, nameKey, options, onChange, defaultValue }: InputFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentValue, setCurrentValue] = useState<string | string[] | undefined>(defaultValue)

  useEffect(() => {
    if (defaultValue) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
      setCurrentValue(undefined)
    }
  }, [defaultValue])

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
              placeholder={name}
              className="w-24"
              options={options}
              onChange={(value) => {
                onChange(nameKey, value)
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
                  onChange(nameKey, undefined)
                  setCurrentValue(undefined)
                  setIsOpen(false)
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
