import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { type Column } from '@tanstack/react-table'
import { type DeploymentHistoryEnvironmentV2, type QueuedDeploymentRequestWithStages } from 'qovery-typescript-axios'
import { Fragment, useMemo, useState } from 'react'
import { Button, Icon, Popover, Truncate, dropdownMenuItemVariants } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

type FilterValue = {
  origin?: string[]
  triggeredBy?: string[]
}

export function TableFilterTriggerBy({
  column,
}: {
  column: Column<DeploymentHistoryEnvironmentV2 | QueuedDeploymentRequestWithStages, unknown>
}) {
  const [open, setOpen] = useState(false)

  const triggeredByValues = useMemo(() => {
    const values = new Set<string>()
    column.getFacetedRowModel().rows.forEach((row) => {
      const triggeredBy = row.original.auditing_data?.triggered_by
      if (triggeredBy) values.add(triggeredBy)
    })
    return Array.from(values).sort()
  }, [column.getFacetedRowModel()])

  const sortedUniqueValues = useMemo(
    () => Array.from(column.getFacetedUniqueValues().entries()).sort(([a], [b]) => a?.localeCompare?.(b) ?? 0),
    [column.getFacetedUniqueValues()]
  )

  const currentFilter = (column.getFilterValue() as FilterValue) || { origin: [], triggeredBy: [] }

  const handleOriginFilter = (value: string) => {
    const newFilter = {
      ...currentFilter,
      triggeredBy: [],
      origin: [...(currentFilter.origin || []), value],
    }
    column.setFilterValue(newFilter)
  }

  const handleTriggeredByFilter = (value: string) => {
    const newFilter = {
      ...currentFilter,
      origin: [],
      triggeredBy: [...(currentFilter.triggeredBy || []), value],
    }
    column.setFilterValue(newFilter)
  }

  const clearFilter = () => {
    column.setFilterValue(undefined)
  }

  const getDisplayValue = () => {
    if (!column.getIsFiltered()) return null

    const filter = column.getFilterValue() as FilterValue
    const parts: string[] = []

    if (filter.origin?.length) {
      parts.push(filter.origin.join(', '))
    }
    if (filter.triggeredBy?.length) {
      parts.push(filter.triggeredBy.join(', '))
    }

    return parts.join(' / ')
  }

  const displayValue = getDisplayValue()

  return (
    <DropdownMenu.Root open={open} onOpenChange={(open) => setOpen(open)}>
      <Popover.Root open={open} onOpenChange={(open) => setOpen(open)}>
        <div className="relative inline-block">
          <Popover.Trigger>
            <Button
              className={twMerge('gap-1 whitespace-nowrap text-xs capitalize', column.getIsFiltered() ? 'pr-6' : '')}
              color={column.getIsFiltered() ? 'brand' : 'neutral'}
              variant={column.getIsFiltered() ? 'solid' : 'surface'}
            >
              {column.getIsFiltered() ? (
                <span className="block max-w-52 truncate">
                  {displayValue !== 'API' && displayValue !== 'CLI'
                    ? displayValue?.toLowerCase().replace('_', ' ') ?? ''
                    : displayValue}
                </span>
              ) : (
                <>
                  {column.columnDef.header?.toString()}
                  <Icon iconName="chevron-down" />
                </>
              )}
            </Button>
          </Popover.Trigger>
          {column.getIsFiltered() ? (
            <button
              type="button"
              className="absolute right-0 h-7 cursor-pointer px-2 text-center leading-7 text-white"
              onClick={clearFilter}
            >
              <Icon iconName="xmark" />
            </button>
          ) : null}
        </div>
        <DropdownMenu.Content asChild>
          <Popover.Content className="max-h-80 w-60 overflow-y-auto p-2">
            <span className="px-2 pb-2 pt-1 text-sm text-neutral-350">Trigger by</span>
            {sortedUniqueValues.map(
              ([value]) =>
                value != null && (
                  <Fragment key={value}>
                    <Popover.Close>
                      <DropdownMenu.Item
                        className={twMerge(
                          dropdownMenuItemVariants({ color: 'brand' }),
                          'justify-between text-sm font-medium capitalize'
                        )}
                        onSelect={() => handleOriginFilter(value)}
                      >
                        {value !== 'API' && value !== 'CLI' ? value?.toLowerCase().replace('_', ' ') : value}
                      </DropdownMenu.Item>
                    </Popover.Close>
                  </Fragment>
                )
            )}
            <hr className="my-2 -ml-2 w-[calc(100%+20px)] border-neutral-200" />
            <span className="px-2 pb-2 pt-1 text-sm text-neutral-350">From</span>
            {triggeredByValues.map((value) => (
              <Fragment key={value}>
                <Popover.Close>
                  <DropdownMenu.Item
                    className={twMerge(
                      dropdownMenuItemVariants({ color: 'brand' }),
                      'justify-between text-sm font-medium'
                    )}
                    onSelect={() => handleTriggeredByFilter(value)}
                  >
                    <Truncate text={value} truncateLimit={25} />
                  </DropdownMenu.Item>
                </Popover.Close>
              </Fragment>
            ))}
          </Popover.Content>
        </DropdownMenu.Content>
      </Popover.Root>
    </DropdownMenu.Root>
  )
}

export default TableFilterTriggerBy
