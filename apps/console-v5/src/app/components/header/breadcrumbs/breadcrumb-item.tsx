import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Link, useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { Icon, InputSearch, Popover, dropdownMenuItemVariants } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export interface BreadcrumbItemData {
  id: string
  label: string
  path: string
  prefix?: ReactNode
  suffix?: ReactNode
  logo_url?: string
}

interface BreadcrumbItemProps {
  item: BreadcrumbItemData
  items?: BreadcrumbItemData[]
}

export function BreadcrumbItem({ item, items }: BreadcrumbItemProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const inputContainerRef = useRef<HTMLDivElement>(null)

  const filteredItems = useMemo(
    () => items?.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())) || [],
    [items, searchQuery]
  )
  const selectedIndex = filteredItems.findIndex((filteredItem) => filteredItem.id === item.id)
  const highlightedIndex =
    filteredItems.length === 0
      ? -1
      : activeIndex >= 0 && activeIndex < filteredItems.length
        ? activeIndex
        : selectedIndex >= 0
          ? selectedIndex
          : 0

  const scrollActiveItemIntoView = useCallback((index: number) => {
    const activeItem = itemRefs.current[index]
    activeItem?.scrollIntoView({ block: 'nearest' })
  }, [])

  const focusSearch = useCallback(() => {
    requestAnimationFrame(() => {
      const input = inputContainerRef.current?.querySelector('input')
      if (input instanceof HTMLInputElement) {
        input.focus()
      }
    })
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)

      if (nextOpen) {
        setActiveIndex(-1)
        focusSearch()
        return
      }

      setActiveIndex(-1)
      setSearchQuery('')
    },
    [focusSearch]
  )

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false)
      setActiveIndex(-1)
      setSearchQuery('')
      navigate({ to: path })
    },
    [navigate]
  )

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()

      if (filteredItems.length === 0) {
        return
      }

      const delta = e.key === 'ArrowDown' ? 1 : -1
      const nextIndex = (highlightedIndex + delta + filteredItems.length) % filteredItems.length
      setActiveIndex(nextIndex)
      scrollActiveItemIntoView(nextIndex)
      focusSearch()
      return
    }

    if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
        e.preventDefault()
        e.stopPropagation()
        handleSelect(filteredItems[highlightedIndex].path)
      }
      return
    }

    // Prevent other keys from interfering with the input, except navigation keys
    if (['Home', 'End'].includes(e.key)) {
      return
    }

    e.stopPropagation()
  }

  if (!items || items.length === 0) {
    return <span className="text-sm font-medium text-neutral">{item.label}</span>
  }

  // XXX: https://github.com/radix-ui/primitives/issues/1342
  // We are waiting for radix combobox primitives
  // So we are using DropdownMenu.Root in combination of Popover.Root
  // to get the flexibility of Popover.Root but keeping the accessibility of
  // DropdownMenu.Root for entries.
  // So both open state should be sync
  return (
    <div className="flex items-center justify-between gap-1">
      <Link
        to={item.path}
        className={twMerge(
          clsx(
            'flex items-center gap-1.5 rounded text-sm font-medium text-neutral-subtle transition-colors hover:text-neutral focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-11',
            {
              'text-neutral': open,
            }
          )
        )}
      >
        {item.prefix}
        {item.label}
        {item.suffix}
      </Link>
      <DropdownMenu.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
          <Popover.Trigger>
            <button
              type="button"
              className={twMerge(
                clsx(
                  'relative top-[1px] flex h-6 w-6 items-center justify-center rounded text-neutral-disabled transition-colors hover:text-neutral focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-11',
                  {
                    'text-neutral': open,
                  }
                )
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M3.67 8.338a.583.583 0 0 1 .826 0L7 10.842l2.504-2.504a.583.583 0 1 1 .825.824L7.412 12.08a.583.583 0 0 1-.824 0L3.67 9.162a.583.583 0 0 1 0-.824M6.588 1.92a.583.583 0 0 1 .824 0l2.917 2.918a.583.583 0 1 1-.825.824L7 3.158 4.496 5.662a.583.583 0 0 1-.825-.824z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </Popover.Trigger>
          <DropdownMenu.Content asChild>
            <Popover.Content
              className="z-dropdown -ml-2.5 flex w-[340px] flex-col gap-3 p-3 pb-0"
              onOpenAutoFocus={(event) => {
                event.preventDefault()
                focusSearch()
              }}
            >
              {/* 
              Keep focus on input while navigating list with keyboard
              https://github.com/radix-ui/primitives/issues/2193#issuecomment-1790564604 
            */}
              <div className="flex flex-col gap-3" onKeyDown={handleInputKeyDown} ref={inputContainerRef}>
                <InputSearch placeholder="Search..." onChange={(value) => setSearchQuery(value)} autofocus />
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {filteredItems.map((listItem, index) => (
                      <DropdownMenu.Item
                        key={listItem.id}
                        onSelect={() => handleSelect(listItem.path)}
                        ref={(node) => {
                          itemRefs.current[index] = node
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={twMerge(
                          dropdownMenuItemVariants({ color: 'brand' }),
                          'justify-between truncate last:mb-3',
                          highlightedIndex === index && 'bg-surface-brand-subtle text-brand'
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Icon
                            iconName="check"
                            className={twMerge(
                              clsx('text-positive opacity-0', {
                                'opacity-100': item.id === listItem.id,
                              })
                            )}
                          />
                          <span className="truncate">{listItem.label}</span>
                        </div>
                      </DropdownMenu.Item>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center">
                    <Icon iconName="wave-pulse" className="text-neutral-subtle" />
                    <p className="mt-1 text-xs font-medium text-neutral-subtle">No result for this search</p>
                  </div>
                )}
              </div>
            </Popover.Content>
          </DropdownMenu.Content>
        </Popover.Root>
      </DropdownMenu.Root>
    </div>
  )
}

export default BreadcrumbItem
