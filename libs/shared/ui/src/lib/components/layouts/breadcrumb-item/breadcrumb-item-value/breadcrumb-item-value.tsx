import { Link } from 'react-router-dom'
import Truncate from '../../../truncate/truncate'

export interface BreadcrumbItemValueProps {
  className?: string
  name: string
  logo?: React.ReactElement
  active?: boolean
  link: string
}

export function BreadcrumbItemValue(props: BreadcrumbItemValueProps) {
  const { className = '', name, logo, active, link } = props

  const notActiveClass = active
    ? 'text-text-700 dark:text-text-100'
    : 'text-text-500 dark:text-text-400 dark:hover:text-text-500 hover:bg-element-light-lighter-300 active:bg-element-light-lighter-400 dark:hover:text-element-light-lighter-600 dark:hover:bg-element-light-darker-100'

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
