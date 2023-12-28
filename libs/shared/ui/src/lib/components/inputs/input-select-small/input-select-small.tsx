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
    <div className={`${className} relative flex gap-4 items-center`}>
      {label && <label className="text-sm shrink-0">{label}</label>}
      <select
        data-testid={dataTestId || 'input-select-small'}
        name={name}
        value={value}
        className={twMerge(
          'h-9 px-4 py-2 cursor-pointer pl-2 pr-6 pt-2 pb-2 bg-neutral-100 border border-neutral-250 text-neutral-400 rounded text-sm appearance-none w-full',
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
        className="absolute top-2.5 right-4 text-xs text-neutral-400 leading-3 translate-y-0.5 pointer-events-none"
      />
    </div>
  )
}

export default InputSelectSmall
