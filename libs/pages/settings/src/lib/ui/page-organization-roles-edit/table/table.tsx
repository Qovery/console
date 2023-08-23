import { type ReactNode } from 'react'
import { Icon, Tooltip } from '@qovery/shared/ui'

export interface TableProps {
  title: string
  children: ReactNode
  headArray: {
    label: string
    tooltip: string
  }[]
  className?: string
}

export function Table(props: TableProps) {
  const { children, title, headArray, className = '' } = props

  return (
    <div className={`border border-neutral-200 border-b-0 rounded text-xs text-neutral-400 ${className}`}>
      <div className="flex h-10 sticky bg-white top-0 z-10 rounded border-neutral-200 border-b">
        <div className="flex items-center w-1/4 h-full flex-auto px-4 font-medium border-r border-neutral-200">
          {title}
        </div>
        {headArray.map((head) => (
          <div
            key={head.label}
            className="flex items-center justify-center h-full flex-1 px-4 font-medium border-r border-neutral-200 last:border-0"
          >
            {head.label}
            <Tooltip align="center" content={head.tooltip}>
              <div className="flex items-center">
                <Icon className="cursor-pointer text-xs ml-1 text-neutral-350" name="icon-solid-circle-info" />
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}

export default Table
