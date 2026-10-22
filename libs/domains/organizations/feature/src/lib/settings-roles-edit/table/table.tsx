import { type ReactNode } from 'react'
import { Icon, Tooltip } from '@qovery/shared/ui'
import { REMOTE_ACCESS_COLUMN_CLASS_NAME } from '../utils/remote-access'

export interface TableHead {
  label: string
  tooltip: string
  // consecutive heads sharing a group are displayed under a common label
  group?: string
}

export interface TableProps {
  title: string
  children: ReactNode
  headArray: TableHead[]
  className?: string
}

function HeadCell({ head, sizeClassName = 'flex-1' }: { head: TableHead; sizeClassName?: string }) {
  return (
    <div
      className={`flex h-full items-center justify-center border-r border-neutral px-4 font-medium last:border-0 ${sizeClassName}`}
    >
      {head.label}
      <Tooltip align="center" content={head.tooltip}>
        <div className="flex items-center">
          <Icon
            className="ml-1 cursor-pointer text-xs text-neutral-subtle"
            iconName="circle-info"
            iconStyle="regular"
          />
        </div>
      </Tooltip>
    </div>
  )
}

// Group consecutive heads by their group label, a head without group being its own segment
const toSegments = (headArray: TableHead[]) =>
  headArray.reduce<{ group?: string; heads: TableHead[] }[]>((segments, head) => {
    const lastSegment = segments[segments.length - 1]
    if (head.group && lastSegment?.group === head.group) {
      lastSegment.heads.push(head)
    } else {
      segments.push({ group: head.group, heads: [head] })
    }
    return segments
  }, [])

export function Table(props: TableProps) {
  const { children, title, headArray, className = '' } = props
  const segments = toSegments(headArray)
  const hasGroup = segments.some((segment) => segment.group)

  return (
    <div
      className={`flex flex-col-reverse rounded border border-neutral bg-surface-neutral text-xs text-neutral ${className}`}
    >
      {children}
      <div
        className={`sticky top-11 flex rounded-t border-b border-neutral bg-surface-neutral ${hasGroup ? 'h-16' : 'h-10'}`}
      >
        <div className="flex h-full w-1/4 flex-auto items-center border-r border-neutral px-4 font-medium">{title}</div>
        {segments.map((segment) =>
          segment.group ? (
            <div
              key={segment.group}
              data-testid={`head-group-${segment.group}`}
              className="flex h-full flex-none flex-col bg-surface-neutral-subtle"
            >
              <div className="flex h-6 items-center justify-center border-b border-neutral font-medium">
                {segment.group}
              </div>
              <div className="flex flex-1">
                {segment.heads.map((head) => (
                  <HeadCell key={head.label} head={head} sizeClassName={REMOTE_ACCESS_COLUMN_CLASS_NAME} />
                ))}
              </div>
            </div>
          ) : (
            <HeadCell key={segment.heads[0].label} head={segment.heads[0]} />
          )
        )}
      </div>
    </div>
  )
}

export default Table
