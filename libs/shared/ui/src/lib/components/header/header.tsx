import { type PropsWithChildren, type ReactNode } from 'react'
import { Heading } from '../heading/heading'
import Skeleton from '../skeleton/skeleton'
import Truncate from '../truncate/truncate'

export interface HeaderProps extends PropsWithChildren {
  title?: string
  buttons?: ReactNode
  actions?: ReactNode
}

export function Header({ title, buttons, actions, children }: HeaderProps) {
  return (
    <div className="flex min-h-[125px] shrink-0 items-center justify-between rounded-t border-b border-neutral-200 bg-white px-5 py-6">
      <div className="ml-4 flex items-center gap-5">
        {children}
        <div className="flex flex-col gap-3">
          <div className="flex max-w-3xl items-center gap-2">
            <Skeleton height={28} width={150} show={!title}>
              <Heading>{title && <Truncate text={title} truncateLimit={50} />}</Heading>
            </Skeleton>
          </div>
          {actions && <div className="flex items-start gap-3">{actions}</div>}
        </div>
      </div>
      {buttons && <div className="flex gap-2 self-end">{buttons}</div>}
    </div>
  )
}

export default Header
