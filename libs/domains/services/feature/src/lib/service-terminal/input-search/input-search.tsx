import clsx from 'clsx'
import { useCombobox } from 'downshift'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@qovery/shared/ui'

export interface InputSearchProps {
  data: string[]
  onChange: (value?: string) => void
  placeholder: string
  label: string
  value?: string
  trimLabel?: boolean
}

export function InputSearch({ data, value, onChange, placeholder, label, trimLabel }: InputSearchProps) {
  const [items, setItems] = useState(data)
  const inputRef = useRef<HTMLInputElement>(null)

  const { isOpen, getMenuProps, getInputProps, getItemProps, selectedItem, highlightedIndex, openMenu, closeMenu } =
    useCombobox({
      selectedItem: value ?? null,
      onInputValueChange({ inputValue }) {
        setItems(data.filter((item) => item.toLowerCase().includes(inputValue.toLowerCase())))
      },
      onSelectedItemChange({ selectedItem }) {
        onChange(selectedItem ?? undefined)
        closeMenu()
      },
      items,
    })

  // Reset filtered list when dropdown closes
  useEffect(() => {
    if (!isOpen) setItems(data)
  }, [isOpen, data])

  const displayValue =
    trimLabel && selectedItem ? `${selectedItem.substring(0, 10)}...${selectedItem.slice(-10)}` : selectedItem

  return (
    <div className="relative z-10">
      {/* Trigger button — always visible, shows label + current value */}
      <button
        type="button"
        className="flex h-8 items-center gap-1.5 rounded border border-neutral bg-surface-neutral px-2.5 text-xs text-neutral hover:border-neutral-strong focus:outline-none"
        onClick={() => (isOpen ? closeMenu() : openMenu())}
      >
        {label && <span className="font-medium text-neutral-subtle">{label}</span>}
        <span className="max-w-32 truncate">
          {displayValue ?? <span className="text-neutral-subtle">{placeholder}</span>}
        </span>
        <Icon
          iconName="angle-down"
          className={clsx('text-[10px] text-neutral-subtle transition-transform', { 'rotate-180': isOpen })}
        />
      </button>

      {/* Dropdown */}
      <div
        className={clsx(
          'absolute left-0 top-full mt-1 w-64 overflow-hidden rounded-md border border-neutral bg-surface-neutral shadow-[0_0_32px_rgba(0,0,0,0.08)]',
          { hidden: !isOpen }
        )}
      >
        <div className="relative border-b border-neutral p-2">
          <Icon
            iconName="magnifying-glass"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-neutral-subtle"
          />
          <input
            placeholder="Search…"
            className="h-7 w-full rounded border border-neutral bg-surface-neutral pl-6 pr-2 text-xs text-neutral placeholder:text-neutral-subtle focus:border-brand-strong focus:outline-none"
            {...getInputProps({ ref: inputRef })}
          />
        </div>
        <ul className="m-0 max-h-40 list-none overflow-y-auto p-2" {...getMenuProps()}>
          {items.length > 0 ? (
            items.map((v, index) => (
              <li
                key={v}
                className={clsx(
                  'flex h-9 w-full items-center justify-between rounded px-2 text-xs text-neutral transition-colors hover:bg-surface-neutral-subtle',
                  { 'bg-surface-neutral-subtle': highlightedIndex === index }
                )}
                {...getItemProps({ item: v, index })}
              >
                {trimLabel ? `${v.substring(0, 10)}...${v.slice(-10)}` : v}
                {v === selectedItem && <Icon iconName="check" className="text-brand" />}
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
