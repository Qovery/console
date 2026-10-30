import { type VariantProps, cva } from 'class-variance-authority'
import { type ReactElement, useRef, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../../icon/icon'

const inputSearchVariants = cva(
  'w-full rounded-md border border-neutral bg-surface-neutral pl-10 pr-6 leading-none text-neutral placeholder:text-neutral-subtle focus:border-brand-strong focus:outline-none focus:transition-[border-color]',
  {
    variants: {
      size: {
        md: 'h-9 text-sm',
        sm: 'h-7 pl-7 pr-7 text-ssm',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

export interface InputSearchProps extends VariantProps<typeof inputSearchVariants> {
  ariaLabel?: string
  placeholder?: string
  // Controls the input value; the input keeps its own value when unset.
  value?: string
  className?: string
  onChange?: (value: string) => void
  isEmpty?: boolean
  emptyContent?: ReactElement
  autofocus?: boolean
  customSize?: string
  // Sizes and places the magnifying glass, to go with the paddings of `customSize`
  iconClassName?: string
}

export function InputSearch(props: InputSearchProps) {
  const {
    ariaLabel,
    placeholder = '',
    value,
    className = '',
    onChange,
    isEmpty = false,
    emptyContent,
    size = 'md',
    customSize,
    autofocus = false,
    iconClassName,
  } = props

  const ref = useRef<HTMLInputElement>(null)
  const [toggleDelete, setToggleDelete] = useState(false)
  const showClearButton = value === undefined ? toggleDelete : value !== ''

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
          iconName="magnifying-glass"
          className={twMerge(
            size === 'sm'
              ? 'pointer-events-none absolute left-2 top-1/2 block -translate-y-1/2 text-ssm leading-none text-neutral-subtle'
              : 'pointer-events-none absolute left-3 top-1/2 block -translate-y-1/2 text-base leading-none text-neutral-subtle',
            iconClassName
          )}
        />
        <input
          data-testid="input-search"
          ref={ref}
          autoFocus={autofocus}
          className={twMerge(inputSearchVariants({ size }), customSize)}
          type="text"
          aria-label={ariaLabel}
          value={value}
          placeholder={placeholder}
          disabled={false}
          onChange={(e) => getValue(e.currentTarget.value)}
          name="search"
        />
        {showClearButton && (
          <button
            type="button"
            title="Clear search"
            aria-label="Clear search"
            className={
              size === 'sm' ? 'absolute right-2 top-1/2 -translate-y-1/2' : 'absolute right-3 top-1/2 -translate-y-1/2'
            }
            onClick={deleteValue}
          >
            <Icon className={size === 'sm' ? 'text-xs text-neutral' : 'text-sm text-neutral'} iconName="circle-xmark" />
          </button>
        )}
      </div>
      {isEmpty && (
        <div>
          {emptyContent ? (
            emptyContent
          ) : (
            <div className="px-3 py-6 text-center">
              <Icon iconName="wave-pulse" className="text-neutral-subtle" />
              <p className="mt-1 text-xs font-medium text-neutral-subtle">No result for this search</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default InputSearch
