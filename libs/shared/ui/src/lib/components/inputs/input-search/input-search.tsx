import { useState, useRef, MutableRefObject } from 'react'
import Icon from '../../icon/icon'

export interface InputSearchProps {
  placeholder?: string
  className?: string
  onChange?: (value: string) => void
}

export function InputSearch(props: InputSearchProps) {
  const { placeholder = '', className = '', onChange } = props

  const ref = useRef<HTMLInputElement>(null)
  const [toggleDelete, setToggleDelete] = useState(false)

  const getValue = (value: string) => {
    if (onChange) onChange(value)
    if (value !== '') {
      setToggleDelete(true)
    } else {
      setToggleDelete(false)
    }
  }

  const deleteValue = () => {
    setToggleDelete(false)
    if (ref?.current) ref.current.value = ''
    if (onChange) onChange('')
  }

  return (
    <div className="relative w-full">
      <Icon
        name="icon-solid-magnifying-glass"
        className="absolute left-3 top-1/2 -translate-y-1/2 block text-xs text-text-400 leading-none"
      />
      <input
        ref={ref}
        className={`${className} w-full h-8 rounded border border-element-light-lighter-500 bg-element-light-lighter-300 text-text-600 placeholder:text-text-400 pl-8 pr-6 leading-none text-sm`}
        type="text"
        placeholder={placeholder}
        disabled={false}
        onChange={(e) => getValue(e.currentTarget.value)}
        name="search"
      />
      {toggleDelete && (
        <button
          className="absolute w-3 h-3 rounded-full bg-text-700 flex justify-center items-center right-2 top-1/2 -translate-y-1/2"
          onClick={deleteValue}
        >
          <Icon className="text-element-light-lighter-300 text-[10px]" name="icon-solid-xmark" />
        </button>
      )}
    </div>
  )
}

export default InputSearch
