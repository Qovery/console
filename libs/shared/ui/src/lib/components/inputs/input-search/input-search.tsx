import { type ReactElement, useRef, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../../icon/icon'

export interface InputSearchProps {
  placeholder?: string
  className?: string
  onChange?: (value: string) => void
  isEmpty?: boolean
  emptyContent?: ReactElement
  autofocus?: boolean
  customSize?: string
}

export function InputSearch(props: InputSearchProps) {
  const {
    placeholder = '',
    className = '',
    onChange,
    isEmpty = false,
    emptyContent,
    customSize = 'h-9 text-xs',
    autofocus = false,
  } = props

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
      <div className={twMerge('relative w-full', className)}>
        <Icon
          name="icon-solid-magnifying-glass"
          className="absolute left-3 top-1/2 -translate-y-1/2 block text-base text-neutral-400 dark:text-white leading-none"
        />
        <input
          data-testid="input-search"
          ref={ref}
          autoFocus={autofocus}
          className={twMerge(
            'w-full rounded border border-neutral-250 dark:border-neutral-350 dark:bg-transparent text-neutral-400 dark:text-white placeholder:text-neutral-350 dark:placeholder:text-neutral-250 pl-10 pr-6 leading-none focus:outline-none focus:border-brand-400 focus:transition-[border-color]',
            customSize
          )}
          type="text"
          placeholder={placeholder}
          disabled={false}
          onChange={(e) => getValue(e.currentTarget.value)}
          name="search"
        />
        {toggleDelete && (
          <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={deleteValue}>
            <Icon className="text-neutral-400 dark:text-white text-sm" iconName="circle-xmark" />
          </button>
        )}
      </div>
      {isEmpty && (
        <div>
          {emptyContent ? (
            emptyContent
          ) : (
            <div className="text-center px-3 py-6">
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="text-neutral-350 font-medium text-xs mt-1">No result for this search</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default InputSearch
