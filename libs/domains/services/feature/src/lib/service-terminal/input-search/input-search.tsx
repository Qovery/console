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
        variant="surface"
        size="md"
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
      <div className={clsx({ hidden: selectedItem }, 'relative')}>
        <Icon
          iconName="magnifying-glass"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-subtle"
        />
        <input
          placeholder={placeholder}
          className="h-8 w-56 rounded border border-neutral bg-surface-neutral pl-7 pr-2 text-xs text-neutral placeholder:text-sm placeholder:text-neutral-subtle focus:border-brand-8 focus:outline-none focus:transition-[border-color]"
          {...getInputProps({ ref: inputRef })}
        />
      </div>
      <div
        className={clsx(
          'mt-1 max-h-40 w-full min-w-56 overflow-y-auto rounded-md border border-neutral bg-surface-neutral p-2 shadow-[0_0_32px_rgba(0,0,0,0.08)]',
          {
            hidden: !isOpen,
          }
        )}
      >
        <ul className="m-0 list-none p-0" {...getMenuProps()}>
          {isOpen && items.length > 0 ? (
            items.map((v, index) => (
              <li
                key={v}
                className={clsx(
                  'flex h-9 w-full items-center justify-between rounded px-2 text-xs text-neutral transition-colors hover:bg-surface-neutral-subtle',
                  {
                    'bg-surface-neutral-subtle': highlightedIndex === index,
                  }
                )}
                {...getItemProps({ item: v, index })}
              >
                {trimLabel ? `${v.substring(0, 10)}...${v.slice(-10)}` : v}
                {v === selectedItem && <Icon iconName="check" />}
              </li>
            ))
          ) : (
            <p className="flex w-full flex-col items-center py-2 text-center text-xs text-neutral-subtle">
              <Icon iconName="wave-pulse" className="mb-1" />
              No results found
            </p>
          )}
        </ul>
      </div>
    </div>
  )
}

export default InputSearch
