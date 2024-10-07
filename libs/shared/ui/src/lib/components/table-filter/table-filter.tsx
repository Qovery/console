import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Column, Row, RowData } from '@tanstack/react-table'
import { Fragment, type ReactNode, useMemo, useState } from 'react'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { Button } from '../button/button'
import { dropdownMenuItemVariants } from '../dropdown-menu/dropdown-menu'
import { Icon } from '../icon/icon'
import { Popover } from '../popover/popover'
import { Truncate } from '../truncate/truncate'

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customFacetEntry?: ({ value, count, row }: { value: any; count: number; row?: Row<TData> }) => ReactNode
    customFilterValue?: ({ filterValue }: { filterValue: string[] }) => ReactNode
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TableFilter({ column }: { column: Column<any, unknown> }) {
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
        <div className="relative inline-block">
          <Popover.Trigger>
            <Button
              className={twMerge('gap-1 whitespace-nowrap text-xs', column.getIsFiltered() ? 'pr-6' : '')}
              color={column.getIsFiltered() ? 'brand' : 'neutral'}
              variant={column.getIsFiltered() ? 'solid' : 'surface'}
            >
              {column.getIsFiltered() ? (
                column.columnDef.meta?.customFilterValue ? (
                  column.columnDef.meta.customFilterValue({ filterValue: column.getFilterValue() as string[] })
                ) : (
                  <Truncate
                    text={upperCaseFirstLetter((column.getFilterValue() as string[]).join(', '))}
                    truncateLimit={18}
                  />
                )
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
              onClick={() => column.setFilterValue(undefined)}
            >
              <Icon iconName="xmark" />
            </button>
          ) : null}
        </div>
        <DropdownMenu.Content asChild>
          <Popover.Content className="max-h-80 w-60 overflow-y-auto p-2">
            {sortedUniqueValues.map(
              ([value, count]) =>
                value != null && (
                  <Fragment key={value}>
                    <Popover.Close>
                      <DropdownMenu.Item
                        className={twMerge(dropdownMenuItemVariants({ color: 'brand' }), 'justify-between')}
                        onSelect={() => column.setFilterValue((arr: [] = []) => [...new Set([...arr, value])])}
                      >
                        {column.columnDef.meta?.customFacetEntry ? (
                          column.columnDef.meta.customFacetEntry({
                            value,
                            count,
                            row: column
                              .getFacetedRowModel()
                              .flatRows.find((rows) => rows.getValue(column.id) === value),
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
                )
            )}
          </Popover.Content>
        </DropdownMenu.Content>
      </Popover.Root>
    </DropdownMenu.Root>
  )
}

export default TableFilter
