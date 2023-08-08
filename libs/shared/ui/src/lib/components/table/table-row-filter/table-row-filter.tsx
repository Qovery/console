import { type PropsWithChildren } from 'react'
import { TableFilterProps } from '../table'
import { ALL } from '../table-head-filter/table-head-filter'

export interface TableRowFilterProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  filter?: TableFilterProps[]
}

export function TableRowFilter({ children, data, filter }: PropsWithChildren<TableRowFilterProps>) {
  const shouldFilter =
    filter &&
    filter.every((tableFilter) => {
      const filterKey = tableFilter.key || ''
      const filterValue = tableFilter.value

      if (filterValue === ALL) {
        return true
      }

      const nestedKeys = filterKey.split('.')
      let nestedData = data

      for (const key of nestedKeys) {
        if (nestedData && Object.prototype.hasOwnProperty.call(nestedData, key)) {
          nestedData = nestedData[key]
        } else {
          return false
        }
      }

      return nestedData === filterValue
    })

  if (!shouldFilter) {
    return null
  }

  return children
}

export default TableRowFilter
