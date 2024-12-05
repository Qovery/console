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
    ? 'text-neutral-400 dark:text-neutral-50'
    : 'text-neutral-400 dark:text-neutral-350 dark:hover:text-neutral-50 hover:bg-neutral-150 active:bg-neutral-200 dark:hover:text-neutral-300 dark:hover:bg-neutral-500'

  const limit = 50
  const truncatedName = name?.length > limit ? <Truncate delayDuration={400} truncateLimit={50} text={name} /> : name

  return (
    <div
      data-testid="breadcrumb-item-value"
      className={`${className} flex h-6 items-center gap-2 truncate rounded-full px-2 text-sm font-medium ${notActiveClass}`}
    >
      {logo}

      {active ? truncatedName : <Link to={link}>{truncatedName}</Link>}
    </div>
  )
}

export default BreadcrumbItemValue
