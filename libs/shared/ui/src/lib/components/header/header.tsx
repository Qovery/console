import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { type IconEnum } from '@qovery/shared/enums'
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
  const { title, icon, buttons, actions, iconClassName = '' } = props

  return (
    <div className="flex border-b border-neutral-200 items-center justify-between bg-white rounded-t px-5 py-8 shrink-0">
      <div className="flex gap-5 ml-4 items-center">
        {icon && (
          <div className="flex items-center justify-center w-16 h-16 rounded-full border border-neutral-200">
            <Icon name={icon} className={twMerge('w-10', iconClassName)} />
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center max-w-3xl">
            <Skeleton height={36} width={150} show={!title}>
              <h1 className="font-bold text-neutral-400 text-2xl max-w-3xl truncate">
                {title && <Truncate text={title} truncateLimit={50} />}
              </h1>
            </Skeleton>
          </div>
          {actions && <div className="flex gap-3 items-start">{actions}</div>}
        </div>
      </div>
      {buttons && <div className="flex self-end gap-2">{buttons}</div>}
    </div>
  )
}

export default Header
