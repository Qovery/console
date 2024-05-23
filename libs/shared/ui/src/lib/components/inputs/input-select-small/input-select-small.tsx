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
  inputClassName?: string
}

export function InputSelectSmall(props: InputSelectSmallProps) {
  const {
    name,
    label,
    items,
    defaultValue,
    className = '',
    onChange,
    getValue,
    dataTestId,
    inputClassName = '',
  } = props

  const [value, setValue] = useState(defaultValue)

  const onClickItem = (value: string) => {
    const selectedItem = items.find((i) => i.value === value) || null
    if (!selectedItem) return
    if (value !== defaultValue) {
      setValue(value)
      onChange && onChange(value)
    }
    if (getValue) getValue(name, selectedItem)
  }

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue)
    }
  }, [defaultValue])

  return (
    <div className={`${className} relative flex items-center gap-4`}>
      {label && <label className="shrink-0 text-sm">{label}</label>}
      <select
        data-testid={dataTestId || 'input-select-small'}
        name={name}
        value={value}
        className={twMerge(
          'h-9 w-full cursor-pointer appearance-none rounded border border-neutral-250 bg-neutral-100 px-4 py-2 pb-2 pl-2 pr-6 pt-2 text-sm text-neutral-400',
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
