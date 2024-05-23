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
        <Icon iconName="magnifying-glass" className="absolute left-2.5 top-1.5 text-xs text-neutral-50" />
        <input
          placeholder={placeholder}
          className="h-7 w-56 rounded border border-neutral-350 bg-transparent pl-7 pr-2 text-xs text-neutral-250 focus:border-brand-400 focus:outline-none"
          {...getInputProps({ ref: inputRef })}
        />
      </div>
      <div
        className={clsx('mt-1 max-h-40 w-full min-w-56 overflow-y-auto rounded bg-neutral-600 p-2', {
          hidden: !isOpen,
        })}
      >
        <ul {...getMenuProps()}>
          {isOpen && items.length > 0 ? (
            items.map((v, index) => (
              <li
                key={v}
                className={clsx(
                  'text-medium flex h-9 w-full items-center justify-between rounded-sm px-2 text-xs text-neutral-50 transition hover:bg-neutral-550',
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
            <p className="text-medium flex w-full flex-col py-2 text-center text-xs text-neutral-50">
              <Icon iconName="wave-pulse" className="mb-1 block" />
              No results found
            </p>
          )}
        </ul>
      </div>
    </div>
  )
}

export default InputSearch
