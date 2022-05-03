import React, { Dispatch, SetStateAction } from 'react'
import { TableHeadFilter } from '../table-head-filter/table-head-filter'

export interface TableProps {
  dataHead: {
    title: string
    className?: string
    filter?: {
      key: string
      search?: boolean
      title?: string
    }[]
  }[]
  children: React.ReactElement
  className?: string
  columnsWidth?: string
  defaultData?: any[]
  setFilterData?: Dispatch<SetStateAction<any[]>>
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

  return (
    <div className={className}>
      <div
        className="grid items-center border-b-element-light-lighter-400 border-b"
        style={{ gridTemplateColumns: columnsWidth }}
      >
        {dataHead.map(({ title, className = 'px-4 py-2', filter }, index) => (
          <div key={index} className={className}>
            {!filter && <span className="text-text-400 text-xs font-medium">{title}</span>}
            {filter && (
              <TableHeadFilter
                title={title}
                dataHead={dataHead.filter((head) => head.title === title)}
                defaultData={defaultData}
                setFilterData={setFilterData}
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
