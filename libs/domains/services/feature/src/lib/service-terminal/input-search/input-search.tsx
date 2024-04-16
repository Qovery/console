import clsx from 'clsx'
import { useCombobox } from 'downshift'
import { useRef, useState } from 'react'
import { Button, Icon } from '@qovery/shared/ui'

export interface InputSearchProps {
  data: string[]
  onChange: (value?: string) => void
  placeholder: string
  value?: string
  trimLabel?: boolean
}

export function InputSearch({ data, value, onChange, placeholder, trimLabel }: InputSearchProps) {
  const [items, setItems] = useState(data)
  const inputRef = useRef<HTMLInputElement>(null)

  // https://github.com/radix-ui/primitives/issues/1342
  // We are waiting for radix combobox primitives
  // So we are using Downshift
  const { isOpen, getMenuProps, getInputProps, getItemProps, selectedItem, highlightedIndex, reset } = useCombobox({
    onInputValueChange({ inputValue }) {
      setItems(data.filter((item) => item.toLowerCase().includes(inputValue.toLowerCase())))
    },
    onSelectedItemChange({ selectedItem }) {
      onChange(selectedItem)
    },
    items,
  })

  return (
    // XTerm using some z-index and absolute positioning that's why we need z-index here
    <div className="relative z-10">
      <Button
        color="neutral"
        className={!selectedItem ? 'hidden' : ''}
        onClick={() => {
          reset()
          onChange(undefined)
          // Timeout is necessary to allow focused input
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
      >
        {value}
        <span>
          <Icon iconName="xmark" className="ml-2 text-sm" />
        </span>
      </Button>
      <div className={selectedItem ? 'hidden' : ''}>
        <Icon iconName="magnifying-glass" className="text-neutral-50 absolute left-2.5 top-1.5 text-xs" />
        <input
          placeholder={placeholder}
          className="w-56 h-7 bg-transparent text-xs text-neutral-250 rounded pl-7 pr-2 border border-neutral-350 focus:outline-none focus:border-brand-400"
          {...getInputProps({ ref: inputRef })}
        />
      </div>
      <div
        className={clsx('mt-1 bg-neutral-600 p-2 rounded w-full max-h-40 overflow-y-auto min-w-56', {
          hidden: !isOpen,
        })}
      >
        <ul {...getMenuProps()}>
          {isOpen && items.length > 0 ? (
            items.map((v, index) => (
              <li
                key={v}
                className={clsx(
                  'flex w-full h-9 items-center justify-between px-2 text-neutral-50 text-xs text-medium hover:bg-neutral-550 rounded-sm transition',
                  {
                    'bg-neutral-550': highlightedIndex === index,
                  }
                )}
                {...getItemProps({ item: v, index })}
              >
                {trimLabel ? `${v.substring(0, 10)}...${v.slice(-10)}` : v}
                {v === selectedItem && <Icon iconName="check" />}
              </li>
            ))
          ) : (
            <p className="flex flex-col w-full text-center text-neutral-50 text-xs text-medium py-2">
              <Icon iconName="wave-pulse" className="block mb-1" />
              No results found
            </p>
          )}
        </ul>
      </div>
    </div>
  )
}

export default InputSearch
