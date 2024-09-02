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
    <div
      className={`flex flex-col-reverse rounded border border-b-0 border-neutral-200 text-xs text-neutral-400 ${className}`}
    >
      {children}
      <div className="sticky top-16 flex h-10 rounded border-b border-neutral-200 bg-white">
        <div className="flex h-full w-1/4 flex-auto items-center border-r border-neutral-200 px-4 font-medium">
          {title}
        </div>
        {headArray.map((head) => (
          <div
            key={head.label}
            className="flex h-full flex-1 items-center justify-center border-r border-neutral-200 px-4 font-medium last:border-0"
          >
            {head.label}
            <Tooltip align="center" content={head.tooltip}>
              <div className="flex items-center">
                <Icon
                  className="ml-1 cursor-pointer text-xs text-neutral-350"
                  iconName="circle-info"
                  iconStyle="regular"
                />
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Table
