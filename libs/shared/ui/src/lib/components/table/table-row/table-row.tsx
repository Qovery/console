import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export interface TableRowProps {
  children: React.ReactElement
  link?: string
  disabled?: boolean
  columnsWidth?: string
  className?: string
  isNew?: boolean
}

export function TableRow(props: TableRowProps) {
  const { children, link, className = '', columnsWidth, disabled } = props
  const [highlighted, setHighlighted] = useState(false)

  const rowClasses = `grid items-center h-14 border-b-element-light-lighter-400 border-b ${
    highlighted
      ? 'bg-element-light-lighter-300 hover:bg-element-light-lighter-400'
      : 'hover:bg-element-light-lighter-200'
  } ${className} ${disabled ? 'pointer-events-none' : ''}`

  useEffect(() => {
    if (props.isNew) {
      setHighlighted(true)
      setTimeout(() => {
        setHighlighted(false)
      }, 10000)
    }
  }, [props.isNew, setHighlighted])

  if (link) {
    return (
      <Link data-testid="row" to={link} className={rowClasses} style={{ gridTemplateColumns: columnsWidth }}>
        {children}
      </Link>
    )
  } else {
    return (
      <div data-testid="row" className={rowClasses} style={{ gridTemplateColumns: columnsWidth }}>
        {children}
      </div>
    )
  }
}

export default TableRow
