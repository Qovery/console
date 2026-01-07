import { type Dispatch, type ReactNode, type SetStateAction, useEffect, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { TableHeadDatePickerData, TableHeadDatePickerFilter } from './table-head-datepicker/table-head-datepicker'
import { TableHeadFilter } from './table-head-filter/table-head-filter'
import TableHeadHierarchicalFilter, {
  HierarchicalMenuItem,
  NavigationLevel,
  SelectedItem,
} from './table-head-hierarchical-filter/table-head-hierarchical-filter'
import TableHeadSort from './table-head-sort/table-head-sort'

export interface TableFilterProps {
  key?: string
  value?: string
}

export interface TableProps<T> {
  children: ReactNode
  dataHead: TableHeadProps<T>[]
  className?: string
  classNameHead?: string
  columnsWidth?: string
  data?: T[]
  setFilter?: Dispatch<SetStateAction<TableFilterProps[]>>
  filter?: TableFilterProps[]
  setDataSort?: Dispatch<SetStateAction<T[]>>
  defaultSortingKey?: keyof T
}

export interface TableHeadProps<T> {
  title: string
  className?: string
  classNameTitle?: string
  menuWidth?: number
  filter?: TableHeadCustomFilterProps<T>[]
  sort?: {
    key: string
  }
  // This option lets display a datepicker and not show menus
  datePickerData?: TableHeadDatePickerData
  // This option displays a hierarchic filter
  hierarchicalFilter?: TableHierarchicalFilterProps
}

export interface HierarchicalFilterResult {
  items: HierarchicalMenuItem[]
  shouldDrillDown: boolean
  filterKey: string
}

export interface TableHierarchicalFilterProps {
  key: string
  initialData: HierarchicalMenuItem[]
  initialSelectedItems?: SelectedItem[]
  initialNavigationStack?: NavigationLevel[]
  initialLevel?: number
  onLoadMenusToDisplay: (
    selectedItems: SelectedItem[],
    navigationStack: NavigationLevel[]
  ) => Promise<HierarchicalFilterResult | null>
  computeDisplayByLabel: (filterKey: string, selectedItem?: SelectedItem) => string
  onSelectionChange: (selectedItems: SelectedItem[]) => void
  onFilterChange?: (filter: TableFilterProps[], currentSelectedItems: SelectedItem[]) => SelectedItem[]
}

export interface TableHeadCustomFilterProps<T> {
  key: string
  search?: boolean
  title?: string
  itemsCustom?: string[]
  itemContentCustom?: (data: T, currentFilter: string, item?: string) => ReactNode
  hideFilterNumber?: boolean
  sortAlphabetically?: boolean
}

/**
 * @deprecated Prefer TablePrimitives + tanstack-table for type-safety and documentation
 */
export function Table<T>({
  dataHead,
  className,
  classNameHead = '',
  columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
  children,
  data,
  filter,
  setFilter,
  setDataSort,
  defaultSortingKey,
}: TableProps<T>) {
  const [isSorted, setIsSorted] = useState(false)

  useEffect(() => {
    if (!isSorted && defaultSortingKey && data && setDataSort) {
      const sortedData = data.sort((a, b) =>
        (a[defaultSortingKey] as string).toLowerCase() < (b[defaultSortingKey] as string).toLowerCase() ? 1 : -1
      )
      setDataSort(sortedData)
    }
  }, [data, defaultSortingKey, isSorted, setDataSort])

  return (
    <div className={twMerge('flex flex-col-reverse rounded-sm bg-white', className)}>
      <div className="grow">{children}</div>
      <div
        data-testid="table-container"
        className={`sticky top-0 grid h-10 items-center border-b border-b-neutral-200 bg-white ${classNameHead}`}
        style={{ gridTemplateColumns: columnsWidth }}
      >
        {dataHead.map(
          (
            {
              title,
              className = 'px-4 py-2',
              classNameTitle = 'text-neutral-400 ',
              filter: hasFilter,
              sort,
              datePickerData,
              hierarchicalFilter,
            },
            index
          ) => (
            <div key={index} className={className}>
              {!datePickerData && !hierarchicalFilter && !sort && !hasFilter && (
                <span data-testid="table-head-title" className={`text-xs font-medium ${classNameTitle}`}>
                  {title}
                </span>
              )}
              {datePickerData && setFilter && filter && (
                <TableHeadDatePickerFilter
                  title={title}
                  classNameTitle={classNameTitle}
                  datePickerData={datePickerData}
                  filter={filter}
                  setFilter={setFilter}
                />
              )}
              {hierarchicalFilter && setFilter && filter && (
                <TableHeadHierarchicalFilter
                  title={title}
                  classNameTitle={classNameTitle}
                  initialData={hierarchicalFilter.initialData}
                  initialSelectedItems={hierarchicalFilter.initialSelectedItems}
                  initialNavigationStack={hierarchicalFilter.initialNavigationStack}
                  initialLevel={hierarchicalFilter.initialLevel}
                  filterKey={hierarchicalFilter.key}
                  onLoadMenusToDisplay={hierarchicalFilter.onLoadMenusToDisplay}
                  onSelectionChange={hierarchicalFilter.onSelectionChange}
                  computeDisplayByLabel={hierarchicalFilter.computeDisplayByLabel}
                  onFilterChange={hierarchicalFilter.onFilterChange}
                  filter={filter}
                  setFilter={setFilter}
                />
              )}

              {hasFilter && data && filter && setFilter && (
                <TableHeadFilter
                  title={title}
                  dataHead={dataHead.filter((head) => head.title === title)[0]}
                  defaultData={data}
                  filter={filter}
                  setFilter={setFilter}
                  classNameTitle={classNameTitle}
                />
              )}
              {sort && data && (
                <TableHeadSort
                  title={title}
                  currentKey={sort.key}
                  data={data}
                  setData={setDataSort}
                  setIsSorted={setIsSorted}
                />
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Table
