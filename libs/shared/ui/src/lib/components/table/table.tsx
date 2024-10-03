import { type Dispatch, type ReactNode, type SetStateAction, useEffect, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { TableHeadFilter } from './table-head-filter/table-head-filter'
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
}

export interface TableHeadCustomFilterProps<T> {
  key: string
  search?: boolean
  title?: string
  itemsCustom?: string[]
  itemContentCustom?: (data: T, currentFilter: string, item?: string) => ReactNode
  hideFilterNumber?: boolean
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
            { title, className = 'px-4 py-2', classNameTitle = 'text-neutral-400 ', filter: hasFilter, sort },
            index
          ) => (
            <div key={index} className={className}>
              {!sort && !hasFilter && (
                <span data-testid="table-head-title" className={`text-xs font-medium ${classNameTitle}`}>
                  {title}
                </span>
              )}
              {hasFilter && data && filter && setFilter && (
                <TableHeadFilter
                  title={title}
                  dataHead={dataHead.filter((head) => head.title === title)[0]}
                  defaultData={data}
                  filter={filter}
                  setFilter={setFilter}
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
