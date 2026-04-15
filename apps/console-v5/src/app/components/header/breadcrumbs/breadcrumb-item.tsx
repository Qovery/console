import { Link, useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'
import { Command } from 'cmdk'
import { type MouseEvent, type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { Button, Command as CommandMenu, Icon, Popover, Truncate } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export interface BreadcrumbItemData {
  id: string
  label: string
  path: string
  prefix?: ReactNode
  suffix?: ReactNode
  logo_url?: string
}

export interface BreadcrumbMenuAction {
  label: string
  path: string
}

interface BreadcrumbItemProps {
  item: BreadcrumbItemData
  items?: BreadcrumbItemData[]
  isCurrentScope?: boolean
  footerAction?: BreadcrumbMenuAction
}

export function BreadcrumbItem({ item, items, isCurrentScope = false, footerAction }: BreadcrumbItemProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const labelClassName = twMerge(
    clsx('block min-w-0 truncate', {
      'max-w-44 md:max-w-64 lg:max-w-80': isCurrentScope,
      'max-w-32 md:max-w-40 lg:max-w-52': !isCurrentScope,
    })
  )
  const linkClassName =
    'flex min-w-0 items-center gap-1.5 whitespace-nowrap rounded text-sm font-medium transition-colors hover:text-neutral focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-11'

  const filteredItems = useMemo(
    () => items?.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())) || [],
    [items, searchQuery]
  )

  const shouldRenderMenu = Boolean(footerAction) || (items?.length ?? 0) > 1

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

  const handleMenuLinkClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation()
    setOpen(false)
  }, [])

  if (!shouldRenderMenu) {
    return (
      <Link
        to={item.path}
        className={twMerge(
          clsx(linkClassName, {
            'text-neutral-subtle': !isCurrentScope,
            'text-neutral': isCurrentScope,
          })
        )}
      >
        {item.prefix && <div className="shrink-0">{item.prefix}</div>}
        <span className={labelClassName}>
          <Truncate text={item.label} truncateLimit={30} />
        </span>
        {item.suffix && <div className="shrink-0">{item.suffix}</div>}
      </Link>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Link
        to={item.path}
        className={twMerge(
          clsx(linkClassName, {
            'text-neutral-subtle': !isCurrentScope,
            'text-neutral': isCurrentScope || open,
          })
        )}
      >
        {item.prefix && <div className="shrink-0">{item.prefix}</div>}
        <span className={labelClassName}>
          <Truncate text={item.label} truncateLimit={30} />
        </span>
        {item.suffix && <div className="shrink-0">{item.suffix}</div>}
      </Link>
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger>
          <Button
            variant="plain"
            color="neutral"
            size="xs"
            iconOnly
            className={twMerge(
              clsx(
                'relative shrink-0 text-neutral-disabled transition-colors hover:text-neutral focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-11',
                {
                  'text-neutral': open,
                }
              )
            )}
          >
            <Icon iconName="angles-up-down" />
          </Button>
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
                  className="h-9 rounded-sm border border-neutral bg-surface-neutral py-0 pl-10 pr-6 text-sm"
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
                  keywords={[listItem.label, listItem.path]}
                  onSelect={() => handleSelect(listItem.path)}
                  className="mb-1 truncate rounded px-2 py-2 text-sm font-medium text-neutral last:mb-0 data-[selected=true]:bg-surface-brand-subtle data-[selected=true]:text-brand"
                >
                  <Link
                    to={listItem.path}
                    className="flex w-full min-w-0 items-center gap-3"
                    onClick={handleMenuLinkClick}
                  >
                    <Icon
                      iconName="check"
                      className={twMerge(
                        clsx('text-positive opacity-0', {
                          'opacity-100': item.id === listItem.id,
                        })
                      )}
                    />
                    {listItem.prefix && <div className="shrink-0">{listItem.prefix}</div>}
                    <span className="min-w-0 flex-1 truncate">{listItem.label}</span>
                    {listItem.suffix && <div className="shrink-0">{listItem.suffix}</div>}
                  </Link>
                </CommandMenu.Item>
              ))}
            </CommandMenu.List>
            {footerAction && (
              <div className="-mx-3 w-[calc(100%+24px)] shrink-0 border-t border-neutral px-3 py-2">
                <CommandMenu.Item
                  forceMount
                  value={footerAction.label}
                  keywords={[footerAction.label, footerAction.path, 'create organization']}
                  onSelect={() => handleSelect(footerAction.path)}
                  className="h-auto rounded px-2 py-2 text-sm font-medium text-neutral hover:bg-surface-neutral-subtle data-[selected=true]:bg-surface-brand-subtle data-[selected=true]:text-brand"
                >
                  <Link
                    to={footerAction.path}
                    className="flex w-full min-w-0 items-center gap-2"
                    onClick={handleMenuLinkClick}
                  >
                    <Icon iconName="circle-plus" iconStyle="regular" className="text-base text-brand" />
                    <span className="min-w-0 truncate">{footerAction.label}</span>
                  </Link>
                </CommandMenu.Item>
              </div>
            )}
          </Command>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}

export default BreadcrumbItem
