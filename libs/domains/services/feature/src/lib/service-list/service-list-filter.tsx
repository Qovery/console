import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Column, Row, RowData } from '@tanstack/react-table'
import { Fragment, type ReactNode, useMemo, useState } from 'react'
import { Button, Icon, IconAwesomeEnum, Popover, Truncate } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customFacetEntry: ({ value, count, row }: { value: any; count: number; row?: Row<TData> }) => ReactNode
  }
}

// NOTE: This component can be standardize in our design system,
// however we are waiting for other feature / designs example to show off
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ServiceListFilter({ column }: { column: Column<any, unknown> }) {
  const [open, setOpen] = useState(false)
  const sortedUniqueValues = useMemo(
    () => Array.from(column.getFacetedUniqueValues().entries()).sort(([a], [b]) => a?.localeCompare?.(b) ?? 0),
    [column.getFacetedUniqueValues()]
  )

  const hideCount = sortedUniqueValues.every(([, count]) => count === 1)

  // XXX: https://github.com/radix-ui/primitives/issues/1342
  // We are waiting for radix combobox primitives
  // So we are using DropdownMenu.Root in combination of Popover.Root
  // to get the flexibility of Popover.Root but keeping the accessiblity of
  // DropdownMenu.Root for entries.
  // So both open state should be sync
  return (
    <DropdownMenu.Root open={open} onOpenChange={(open) => setOpen(open)}>
      <Popover.Root open={open} onOpenChange={(open) => setOpen(open)}>
        <div className="inline-block relative">
          <Popover.Trigger>
            <Button
              className={twMerge('text-xs gap-1', column.getIsFiltered() ? 'pr-6' : '')}
              color={column.getIsFiltered() ? 'brand' : 'neutral'}
              variant={column.getIsFiltered() ? 'solid' : 'surface'}
            >
              {column.getIsFiltered() ? (
                <>
                  <Truncate text={(column.getFilterValue() as string[]).join(', ')} truncateLimit={18} />
                </>
              ) : (
                <>
                  {column.columnDef.header?.toString()}
                  <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
                </>
              )}
            </Button>
          </Popover.Trigger>
          {column.getIsFiltered() ? (
            <button
              type="button"
              className="absolute right-0 px-2 text-white cursor-pointer h-7 text-center leading-7"
              onClick={() => column.setFilterValue([])}
            >
              <Icon name={IconAwesomeEnum.XMARK} />
            </button>
          ) : null}
        </div>
        <DropdownMenu.Content asChild>
          <Popover.Content className="p-2 w-60">
            {sortedUniqueValues.map(([value, count], index) => (
              <Fragment key={value ?? index}>
                <Popover.Close>
                  <DropdownMenu.Item
                    className="flex items-center justify-between text-neutral-400 hover:text-brand-500 hover:bg-neutral-100 p-2 rounded gap-2 cursor-pointer"
                    onClick={() => column.setFilterValue((arr: [] = []) => [...arr, value])}
                  >
                    {column.columnDef.meta?.customFacetEntry ? (
                      column.columnDef.meta.customFacetEntry({
                        value,
                        count,
                        row: column.getFacetedRowModel().flatRows.find((rows) => rows.getValue(column.id) === value),
                      })
                    ) : (
                      <>
                        <span className="text-sm font-medium">{value}</span>
                        <span className="text-xs text-neutral-350">{hideCount ? null : count}</span>
                      </>
                    )}
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

export default ServiceListFilter
