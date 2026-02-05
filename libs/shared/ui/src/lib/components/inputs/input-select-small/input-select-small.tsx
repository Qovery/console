import { useEffect, useState } from 'react'
import { type Value } from '@qovery/shared/interfaces'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'

export interface InputSelectSmallProps {
  name: string
  label?: string
  items: Value[]
  getValue?: (name: string, value: Value | null) => void
  className?: string
  dataTestId?: string
  onChange?: (item: string | undefined) => void
  defaultValue?: string
  value?: string
  inputClassName?: string
}

export function InputSelectSmall(props: InputSelectSmallProps) {
  const {
    name,
    label,
    items,
    defaultValue,
    value: controlledValue,
    className = '',
    onChange,
    getValue,
    dataTestId,
    inputClassName = '',
  } = props

  const [internalValue, setInternalValue] = useState(defaultValue)

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const onClickItem = (newValue: string) => {
    const selectedItem = items.find((i) => i.value === newValue) || null
    if (!selectedItem) return

    // Only update internal state if not controlled
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }

    // Always call onChange
    onChange && onChange(newValue)

    if (getValue) getValue(name, selectedItem)
  }

  useEffect(() => {
    if (controlledValue === undefined && defaultValue) {
      setInternalValue(defaultValue)
    }
  }, [defaultValue, controlledValue])

  return (
    <div className={`${className} relative flex items-center gap-4`}>
      {label && <label className="shrink-0 text-sm">{label}</label>}
      <select
        data-testid={dataTestId || 'input-select-small'}
        name={name}
        value={value}
        className={twMerge(
          'h-9 w-full cursor-pointer appearance-none rounded border border-neutral-250 bg-neutral-100 px-3 pr-6 text-sm font-medium text-neutral-400 shadow-sm transition-colors hover:bg-neutral-50 hover:outline-brand-500 active:shadow-none disabled:shadow-none hover:[&:not(:active)]:border-neutral-300',
          inputClassName
        )}
        onChange={(e) => onClickItem(e.target.value)}
      >
        {items.map((item: Value, index: number) => (
          <option key={index} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <Icon
        name={IconAwesomeEnum.CHEVRON_DOWN}
        className="pointer-events-none absolute right-4 top-2.5 translate-y-0.5 text-xs leading-3 text-neutral-400"
      />
    </div>
  )
}

export default InputSelectSmall
