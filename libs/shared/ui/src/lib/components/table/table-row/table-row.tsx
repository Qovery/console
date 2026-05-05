import { type PropsWithChildren, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type TableFilterProps } from '../table'
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

/**
 * @deprecated Prefer TablePrimitives + tanstack-table for type-safety and documentation
 */
export function TableRow(props: PropsWithChildren<TableRowProps>) {
  const { children, link, className = '', columnsWidth, disabled, data, filter, isNew } = props
  const [highlighted, setHighlighted] = useState(false)

  const rowClasses = `grid items-center h-14 border-b-neutral border-b ${
    highlighted ? 'bg-surface-neutral-subtle hover:bg-surface-neutral-component' : 'hover:bg-surface-neutral'
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
