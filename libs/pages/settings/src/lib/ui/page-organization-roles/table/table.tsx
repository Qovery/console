import { ReactNode } from 'react'

export interface TableProps {
  title: string
  children: ReactNode
  headArray: string[]
  className?: string
}

export function Table(props: TableProps) {
  const { children, title, headArray, className = '' } = props

  return (
    <div className={`border border-element-light-lighter-400 border-b-0 rounded text-xs text-text-600 ${className}`}>
      <div className="flex h-10 sticky bg-white top-0 z-10 rounded border-element-light-lighter-400 border-b">
        <div className="flex items-center w-1/4 h-full flex-auto px-4 font-medium border-r border-element-light-lighter-400">
          {title}
        </div>
        {headArray.map((head) => (
          <div
            key={head}
            className="flex items-center justify-center h-full flex-1 px-4 font-medium border-r border-element-light-lighter-400 last:border-0"
          >
            {head}
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}

export default Table
