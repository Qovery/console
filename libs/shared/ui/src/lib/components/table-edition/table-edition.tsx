import { type ReactNode } from 'react'

export interface TableEditionCell {
  content?: ReactNode | (() => ReactNode)
  className?: string
}

export interface TableEditionRow {
  cells: TableEditionCell[]
  className?: string
}

export interface TableEditionProps {
  tableBody: TableEditionRow[]
  className?: string
}

export function TableEdition(props: TableEditionProps) {
  return (
    <div
      className={`rounded border border-solid border-neutral-200 text-sm text-neutral-400  ${props.className || ''}`}
    >
      {props.tableBody?.map((row, index) => (
        <div
          data-testid="edition-table-row"
          className={`flex min-h-10 border-solid border-neutral-200 hover:bg-neutral-100  ${
            props.tableBody && props.tableBody.length - 1 !== index ? 'border-b' : ''
          } ${row.className || ''}`}
          key={index}
        >
          {row.cells?.map((cell, indexCell) => (
            <div
              data-testid="edition-table-cell"
              key={indexCell}
              className={`flex min-w-0 flex-1 items-center border-solid border-neutral-200 px-4 py-2 ${
                cell.className || ''
              } ${row.cells && row.cells.length - 1 !== indexCell ? 'border-r' : ''}`}
            >
              {typeof cell.content === 'function' ? cell.content() : cell.content}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default TableEdition
