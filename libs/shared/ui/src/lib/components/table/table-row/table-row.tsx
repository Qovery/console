import { type PropsWithChildren, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TableFilterProps } from '../table'
import TableRowFilter from '../table-row-filter/table-row-filter'

export interface TableRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  filter?: TableFilterProps[]
  link?: string
  disabled?: boolean
  columnsWidth?: string
  className?: string
  isNew?: boolean
}

export function TableRow(props: PropsWithChildren<TableRowProps>) {
  const { children, link, className = '', columnsWidth, disabled, data, filter, isNew } = props
  const [highlighted, setHighlighted] = useState(false)

  const rowClasses = `grid items-center h-14 border-b-element-light-lighter-400 border-b ${
    highlighted ? 'bg-zinc-150 hover:bg-element-light-lighter-400' : 'hover:bg-zinc-100'
  } ${className} ${disabled ? 'pointer-events-none' : ''}`

  useEffect(() => {
    if (isNew) {
      setHighlighted(true)
      setTimeout(() => {
        setHighlighted(false)
      }, 10000)
    }
  }, [isNew, setHighlighted])

  return (
    <TableRowFilter data={data} filter={filter}>
      {link ? (
        <Link data-testid="row" to={link} className={rowClasses} style={{ gridTemplateColumns: columnsWidth }}>
          {children}
        </Link>
      ) : (
        <div data-testid="row" className={rowClasses} style={{ gridTemplateColumns: columnsWidth }}>
          {children}
        </div>
      )}
    </TableRowFilter>
  )
}

export default TableRow
