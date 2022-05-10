import { useState, useRef } from 'react'
import Icon from '../../icon/icon'

export interface InputSearchProps {
  placeholder?: string
  className?: string
  onChange?: (value: string) => void
  isEmpty?: boolean
  emptyContent?: React.ReactElement
  autofocus?: boolean
}

export function InputSearch(props: InputSearchProps) {
  const { placeholder = '', className = '', onChange, isEmpty = false, emptyContent } = props

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
    <>
      <div className="relative w-full">
        <Icon
          name="icon-solid-magnifying-glass"
          className="absolute left-3 top-1/2 -translate-y-1/2 block text-xs text-text-400 leading-none"
        />
        <input
          ref={ref}
          className={`${className} w-full h-8 rounded border border-element-light-lighter-500 bg-element-light-lighter-300 text-text-600 placeholder:text-text-400 pl-8 pr-6 leading-none focus:outline-none focus:border-brand-400 focus:transition-[border-color] text-xs`}
          type="text"
          placeholder={placeholder}
          disabled={false}
          onChange={(e) => getValue(e.currentTarget.value)}
          name="search"
        />
        {toggleDelete && (
          <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={deleteValue}>
            <Icon className="text-text-400 text-sm" name="icon-solid-circle-xmark" />
          </button>
        )}
      </div>
      {isEmpty && (
        <div>
          {emptyContent ? (
            emptyContent
          ) : (
            <div className="text-center px-3 py-6">
              <Icon name="icon-solid-wave-pulse" className="text-text-400" />
              <p className="text-text-400 font-medium text-xs mt-1">No result for this search</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default InputSearch
