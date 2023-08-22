import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Truncate } from '@qovery/shared/ui'

export interface BreadcrumbItemValueProps {
  className?: string
  name: string
  logo?: ReactElement
  active?: boolean
  link: string
}

export function BreadcrumbItemValue(props: BreadcrumbItemValueProps) {
  const { className = '', name, logo, active, link } = props

  const notActiveClass = active
    ? 'text-zinc-400 dark:text-zinc-50'
    : 'text-zinc-400 dark:text-zinc-350 dark:hover:text-zinc-400 hover:bg-zinc-150 active:bg-zinc-200 dark:hover:text-element-light-lighter-600 dark:hover:bg-zinc-500'

  const limit = 50
  const truncatedName = name?.length > limit ? <Truncate delayDuration={400} truncateLimit={50} text={name} /> : name

  return (
    <div
      data-testid="breadcrumb-item-value"
      className={`${className} flex items-center text-sm font-medium gap-2 px-2 h-6 rounded-full ${notActiveClass}`}
    >
      {logo}

      {active ? truncatedName : <Link to={link}>{truncatedName}</Link>}
    </div>
  )
}

export default BreadcrumbItemValue
