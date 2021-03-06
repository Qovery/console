import { Dispatch, SetStateAction, useState } from 'react'
import { Icon } from '@console/shared/ui'

export interface TableHeadSortProps {
  title: string
  data: any[]
  currentKey: string
  setFilterData: Dispatch<SetStateAction<any[]>>
}

export const sortTable = (data: any[], key: string) => [...data].sort((a, b) => +new Date(b[key]) - +new Date(a[key]))

export function TableHeadSort(props: TableHeadSortProps) {
  const { title, data, setFilterData, currentKey } = props
  const [isSort, setIsSort] = useState(false)

  const toggleSort = () => {
    if (currentKey) {
      setIsSort(!isSort)
      const dataSort = sortTable(data, currentKey)
      if (isSort) {
        setFilterData(dataSort)
      } else {
        setFilterData(dataSort.reverse())
      }
    }
  }

  return (
    <div
      data-testid="table-head-sort"
      className={`text-xs font-medium select-none cursor-pointer transition-color transition-timing duration-100 hover:text-text-500 ${
        isSort ? 'text-text-500' : 'text-text-400'
      }`}
      onClick={() => toggleSort()}
    >
      {title}
      <Icon
        name="icon-solid-arrow-down"
        className={`ml-1 inline-block transition-transform ease-out duration-100 ${isSort ? 'rotate-180' : ''}`}
      />
    </div>
  )
}

export default TableHeadSort
