export interface TableEditionCell {
  content?: React.ReactNode
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
      className={`border border-solid border-element-light-lighter-400 rounded text-sm text-text-500  ${
        props.className || ''
      }`}
    >
      {props.tableBody?.map((row, index) => (
        <div
          data-testid="edition-table-row"
          className={`flex h-10 border-solid border-element-light-lighter-400 hover:bg-element-light-lighter-200  ${
            props.tableBody && props.tableBody.length - 1 !== index ? 'border-b' : ''
          } ${row.className || ''}`}
          key={index}
        >
          {row.cells?.map((cell, indexCell) => (
            <div
              data-testid="edition-table-cell"
              key={indexCell}
              className={`flex-1 min-w-0 border-element-light-lighter-400 border-solid items-center flex px-4 py-2 ${
                cell.className || ''
              } ${row.cells && row.cells.length - 1 !== indexCell ? 'border-r' : ''}`}
            >
              {cell.content}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default TableEdition
