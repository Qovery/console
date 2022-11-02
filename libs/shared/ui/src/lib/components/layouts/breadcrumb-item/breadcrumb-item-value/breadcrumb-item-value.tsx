import { Link } from 'react-router-dom'

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

  return (
    <div
      className={`${className} flex items-center  text-sm font-medium gap-2 px-2 h-6 rounded-full ${notActiveClass}`}
    >
      {logo}
      {active ? <span>{name}</span> : <Link to={link}>{name}</Link>}
    </div>
  )
}

export default BreadcrumbItemValue
