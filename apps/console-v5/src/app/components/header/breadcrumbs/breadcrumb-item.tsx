import { Link, useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'
import { Command } from 'cmdk'
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { Command as CommandMenu, Icon, Popover } from '@qovery/shared/ui'
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
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredItems = useMemo(
    () => items?.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())) || [],
    [items, searchQuery]
  )

  const focusSearch = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  const scrollToCurrentItem = useCallback(() => {
    requestAnimationFrame(() => {
      const container = listRef.current
      const currentItem = container?.querySelector('[data-current-item="true"]')

      if (!(container instanceof HTMLElement) || !(currentItem instanceof HTMLElement)) {
        return
      }

      const containerRect = container.getBoundingClientRect()
      const itemRect = currentItem.getBoundingClientRect()
      const isOutsideViewport = itemRect.top < containerRect.top || itemRect.bottom > containerRect.bottom

      if (isOutsideViewport) {
        currentItem.scrollIntoView({ block: 'nearest' })
      }
    })
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)

      if (nextOpen) {
        focusSearch()
        scrollToCurrentItem()
        return
      }

      setSearchQuery('')
    },
    [focusSearch, scrollToCurrentItem]
  )

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false)
      setSearchQuery('')
      navigate({ to: path })
    },
    [navigate]
  )

  if (!items || items.length === 0) {
    return <span className="text-sm font-medium text-neutral">{item.label}</span>
  }

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
        <Popover.Content
          className="z-dropdown -ml-2.5 flex w-[340px] flex-col p-3 pb-0"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            focusSearch()
          }}
        >
          <Command shouldFilter={false} loop>
            <div className="mb-3">
              <div className="relative w-full">
                <Icon
                  iconName="magnifying-glass"
                  className="absolute left-3 top-1/2 block -translate-y-1/2 text-base leading-none text-neutral-subtle"
                />
                <CommandMenu.Input
                  ref={inputRef}
                  placeholder="Search..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="h-9 border border-neutral bg-surface-neutral py-0 pl-10 pr-6 text-sm"
                />
              </div>
            </div>
            <CommandMenu.List
              ref={listRef}
              className="max-h-64 min-h-12 pb-3 [&>[cmdk-list-sizer]]:mx-0 [&>[cmdk-list-sizer]]:my-0"
            >
              <CommandMenu.Empty>
                <div className="px-3 py-6 text-center">
                  <Icon iconName="wave-pulse" className="text-neutral-subtle" />
                  <p className="mt-1 text-xs font-medium text-neutral-subtle">No result for this search</p>
                </div>
              </CommandMenu.Empty>
              {filteredItems.map((listItem) => (
                <CommandMenu.Item
                  key={listItem.id}
                  data-current-item={item.id === listItem.id}
                  value={listItem.label}
                  keywords={[listItem.path]}
                  onSelect={() => handleSelect(listItem.path)}
                  className="mb-1 justify-between truncate rounded px-2 py-2 text-sm font-medium text-neutral last:mb-0 data-[selected=true]:bg-surface-brand-subtle data-[selected=true]:text-brand"
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
                </CommandMenu.Item>
              ))}
            </CommandMenu.List>
          </Command>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}

export default BreadcrumbItem
