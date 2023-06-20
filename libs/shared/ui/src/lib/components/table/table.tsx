import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { TableHeadFilter } from './table-head-filter/table-head-filter'
import TableHeadSort from './table-head-sort/table-head-sort'

export interface TableFilterProps {
  key?: string
  value?: string
}

export interface TableProps<T> {
  children: React.ReactElement
  dataHead: TableHeadProps<T>[]
  className?: string
  classNameHead?: string
  columnsWidth?: string
  data?: T[]
  setFilter?: Dispatch<SetStateAction<TableFilterProps>>
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
  itemContentCustom?: (data: T, currentFilter: string, item?: string) => React.ReactNode
}

export function Table<T>(props: TableProps<T>) {
  const {
    dataHead,
    className = 'bg-white rounded-sm',
    classNameHead = '',
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    children,
    data,
    setFilter,
    setDataSort,
    defaultSortingKey,
  } = props

  const ALL = 'ALL'
  const [currentFilter, setCurrentFilter] = useState(ALL)
  const [isSorted, setIsSorted] = useState(false)

  useEffect(() => {
    if (!isSorted && defaultSortingKey && data && setDataSort) {
      const sortedData = data.sort((a, b) =>
        (a[defaultSortingKey] as string).toLowerCase() > (b[defaultSortingKey] as string).toLowerCase() ? 1 : -1
      )
      setDataSort(sortedData)
    }
  }, [data, defaultSortingKey, isSorted, setDataSort])

  return (
    <div className={className}>
      <div
        data-testid="table-container"
        className={`grid items-center border-b-element-light-lighter-400 border-b sticky top-0 bg-white z-10 h-10 ${classNameHead}`}
        style={{ gridTemplateColumns: columnsWidth }}
      >
        {dataHead.map(({ title, className = 'px-4 py-2', classNameTitle = 'text-text-600 ', filter, sort }, index) => (
          <div key={index} className={className}>
            {!sort && !filter && (
              <span data-testid="table-head-title" className={`text-xs font-medium ${classNameTitle}`}>
                {title}
              </span>
            )}
            {filter && data && setFilter && (
              <TableHeadFilter
                title={title}
                dataHead={dataHead.filter((head) => head.title === title)[0]}
                defaultData={data}
                setFilter={setFilter}
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
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
        ))}
      </div>
      <div>{children}</div>
    </div>
  )
}

export default Table
