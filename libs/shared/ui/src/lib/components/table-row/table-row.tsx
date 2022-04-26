import React from 'react'
import { Link } from 'react-router-dom'

export interface TableRowProps {
  children: React.ReactElement
  dataHead: Array<any>
  link: string
  columnsWidth?: string
}

export function TableRow(props: TableRowProps) {
  const { children, dataHead, columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`, link } = props

  return (
    <Link
      to={link}
      className="grid items-center h-14 border-b-element-light-lighter-400 border-b last:border-0 hover:bg-element-light-lighter-300"
      style={{ gridTemplateColumns: columnsWidth }}
    >
      {children}
    </Link>
  )
}

export default TableRow
