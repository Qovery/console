import React from 'react'
import { TableFilterProps } from '../table'

export interface TableRowFilterProps {
  data: any
  children: React.ReactElement
  filter?: TableFilterProps[]
}

export function TableRowFilter({ children, data, filter }: TableRowFilterProps) {
  const shouldFilter =
    filter &&
    filter.every((tableFilter) => {
      const filterKey = tableFilter.key || ''
      const filterValue = tableFilter.value

      const nestedKeys = filterKey.split('.')
      let nestedData = data

      for (const key of nestedKeys) {
        if (nestedData && nestedData.hasOwnProperty(key)) {
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
