import { TableHeadSort } from '@console/shared/ui'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { TableHeadFilter } from './table-head-filter/table-head-filter'

export interface TableProps {
  children: React.ReactElement
  dataHead: TableHeadProps[]
  className?: string
  columnsWidth?: string
  defaultData?: any[]
  setFilterData?: Dispatch<SetStateAction<any[]>>
}

export interface TableHeadProps {
  title: string
  className?: string
  sort?: boolean
  filter?: {
    key: string
    search?: boolean
    title?: string
  }[]
}

export function Table(props: TableProps) {
  const {
    dataHead,
    className = 'bg-white rounded-sm',
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    children,
    defaultData,
    setFilterData,
  } = props

  const ALL = 'ALL'
  const [currentFilter, setCurrentFilter] = useState(ALL)

  return (
    <div className={className}>
      <div
        data-testid="table-container"
        className="grid items-center border-b-element-light-lighter-400 border-b"
        style={{ gridTemplateColumns: columnsWidth }}
      >
        {dataHead.map(({ title, className = 'px-4 py-2', filter, sort }, index) => (
          <div key={index} className={className}>
            {!sort && !filter && (
              <span data-testid="table-head-title" className="text-text-400 text-xs font-medium">
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
            {sort && defaultData && setFilterData && (
              <TableHeadSort title={title} data={defaultData} setFilterData={setFilterData} />
            )}
          </div>
        ))}
      </div>
      <div>{children}</div>
    </div>
  )
}

export default Table
