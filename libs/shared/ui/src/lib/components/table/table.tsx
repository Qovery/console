import React from 'react'

export interface TableProps {
  dataHead: Array<any>
  className?: string
  columnsWidth?: string
  children: React.ReactElement
}

export function Table(props: TableProps) {
  const {
    dataHead,
    className = 'bg-white rounded-sm',
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    children,
  } = props

  return (
    <div className={className}>
      <div
        className="grid items-center border-b-element-light-lighter-400 border-b"
        style={{ gridTemplateColumns: columnsWidth }}
      >
        {dataHead.map(({ title, className = 'px-4 py-2' }, index) => (
          <div key={index} className={className}>
            <span className="text-text-400 text-xs font-medium">{title}</span>
          </div>
        ))}
      </div>
      <div>{children}</div>
    </div>
  )
}

export default Table
