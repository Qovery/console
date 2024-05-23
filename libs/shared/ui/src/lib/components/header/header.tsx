import { type ReactNode } from 'react'
import { type IconEnum } from '@qovery/shared/enums'
import { twMerge } from '@qovery/shared/util-js'
import { Heading } from '../heading/heading'
import Icon from '../icon/icon'
import Skeleton from '../skeleton/skeleton'
import Truncate from '../truncate/truncate'

export interface HeaderProps {
  title?: string
  icon?: IconEnum | string
  iconClassName?: string
  buttons?: ReactNode
  copyTitle?: boolean
  copyContent?: string
  actions?: ReactNode
}

export function Header(props: HeaderProps) {
  const { title, icon, buttons, actions, iconClassName } = props

  return (
    <div className="flex shrink-0 items-center justify-between rounded-t border-b border-neutral-200 bg-white px-5 py-6">
      <div className="ml-4 flex items-center gap-5">
        {icon && (
          <div className="flex h-16 w-16 items-center justify-center">
            <Icon name={icon} className={twMerge('w-10', iconClassName)} />
          </div>
        )}
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
