import { useEffect, useState } from 'react'
import { type Value } from '@qovery/shared/interfaces'
import Button from '../../button/button'
import Icon from '../../icon/icon'
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
        <Button onClick={() => setIsOpen(true)} type="button" variant="surface" color="neutral" className="gap-2">
          {name}
          <Icon iconName="magnifying-glass" />
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
            <Button type="button" variant="surface" color="neutral">
              {isLoading ? (
                <div className="flex w-12 justify-center">
                  <LoaderSpinner theme="dark" />
                </div>
              ) : (
                <>
                  {options.find((option: Value) => option.value === currentValue)?.label}
                  <span
                    data-testid="clear-btn"
                    className="relative left-1 px-1 py-1"
                    role="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onChange(nameKey, undefined)
                      setCurrentValue(undefined)
                      setIsOpen(false)
                    }}
                  >
                    <Icon iconName="xmark" />
                  </span>
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export default InputFilter
