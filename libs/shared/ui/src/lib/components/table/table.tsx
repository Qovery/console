import React, { Dispatch, SetStateAction, useState } from 'react'
import { TableHeadFilter } from './table-head-filter/table-head-filter'
import TableHeadSort from './table-head-sort/table-head-sort'

export interface TableProps {
  children: React.ReactElement
  dataHead: TableHeadProps[]
  className?: string
  classNameHead?: string
  columnsWidth?: string
  defaultData?: any[]
  filterData?: any[]
  setFilterData?: Dispatch<SetStateAction<any[]>>
}

export interface TableHeadProps {
  title: string
  className?: string
  filter?: {
    key: string
    search?: boolean
    title?: string
  }[]
  sort?: {
    key: string
  }
}

export function Table(props: TableProps) {
  const {
    dataHead,
    className = 'bg-white rounded-sm',
    classNameHead = '',
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    children,
    defaultData,
    filterData,
    setFilterData,
  } = props

  const ALL = 'ALL'
  const [currentFilter, setCurrentFilter] = useState(ALL)

  return (
    <div className={className}>
      <div
        data-testid="table-container"
        className={`grid items-center border-b-element-light-lighter-400 border-b sticky top-0 bg-white z-10 ${classNameHead}`}
        style={{ gridTemplateColumns: columnsWidth }}
      >
        {dataHead.map(({ title, className = 'px-4 py-2', filter, sort }, index) => (
          <div key={index} className={className}>
            {!sort && !filter && (
              <span data-testid="table-head-title" className="text-text-600 text-xs font-medium">
                {title}
              </span>
            )}
            {filter && defaultData && setFilterData && (
              <TableHeadFilter
                title={title}
                dataHead={dataHead.filter((head) => head.title === title)}
                defaultData={defaultData}
                setFilterData={setFilterData}
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
              />
            )}
            {sort && filterData && setFilterData && (
              <TableHeadSort title={title} currentKey={sort.key} data={filterData} setFilterData={setFilterData} />
            )}
          </div>
        ))}
      </div>
      <div>{children}</div>
    </div>
  )
}

export default Table
