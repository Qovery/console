import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { TableHeadFilter } from './table-head-filter/table-head-filter'
import TableHeadSort from './table-head-sort/table-head-sort'

export interface TableProps {
  children: React.ReactElement
  dataHead: TableHeadProps[]
  className?: string
  columnsWidth?: string
  defaultData?: any[]
  filterData?: any[]
  setFilterData?: Dispatch<SetStateAction<any[]>>
  autoscrollToNew?: boolean
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

// we want to activate the auto scroll on creation only after a certain amount of time
// to avoid a bug where the first element of the table is highlighted
const AUTOSCROLL_ENABLED_DELAY = 3000

export function Table(props: TableProps) {
  const {
    dataHead,
    className = 'bg-white rounded-sm',
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    children,
    defaultData,
    filterData,
    setFilterData,
    autoscrollToNew = false,
  } = props

  const ALL = 'ALL'
  const [currentFilter, setCurrentFilter] = useState(ALL)
  const [previousIds, setPreviousIds] = useState(JSON.stringify(defaultData?.map(({ id }) => id)))

  const [autoScrollTimer] = useState<number>(new Date().getTime())

  const scrollToNewEntry = () => {
    const time = new Date().getTime()

    if (autoscrollToNew) {
      const newIds = defaultData?.map(({ id }) => id)
      const parsedPreviousIds = JSON.parse(previousIds)
      const newId = newIds?.find((id) => !parsedPreviousIds?.includes(id))

      if (newId && time - autoScrollTimer > AUTOSCROLL_ENABLED_DELAY) {
        const newRow = document.querySelector(`[data-anchor-scroll="${newId}"]`)
        if (newRow) {
          newRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
          newRow.classList.add('bg-element-light-lighter-300', 'hover:bg-element-light-lighter-400')
          newRow.classList.remove('hover:bg-element-light-lighter-200')
        }
      }

      setPreviousIds(JSON.stringify(newIds))
    }
  }

  useEffect(scrollToNewEntry, [defaultData, autoscrollToNew, previousIds])

  return (
    <div className={className}>
      <div
        data-testid="table-container"
        className="grid items-center border-b-element-light-lighter-400 border-b sticky top-0 bg-white z-10"
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
