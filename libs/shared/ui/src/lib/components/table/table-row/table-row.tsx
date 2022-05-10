import React from 'react'
import { Link } from 'react-router-dom'

export interface TableRowProps {
  children: React.ReactElement
  link: string
  columnsWidth?: string
  className?: string
}

export function TableRow(props: TableRowProps) {
  const { children, link, className = '', columnsWidth } = props

  return (
    <Link
      data-testid="row"
      to={link}
      className={`grid items-center h-14 border-b-element-light-lighter-400 border-b last:border-0 hover:bg-element-light-lighter-200 ${className}`}
      style={{ gridTemplateColumns: columnsWidth }}
    >
      {children}
    </Link>
  )
}

export default TableRow
