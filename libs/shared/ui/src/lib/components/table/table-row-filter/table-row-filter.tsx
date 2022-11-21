import React from 'react'
import { TableFilterProps } from '../table'

export interface TableRowFilterProps {
  data: any
  children: React.ReactElement
  filter?: TableFilterProps
}

export function TableRowFilter(props: TableRowFilterProps) {
  const { children, data, filter } = props

  if (filter) {
    if (filter.key?.includes('.')) {
      // detect children of children
      const splitProperty = filter.key.split('.')
      if (data[splitProperty[0]] && data[splitProperty[0]][splitProperty[1]] !== filter?.value) return null
    } else if (data[filter?.key || ''] !== filter.value) {
      return null
    }
  }

  return children
}

export default TableRowFilter
