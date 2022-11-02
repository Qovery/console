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
    ? 'text-text-800'
    : 'text-text-600 hover:bg-element-light-lighter-400 active:bg-element-light-lighter-500'

  const limit = 50
  const truncatedName = name.length > limit ? <Truncate delayDuration={400} truncateLimit={50} text={name} /> : name

  return (
    <div
      className={`${className} flex items-center  text-sm font-medium gap-2 px-2 h-6 rounded-full ${notActiveClass}`}
    >
      {logo}

      {active ? truncatedName : <Link to={link}>{truncatedName}</Link>}
    </div>
  )
}

export default BreadcrumbItemValue
