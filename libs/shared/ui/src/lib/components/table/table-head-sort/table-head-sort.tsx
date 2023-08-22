import { Dispatch, SetStateAction, useState } from 'react'
import Icon from '../../icon/icon'

export interface TableHeadSortProps<T> {
  title: string
  data: T[]
  currentKey: string
  setData: Dispatch<SetStateAction<T[]>> | undefined
  setIsSorted: Dispatch<SetStateAction<boolean>>
}

export function sortTable<T>(data: T[], key: string) {
  return [...data].sort((a, b) => +new Date(b[key as keyof T] as string) - +new Date(a[key as keyof T] as string))
}

export function TableHeadSort<T>(props: TableHeadSortProps<T>) {
  const { title, data, setData, currentKey, setIsSorted } = props
  const [isSort, setIsSort] = useState(false)

  const toggleSort = () => {
    if (currentKey && setData) {
      setIsSort(!isSort)
      setIsSorted(true)
      const dataSort = sortTable(data, currentKey)
      if (isSort) {
        setData(dataSort)
      } else {
        setData(dataSort.reverse())
      }
    }
  }

  return (
    <div
      data-testid="table-head-sort"
      className={`text-xs font-medium select-none cursor-pointer transition-color transition-timing duration-100 hover:text-zinc-400 ${
        isSort ? 'text-zinc-400' : 'text-zinc-400'
      }`}
      onClick={() => toggleSort()}
    >
      {title}
      <Icon
        name="icon-solid-arrow-down"
        className={`ml-1 text-2xs inline-block transition-transform ease-out duration-100 ${
          isSort ? 'rotate-180' : ''
        }`}
      />
    </div>
  )
}

export default TableHeadSort
