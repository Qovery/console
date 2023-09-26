import { useEffect, useState } from 'react'
import { type Value } from '@qovery/shared/interfaces'
import ButtonLegacy, { ButtonSize, ButtonStyle } from '../../buttons/button-legacy/button-legacy'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import LoaderSpinner from '../../loader-spinner/loader-spinner'
import InputSelect from '../input-select/input-select'

export interface InputFilterProps {
  name: string
  nameKey: string
  options: Value[]
  onChange: (type: string, value?: string | string[]) => void
  defaultValue?: string | string[]
  isLoading?: boolean
}

export function InputFilter({ name, nameKey, options, onChange, defaultValue, isLoading }: InputFilterProps) {
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
        <ButtonLegacy
          onClick={() => setIsOpen(true)}
          style={ButtonStyle.STROKED}
          size={ButtonSize.TINY}
          iconRight={IconAwesomeEnum.MAGNIFYING_GLASS}
        >
          {name}
        </ButtonLegacy>
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
            <ButtonLegacy size={ButtonSize.TINY}>
              {isLoading ? (
                <div className="flex justify-center w-12">
                  <LoaderSpinner theme="dark" />
                </div>
              ) : (
                <>
                  {options.find((option: Value) => option.value === currentValue)?.label}
                  <span
                    data-testid="clear-btn"
                    className="px-1 py-1 relative left-1"
                    role="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onChange(nameKey, undefined)
                      setCurrentValue(undefined)
                      setIsOpen(false)
                    }}
                  >
                    <Icon name={IconAwesomeEnum.XMARK} />
                  </span>
                </>
              )}
            </ButtonLegacy>
          )}
        </>
      )}
    </div>
  )
}

export default InputFilter
