/*
 * A compact select drawn like the console's switchers (the breadcrumb's organization picker):
 * a bordered trigger with the value and angles-up-down, then a popover list with a check on the
 * current value, keyboard navigation, and a search field above 8 options. Console design system
 * only (Popover, Command), so the billing kit and the back office share it.
 */
import { Command } from 'cmdk'
import { type ReactNode, useMemo, useRef, useState } from 'react'
import { Command as CommandMenu, Icon, Popover } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export interface Opt {
  value: string
  label: ReactNode
  description?: string
  isDisabled?: boolean
}

export function CompactSelect({
  value,
  onChange,
  options,
  label,
  ariaLabel,
  className,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  options: Opt[]
  label?: string
  ariaLabel?: string
  className?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const searchable = options.length > 8
  const current = options.find((o) => o.value === value)
  const text = (o: Opt) => (typeof o.label === 'string' ? o.label : o.value)
  const fieldLabel = ariaLabel ?? label
  const selectionLabel = current ? text(current) : 'Select…'
  const shown = useMemo(
    () =>
      q
        ? options.filter(
            (o) => text(o).toLowerCase().includes(q.toLowerCase()) || o.value.toLowerCase().includes(q.toLowerCase())
          )
        : options,
    [options, q]
  )
  const onOpen = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setQ('')
      return
    }
    requestAnimationFrame(() =>
      listRef.current?.querySelector('[data-current="true"]')?.scrollIntoView({ block: 'nearest' })
    )
  }
  const pick = (v: string) => {
    setOpen(false)
    setQ('')
    if (v !== value) onChange(v)
  }
  const control = (
    <span className={twMerge('inline-flex items-center gap-2', className)}>
      {label && <span className="shrink-0 text-sm text-neutral">{label}</span>}
      <Popover.Root open={open} onOpenChange={onOpen}>
        <Popover.Trigger disabled={disabled}>
          <button
            type="button"
            aria-label={fieldLabel ? `${fieldLabel}: ${selectionLabel}` : undefined}
            disabled={disabled}
            className={twMerge(
              'flex h-8 min-w-28 max-w-80 items-center justify-between gap-2 rounded border border-neutral bg-surface-neutral px-3 text-left text-sm text-neutral transition-colors hover:border-neutral-strong focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-text disabled:cursor-not-allowed disabled:text-neutral-disabled',
              open && 'border-brand-strong'
            )}
          >
            <span className="min-w-0 flex-1 truncate">
              {current ? current.label : <span className="text-neutral-subtle">Select…</span>}
            </span>
            <Icon iconName="angles-up-down" className="shrink-0 text-sm text-neutral-subtle" />
          </button>
        </Popover.Trigger>
        <Popover.Content align="start" className="z-dropdown flex w-[320px] max-w-[calc(100vw-24px)] flex-col p-2">
          <Command label={fieldLabel ?? 'Options'} shouldFilter={false} loop>
            {searchable && (
              <div className="relative mb-2">
                <Icon
                  iconName="magnifying-glass"
                  className="absolute left-3 top-1/2 block -translate-y-1/2 text-sm leading-none text-neutral-subtle"
                />
                <CommandMenu.Input
                  autoFocus
                  placeholder="Search..."
                  value={q}
                  onValueChange={setQ}
                  className="h-9 rounded-sm border border-neutral bg-surface-neutral py-0 pl-9 pr-3 text-sm"
                />
              </div>
            )}
            {!searchable && <Command.Input readOnly className="sr-only" />}
            <CommandMenu.List ref={listRef} className="max-h-72 [&>[cmdk-list-sizer]]:mx-0 [&>[cmdk-list-sizer]]:my-0">
              <CommandMenu.Empty>
                <p className="px-3 py-4 text-center text-xs font-medium text-neutral-subtle">
                  No result for this search
                </p>
              </CommandMenu.Empty>
              {shown.map((o) => (
                <CommandMenu.Item
                  key={o.value}
                  value={o.value + ' ' + text(o)}
                  disabled={o.isDisabled}
                  data-current={o.value === value}
                  onSelect={() => pick(o.value)}
                  className="mb-0.5 flex items-center gap-2.5 rounded px-2 py-1.5 text-sm text-neutral last:mb-0 data-[selected=true]:bg-surface-brand-subtle data-[disabled=true]:text-neutral-disabled data-[selected=true]:text-brand"
                >
                  <Icon
                    iconName="check"
                    className={twMerge(
                      'shrink-0 text-sm text-positive',
                      o.value === value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.label}</span>
                    {o.description && (
                      <span className="block truncate text-sm text-neutral-subtle">{o.description}</span>
                    )}
                  </span>
                </CommandMenu.Item>
              ))}
            </CommandMenu.List>
          </Command>
        </Popover.Content>
      </Popover.Root>
    </span>
  )
  return control
}
